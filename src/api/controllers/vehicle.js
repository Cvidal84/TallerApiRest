const Vehicle = require("../models/vehicle");

const getVehicles = async (req, res, next) => {
  try {
    const vehicles = await Vehicle.find();
    return res.status(200).json(vehicles);
  } catch (error) {
    return res.status(500).json({ error: "Error obteniendo los vehículos" });
  }
};

const getVehicleByPlate = async (req, res, next) => {
  try {
    const { plate } = req.params;
    if (!plate) {
      return res
        .status(400)
        .json({ error: "Debes enviar una matrícula que esté registrada" });
    }
    const vehicle = await Vehicle.findOne({
      plate: { $regex: `^${plate}$`, $options: "i" },
    });
    if (!vehicle) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }
    return res.status(200).json(vehicle);
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ error: "La solicitud contiene datos inválidos" });
    }
    return res.status(500).json({ error: "Error en la búsqueda" });
  }
};

const getVehicleByClientId = async (req, res, next) => {
  try {
    const { clientId } = req.params;
    if (!clientId) {
      return res.status(400).json({ error: "Debes enviar un ID de cliente" });
    }
    const vehicles = await Vehicle.find({ clientId });
    if (vehicles.length === 0) {
      return res
        .status(404)
        .json({ error: "Este cliente no tiene vehículos registrados" });
    }
    return res.status(200).json(vehicles);
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ error: "La solicitud contiene datos inválidos" });
    }
    return res
      .status(500)
      .json({ error: "Error al buscar vehículos del cliente" });
  }
};

const postVehicle = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Faltan datos del vehículo" });
    }
    const newVehicle = new Vehicle(req.body);
    const vehicleSaved = await newVehicle.save();
    return res.status(201).json({
      message: "Vehículo creado con éxito",
      vehiculo: vehicleSaved,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Datos de vehículo inválidos" });
    }
    if (error.code === 11000) {
      return res.status(409).json({ error: "La matrícula ya existe" });
    }
    return res.status(500).json({ error: "Error al crear el vehículo" });
  }
};

const updateVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { _id, ...data } = req.body; // ignoramos _id por seguridad
    const vehicleUpdated = await Vehicle.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });
    if (!vehicleUpdated) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }
    return res.status(200).json({
      message: "Vehículo actualizado con éxito",
      vehicle: vehicleUpdated,
    });
  } catch (error) {
    if (error.name === "CastError" || error.name === "ValidationError") {
      return res.status(400).json({
        error: "La solicitud contiene datos inválidos",
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({ error: "La matrícula ya existe" });
    }
    return res.status(500).json({ error: "Error al actualizar el vehículo" });
  }
};

const deleteVehicle = async (req, res, next) => {
  try {
    const { id } = req.params;
    const vehicleDeleted = await Vehicle.findByIdAndDelete(id);
    if (!vehicleDeleted) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }
    return res.status(200).json({
      message: "Vehículo eliminado",
      elemento: vehicleDeleted,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        error: "La solicitud contiene datos inválidos",
      });
    }
    return res.status(500).json({ error: "Error al eliminar el vehículo" });
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
