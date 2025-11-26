const Workorder = require("../models/workorder");
const Client = require("../models/client");
const Vehicle = require("../models/vehicle");
const unaccent = require("../../utils/unaccent");

// --- HELPER: Función para sumar precios de los items ---
const calculateTotal = (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) return 0;

  return items.reduce((acc, item) => {
    // BLINDAJE: Si no viene cantidad, asumimos 1. Si no viene precio, asumimos 0.
    const quantity = item.quantity !== undefined ? item.quantity : 1;
    const price = item.price !== undefined ? item.price : 0;

    return acc + quantity * price;
  }, 0);
};

const getWorkorders = async (req, res, next) => {
  try {
    let { search, page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    let filter = {};

    if (search) {
      const searchPattern = unaccent(search);
      const regex = new RegExp(searchPattern, "i");
      filter = {
        $or: [
          { "snapshot.clientName": regex },
          { "snapshot.vehiclePlate": regex },
          { status: regex },
          { paymentStatus: regex },
        ],
      };
    }

    const collationOptions = { locale: "es", strength: 1 };
    const [workorders, total] = await Promise.all([
      Workorder.find(filter)
        .populate("clientId", "name email telephone")
        .populate("vehicleId", "plate model brand")
        .populate("mechanicId", "name")
        .populate("createdBy", "email")
        .collation(collationOptions)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Workorder.countDocuments(filter),
    ]);

    return res.status(200).json({
      workorders,
      pagination: {
        totalData: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit: limit,
      },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ error: "Error buscando órdenes de trabajo ❌" });
  }
};

// --- GET: Por ID ---
const getWorkorderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workorder = await Workorder.findById(id)
      .populate("clientId")
      .populate("vehicleId")
      .populate("mechanicId")
      .populate("createdBy", "email");

    if (!workorder) {
      return res.status(404).json({ error: "Orden no encontrada ⚠️" });
    }
    return res.status(200).json(workorder);
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ error: "ID inválido ⚠️" });
    return res.status(500).json({ error: "Error obteniendo la orden ❌" });
  }
};

// --- POST: Crear Orden ---
const postWorkorder = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Faltan datos de la orden ⚠️" });
    }

    const { clientId, vehicleId, mechanicId, kms, items, estimatedCost } =
      req.body;

    // 1. Obtener Usuario del Token
    const loggedUserId = req.user ? req.user._id || req.user.id : null;
    if (!loggedUserId) {
      return res.status(401).json({ error: "No autorizado 🚫" });
    }

    // 2. Validaciones
    const client = await Client.findById(clientId);
    if (!client)
      return res.status(404).json({ error: "Cliente no encontrado ⚠️" });

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle)
      return res.status(404).json({ error: "Vehículo no encontrado ⚠️" });

    // 3. Lógica de Kms (CORREGIDO: 'kms' en plural)
    // Usamos vehicle.kms porque así se llama en tu modelo Vehicle
    let currentKms = kms ? parseInt(kms) : vehicle.kms;

    if (kms && parseInt(kms) > vehicle.kms) {
      vehicle.kms = parseInt(kms);
      await vehicle.save();
    }

    // 4. Calcular Costes Automáticamente
    const totalItemsCost = calculateTotal(items);

    // 5. Crear la orden
    const newWorkorder = new Workorder({
      ...req.body, // Incluye description, items, etc.
      createdBy: loggedUserId,
      finalCost: totalItemsCost, // Guardamos la suma real
      estimatedCost: estimatedCost || totalItemsCost, // Si no hay presupuesto manual, usamos la suma
      snapshot: {
        clientName: client.name,
        vehiclePlate: vehicle.plate,
        kms: currentKms,
      },
    });

    const workorderSaved = await newWorkorder.save();

    return res.status(201).json({
      message: "Orden de trabajo creada ✅",
      workorder: workorderSaved,
    });
  } catch (error) {
    if (error.name === "ValidationError")
      return res
        .status(400)
        .json({ error: "Datos inválidos ⚠️", details: error.message });
    console.error(error);
    return res.status(500).json({ error: "Error al crear la orden ❌" });
  }
};

// --- PUT: Actualizar Orden ---
// --- PUT: Actualizar Orden ---
const updateWorkorder = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Extraemos 'kms' y 'items' para tratarlos de forma especial
    const { kms, items, ...otherUpdates } = req.body;

    const workorder = await Workorder.findById(id);
    if (!workorder)
      return res.status(404).json({ error: "Orden no encontrada ⚠️" });

    // --- 1. LÓGICA ESPECIAL PARA KILÓMETROS ---
    if (kms) {
      const newKms = parseInt(kms);

      // A) Actualizamos la ficha del vehículo (si es necesario)
      const vehicle = await Vehicle.findById(workorder.vehicleId);
      if (vehicle) {
        // Solo actualizamos el coche si los nuevos kms son mayores (opcional, pero recomendado)
        // O si prefieres corregir un error, quita el 'if' y actualiza siempre.
        if (newKms > vehicle.kms) {
          vehicle.kms = newKms;
          await vehicle.save();
        }
      }

      // B) Actualizamos el dato dentro del snapshot de la orden
      workorder.snapshot.kms = newKms;
    }

    // --- 2. LÓGICA ESPECIAL PARA ITEMS (Recálculo de precio) ---
    if (items) {
      workorder.items = items; // Actualizamos los items
      // Recalculamos el coste final automáticamente
      workorder.finalCost = calculateTotal(items);
    }

    Object.keys(otherUpdates).forEach((key) => {
      // Protegemos campos críticos que no se deben tocar
      if (
        key !== "_id" &&
        key !== "createdAt" &&
        key !== "createdBy" &&
        key !== "snapshot"
      ) {
        workorder[key] = otherUpdates[key];
      }
    });

    const workorderUpdated = await workorder.save();

    return res.status(200).json({
      message: "Orden actualizada ✅",
      workorder: workorderUpdated,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError")
      return res.status(400).json({ error: "Datos inválidos ⚠️" });
    return res.status(500).json({ error: "Error actualizando ❌" });
  }
};

// --- DELETE ---
const deleteWorkorder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Workorder.findByIdAndDelete(id);

    if (!deleted)
      return res.status(404).json({ error: "Orden no encontrada ⚠️" });

    return res.status(200).json({
      message: "Orden eliminada ✅",
      workorder: deleted,
    });
  } catch (error) {
    if (error.name === "CastError")
      return res.status(400).json({ error: "ID inválido ⚠️" });
    return res.status(500).json({ error: "Error eliminando ❌" });
  }
};

// --- Helpers Frontend ---
const getWorkordersByClientId = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const workorders = await Workorder.find({ clientId })
      .populate("vehicleId", "plate model")
      .sort({ createdAt: -1 });
    return res.status(200).json(workorders);
  } catch (error) {
    return res.status(500).json({ error: "Error historial cliente ❌" });
  }
};

const getWorkordersByVehicleId = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;
    const workorders = await Workorder.find({ vehicleId }).sort({
      createdAt: -1,
    });
    return res.status(200).json(workorders);
  } catch (error) {
    return res.status(500).json({ error: "Error historial vehículo ❌" });
  }
};

module.exports = {
  getWorkorders,
  getWorkorderById,
  getWorkordersByClientId,
  getWorkordersByVehicleId,
  postWorkorder,
  updateWorkorder,
  deleteWorkorder,
};
