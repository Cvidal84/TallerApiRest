const Workorder = require("../models/workorder");

const getWorkorders = async (req, res, next) => {
    try {
        const workorders = await Workorder.find();
        return res.status(200).json(workorders);
    } catch (error) {
        return res.status(500).json({ error: "Error obteniendo los albaranes de trabajo" });
    }
}

const getWorkordersByClientName = async (req, res, next) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res
        .status(400)
        .json({ error: "Debes enviar un nombre para buscar" });
    }

    // 1. Buscar clientes por nombre (case-insensitive)
    const clients = await Client.find({
      name: { $regex: name, $options: "i" },
    });

    if (clients.length === 0) {
      return res
        .status(404)
        .json({ error: "No se encontraron clientes con ese nombre" });
    }

    // 2. Obtener sus IDs
    const clientIds = clients.map((c) => c._id);

    // 3. Buscar workorders de esos clientes
    const workorders = await Workorder.find({
      clientId: { $in: clientIds },
    });

    if (workorders.length === 0) {
      return res
        .status(404)
        .json({ error: "Estos clientes no tienen órdenes de trabajo" });
    }

    return res.status(200).json(workorders);

  } catch (error) {
    console.error("Error al buscar workorders por nombre de cliente:", error);

    return res.status(500).json({
      error: "Error al obtener albaranes de trabajo",
    });
  }
};


//pueden ser ninguna o varias ordenes
const getWorkorderByClientId = async (req, res, next) => {
    try {
        const { clientId } = req.params;
        if (!clientId) {
            return res.status(400).json({ error: "Debes enviar un ID de cliente" });      
        }
        const workorders = await Workorder.find({ clientId });
        if (workorders.length === 0) {
            return res
                .status(404)
                .json({ error: "Este cliente no tiene albaranes de trabajo registrados" });
        }
        return res.status(200).json(workorders);
    
    } catch (error) {
        if (error.name === "CastError") {
        return res
            .status(400)
            .json({ error: "La solicitud contiene datos inválidos" });
        }
        return res
        .status(500)
        .json({ error: "Error al buscar albaranes de trabajo del cliente" });
    }
};

const getWorkordersByVehicleId = async (req, res, next) => {
  try {
    const { vehicleId } = req.params;

    if (!vehicleId) {
      return res.status(400).json({ error: "Debes enviar un ID de vehículo" });
    }

    const workorders = await Workorder.find({ vehicleId });

    if (workorders.length === 0) {
      return res
        .status(404)
        .json({ error: "Este vehículo no tiene órdenes de trabajo" });
    }

    return res.status(200).json(workorders);

  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "ID de vehículo inválido" });
    }
    return res
      .status(500)
      .json({ error: "Error al buscar órdenes de trabajo del vehículo" });
  }
};

const getWorkordersByPlate = async (req, res, next) => {
  try {
    const { plate } = req.params;

    if (!plate) {
      return res.status(400).json({ error: "Debes enviar una matrícula" });
    }

    // Buscar el vehículo por matrícula
    const vehicle = await Vehicle.findOne({
      plate: { $regex: `^${plate}$`, $options: "i" }
    });

    if (!vehicle) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }

    // Buscar las órdenes de ese vehículo
    const workorders = await Workorder.find({ vehicleId: vehicle._id });

    if (workorders.length === 0) {
      return res.status(404).json({
        error: "Este vehículo no tiene órdenes de trabajo registradas"
      });
    }

    return res.status(200).json(workorders);

  } catch (error) {
    return res.status(500).json({ error: "Error en la búsqueda" });
  }
};

const postWorkorder = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res
        .status(400)
        .json({ error: "Faltan datos del albarán de trabajo" });
    }

    const newWorkorder = new Workorder(req.body);
    const workorderSaved = await newWorkorder.save();

    return res.status(201).json({
      message: "Albarán de trabajo creado con éxito",
      workorder: workorderSaved,
    });
  } catch (error) {
    console.error("Error al crear albarán de trabajo:", error);

    // Fallo de validación: campos requeridos, enum de status, etc.
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Datos del albarán de trabajo inválidos",
      });
    }

    // IDs de clientId, vehicleId, mechanicId, createdBy mal formados
    if (error.name === "CastError") {
      return res.status(400).json({
        error: "La solicitud contiene datos inválidos (IDs relacionados)",
      });
    }

    return res.status(500).json({
      error: "Error al crear el albarán de trabajo",
    });
  }
};

const updateWorkorder = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Ignoramos _id si lo mandan en el body
    const { _id, ...data } = req.body;

    const workorderUpdated = await Workorder.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!workorderUpdated) {
      return res.status(404).json({ error: "Albarán de trabajo no encontrado" });
    }

    return res.status(200).json({
      message: "Albarán de trabajo actualizado",
      workorder: workorderUpdated,
    });

  } catch (error) {

    // Cuando el ID no tiene formato válido
    if (error.name === "CastError") {
      return res.status(400).json({
        error: "La solicitud contiene datos inválidos",
      });
    }

    // Cuando falla algún campo del schema (enum, required, etc.)
    if (error.name === "ValidationError") {
      return res.status(400).json({
        error: "Datos del albarán de trabajo inválidos",
      });
    }

    console.error("Error al actualizar workorder:", error);
    return res.status(500).json({
      error: "Error al actualizar el albarán de trabajo",
    });
  }
};

const deleteWorkorder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const workorderDeleted = await Workorder.findByIdAndDelete(id);

    if (!workorderDeleted) {
      return res.status(404).json({ error: "Albarán de trabajo no encontrado" });
    }

    return res.status(200).json({
      message: "Albarán de trabajo eliminado",
      workorder: workorderDeleted,
    });

  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        error: "La solicitud contiene datos inválidos",
      });
    }

    console.error("Error al eliminar albarán de trabajo:", error);
    return res.status(500).json({
      error: "Error al eliminar el albarán de trabajo",
    });
  }
};

module.exports = {
    getWorkorders,
    getWorkordersByClientName,
    getWorkorderByClientId,
    getWorkordersByPlate,
    getWorkordersByVehicleId,
    postWorkorder,
    updateWorkorder,
    deleteWorkorder
}