const Mechanic = require("../models/mechanic");

const getMechanics = async (req, res, next) => {
    try {
        const mechanics = await Mechanic.find();
        return res.status(200).json(mechanics);
    } catch (error) {
        return res.status(500).json({ error: "Error obteniendo los mecanicos" });
    }
};

const getMechanicById = async (req, res, next) => {
    try {
        const mechanic = await Mechanic.findById(req.params.id);
        if (!mechanic) {
            return res.status(404).json({ error: "Mecánico no encontrado" });
        }
        return res.status(200).json(mechanic);
    } catch (error) {
        if (error.name === "CastError") {
        return res
            .status(400)
            .json({ error: "La solicitud contiene datos inválidos" });
        }
        return res.status(500).json({ error: "Error obteniendo el mecánico" });
        
    }
}

const getMechanicByName = async (req, res, next) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res
                .status(400)
                .json({ error: "Debes enviar un nombre para buscar" });
        }

        const mechanic = await Mechanic.find({
            name: { $regex: name, $options: "i" },
        });

        if (mechanic.length === 0) {
            return res
                .status(404)
                .json({ error: "No se encontraron mecánicos con ese nombre" });
        }

        return res.status(200).json(mechanic);
    } catch (error) {
        return res.status(500).json({ error: "Error en la búsqueda" });
    }
}

const getMechanicByTelephone = async (req, res, next) => {
  try {
    const { telephone } = req.params;

    if (!telephone) {
      return res
        .status(400)
        .json({ error: "Debes enviar un número de teléfono" });
    }

    const mechanic = await Mechanic.findOne({ telephone });

    if (!mechanic) {
      return res.status(404).json({ error: "Mecánico no encontrado" });
    }

    return res.status(200).json(mechanic);
  } catch (error) {
    return res.status(500).json({ error: "Error en la búsqueda" });
  }
};

const postMechanic = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Faltan datos del mecánico" });
    }

    const newMechanic = new Mechanic(req.body);
    const mechanicSaved = await newMechanic.save();

    return res.status(201).json({
      message: "Mecánico creado con éxito",
      mechanic: mechanicSaved,
    });

  } catch (error) {

    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Datos del mecánico inválidos" });
    }

    if (error.code === 11000) {
      return res
        .status(409)
        .json({ error: "El mecánico ya existe (email o documento duplicado)" });
    }

    return res.status(500).json({ error: "Error al crear el mecánico" });
  }
};

const updateMechanic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { _id, ...data } = req.body; // ignoramos _id por seguridad

    const mechanicUpdated = await Mechanic.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!mechanicUpdated) {
      return res.status(404).json({ error: "Mecánico no encontrado" });
    }

    return res.status(200).json({
      message: "Mecánico actualizado",
      mechanic: mechanicUpdated,
    });

  } catch (error) {

    if (error.name === "CastError" || error.name === "ValidationError") {
      return res.status(400).json({
        error: "La solicitud contiene datos inválidos",
      });
    }

    if (error.code === 11000) {
      return res
        .status(409)
        .json({ error: "El email o documento ya existe en otro mecánico" });
    }

    return res.status(500).json({
      error: "Error al actualizar el mecánico",
    });
  }
};

const deleteMechanic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mechanicDeleted = await Mechanic.findByIdAndDelete(id);

    if (!mechanicDeleted) {
      return res.status(404).json({ error: "Mecánico no encontrado" });
    }

    return res.status(200).json({
      message: "Mecánico eliminado",
      mechanic: mechanicDeleted,
    });

  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        error: "La solicitud contiene datos inválidos",
      });
    }

    return res.status(500).json({
      error: "Error al eliminar el mecánico",
    });
  }
};

module.exports = {
    getMechanics,
    getMechanicById,
    getMechanicByName,
    getMechanicByTelephone,
    postMechanic,
    updateMechanic,
    deleteMechanic
}

//cuando se busca por nombre, si hay una tilde y no se pone no lo encuentra, se puede hacer que no mire las tildes????