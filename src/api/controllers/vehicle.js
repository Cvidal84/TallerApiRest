const Vehicle = require("../models/vehicle");

// GET: Obtener vehículos con BUSQUEDA Y PAGINAS (=clients)
const getVehicles = async (req, res, next) => {

  /* REVISAR SI QUEREMOS TAMBIEN PODER BUSCAR POR EL NOMBRE DE CLIENTE!!! */
  try {
    let { search, page = 1, limit = 10 } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;
    let filter = {};
    if (search) {
      filter = {
        $or: [
          { plate: { $regex: search, $options: "i" } },
          { brand: { $regex: search, $options: "i" } },
          { model: { $regex: search, $options: "i" } },
        ],
      };
    }
    const collationOptions = { locale: "es", strength: 1 };
    const [vehicles, total] = await Promise.all([
      Vehicle.find(filter)
        .collation(collationOptions)
        .populate("clientId", "name email")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
      Vehicle.countDocuments(filter).collation(collationOptions),
    ]);
    return res.status(200).json({
      vehicles,
      pagination: {
        totalData: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit: limit,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error buscando los vehículos ❌" });
  }
};

const getVehicleByPlate = async (req, res, next) => {
  try {
    const { plate } = req.params;
    if (!plate) {
      return res.status(400).json({ error: "Debes enviar una matrícula ⚠️" });
    }
    const cleanPlate = plate.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const vehicle = await Vehicle.findOne({ plate: cleanPlate }).populate(
      "clientId",
      "name"
    );
    if (!vehicle) {
      return res.status(404).json({ error: "Vehículo no encontrado ⚠️" });
    }
    return res.status(200).json(vehicle);
  } catch (error) {
    return res.status(500).json({ error: "Error en la búsqueda ❌" });
  }
};

const getVehicleByClientId = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    const vehicles = await Vehicle.find({ clientId });
    if (!vehicles || vehicles.length === 0) {
      return res
        .status(404)
        .json({ error: "Este cliente no tiene vehículos registrados ⚠️" });
    }
    return res.status(200).json(vehicles);
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "ID de cliente inválido ⚠️" });
    }
    return res
      .status(500)
      .json({ error: "Error al buscar vehículos del cliente ❌" });
  }
};

const postVehicle = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Faltan datos del vehículo ⚠️" });
    }
    const newVehicle = new Vehicle(req.body);
    const vehicleSaved = await newVehicle.save();
    return res.status(201).json({
      message: "Vehículo creado con éxito ✅",
      vehicle: vehicleSaved,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Datos de vehículo inválidos ⚠️" });
    }
    if (error.code === 11000) {
      return res.status(409).json({ error: "La matrícula ya existe ⚠️" });
    }
    return res.status(500).json({ error: "Error al crear el vehículo ❌" });
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { _id, ...data } = req.body;
    const vehicleUpdated = await Vehicle.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!vehicleUpdated) {
      return res.status(404).json({ error: "Vehículo no encontrado ⚠️" });
    }
    return res.status(200).json({
      message: "Vehículo actualizado ✅",
      vehicle: vehicleUpdated,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res
        .status(400)
        .json({ error: error.message || "Datos inválidos ⚠️" });
    }
    if (error.code === 11000) {
      return res.status(409).json({ error: "La matrícula ya existe ⚠️" });
    }
    return res
      .status(500)
      .json({ error: "Error al actualizar el vehículo ❌" });
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicleDeleted = await Vehicle.findByIdAndDelete(id);
    if (!vehicleDeleted) {
      return res.status(404).json({ error: "Vehículo no encontrado ⚠️" });
    }
    return res.status(200).json({
      message: "Vehículo eliminado ✅",
      vehicle: vehicleDeleted,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "ID inválido ⚠️" });
    }
    return res.status(500).json({ error: "Error al eliminar el vehículo ❌" });
  }
};

module.exports = {
  getVehicles,
  getVehicleByPlate,
  getVehicleByClientId,
  postVehicle,
  updateVehicle,
  deleteVehicle,
};
