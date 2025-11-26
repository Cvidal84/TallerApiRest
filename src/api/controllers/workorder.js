const Workorder = require("../models/workorder");
const Client = require("../models/client");
const Vehicle = require("../models/vehicle");

// Listar con paginación y búsqueda ---
const getWorkorders = async (req, res, next) => {
  try {
    let { search, page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { "snapshot.clientName": { $regex: search, $options: "i" } },
          { "snapshot.vehiclePlate": { $regex: search, $options: "i" } },
          { status: { $regex: search, $options: "i" } },
          { paymentStatus: { $regex: search, $options: "i" } },
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

      Workorder.countDocuments(filter).collation(collationOptions),
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
    return res
      .status(500)
      .json({ error: "Error buscando órdenes de trabajo ❌" });
  }
};

const getWorkorderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const workorder = await Workorder.findById(id)
      .populate("clientId")
      .populate("vehicleId")
      .populate("mechanicId")
      .populate("createdBy", "email");

    if (!workorder) {
      return res
        .status(404)
        .json({ error: "Orden de trabajo no encontrada ⚠️" });
    }
    return res.status(200).json(workorder);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "ID de orden inválido ⚠️" });
    }
    return res.status(500).json({ error: "Error obteniendo la orden ❌" });
  }
};

const getWorkordersByClientId = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const workorders = await Workorder.find({ clientId })
      .populate("vehicleId", "plate model")
      .sort({ createdAt: -1 });

    return res.status(200).json(workorders);
  } catch (error) {
    return res
      .status(500)
      .json({ error: "Error obteniendo historial del cliente ❌" });
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
    return res
      .status(500)
      .json({ error: "Error obteniendo historial del vehículo ❌" });
  }
};

const postWorkorder = async (req, res, next) => {
  try {
    // Validar que hay cuerpo
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Faltan datos de la orden ⚠️" });
    }

    const { clientId, vehicleId, mechanicId, createdBy, kms, items } = req.body;

    // 1. Validar existencias
    const client = await Client.findById(clientId);
    if (!client)
      return res.status(404).json({ error: "Cliente no encontrado ⚠️" });

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle)
      return res.status(404).json({ error: "Vehículo no encontrado ⚠️" });

    // 2. Lógica de Kilómetros: Actualizar ficha del coche
    // Si no mandan kms, usamos los que ya tenía el coche.
    let currentKms = kms ? parseInt(kms) : vehicle.km;

    if (kms && parseInt(kms) > vehicle.km) {
      // Solo actualizamos si ha sumado kilómetros
      vehicle.km = parseInt(kms);
      await vehicle.save();
    }

    // 3. Calcular costes iniciales (si vienen items)
    let calculatedFinalCost = 0;
    if (items && Array.isArray(items)) {
      calculatedFinalCost = items.reduce((acc, item) => {
        return acc + item.quantity * item.price;
      }, 0);
    }

    // 4. Crear la orden con SNAPSHOT
    const newWorkorder = new Workorder({
      ...req.body,
      finalCost: req.body.finalCost || calculatedFinalCost, // Usamos el calculado si no envían uno fijo
      snapshot: {
        clientName: client.name,
        vehiclePlate: vehicle.plate,
        vehicleModel: vehicle.model,
        kms: currentKms,
      },
    });

    const workorderSaved = await newWorkorder.save();

    return res.status(201).json({
      message: "Orden de trabajo creada ✅",
      workorder: workorderSaved,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Datos inválidos en la orden ⚠️" });
    }
    console.error(error);
    return res.status(500).json({ error: "Error al crear la orden ❌" });
  }
};

const updateWorkorder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // 1. Buscamos el documento (sin lean, necesitamos que sea instancia de Mongoose)
    const workorder = await Workorder.findById(id);

    if (!workorder) {
      return res.status(404).json({ error: "Orden no encontrada ⚠️" });
    }

    // 2. Actualizamos manualmente los campos enviados
    Object.keys(updates).forEach((key) => {
      // Protegemos campos delicados si es necesario (ej: no dejar cambiar _id)
      if (key !== "_id" && key !== "createdAt") {
        workorder[key] = updates[key];
      }
    });

    // Si se modifican los items, recalculamos el coste (opcional, pero recomendado)
    if (updates.items) {
      const newTotal = workorder.items.reduce(
        (acc, item) => acc + item.quantity * item.price,
        0
      );
      workorder.finalCost = newTotal;
    }

    // 3. Guardamos -> AQUÍ SE DISPARA EL HOOK pre('save') para las fechas completedDate/paidDate
    const workorderUpdated = await workorder.save();

    return res.status(200).json({
      message: "Orden actualizada ✅",
      workorder: workorderUpdated,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res
        .status(400)
        .json({ error: "Datos de actualización inválidos ⚠️" });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ error: "ID de orden inválido ⚠️" });
    }
    console.error(error);
    return res.status(500).json({ error: "Error actualizando la orden ❌" });
  }
};

const deleteWorkorder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Workorder.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: "Orden no encontrada ⚠️" });
    }

    return res.status(200).json({
      message: "Orden eliminada correctamente ✅",
      workorder: deleted,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "ID inválido ⚠️" });
    }
    return res.status(500).json({ error: "Error eliminando la orden ❌" });
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
