const Mechanic = require("../models/mechanic");

const getMechanics = async (req, res, next) => {
  try {
    let { search, page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { telephone: { $regex: search, $options: "i" } },
        ],
      };
    }

    // strength: 1 -> ignora tildes y mayúsculas !!!!!!
    const collationOptions = { locale: "es", strength: 1 };

    const [mechanics, total] = await Promise.all([
      Mechanic.find(filter)
        .collation(collationOptions)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(), // optimización de velocidad

      Mechanic.countDocuments(filter).collation(collationOptions),
    ]);

    return res.status(200).json({
      mechanics,
      pagination: {
        totalData: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit: limit,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error obteniendo los mecánicos ❌" });
  }
};

const getMechanicById = async (req, res, next) => {
  try {
    const mechanic = await Mechanic.findById(req.params.id);
    if (!mechanic) {
      return res.status(404).json({ error: "Mecánico no encontrado ⚠️" });
    }
    return res.status(200).json({ mechanic });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "ID inválido ⚠️" });
    }
    return res.status(500).json({ error: "Error obteniendo el mecánico ❌" });
  }
};

const postMechanic = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Faltan datos del mecánico ⚠️" });
    }

    const newMechanic = new Mechanic(req.body);
    const mechanicSaved = await newMechanic.save();

    return res.status(201).json({
      message: "Mecánico creado con éxito ✅",
      mechanic: mechanicSaved,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Datos del mecánico inválidos ⚠️" });
    }
    return res.status(500).json({ error: "Error al crear el mecánico ❌" });
  }
};

const updateMechanic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { _id, ...data } = req.body;

    const mechanicUpdated = await Mechanic.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!mechanicUpdated) {
      return res.status(404).json({ error: "Mecánico no encontrado ⚠️" });
    }

    return res.status(200).json({
      message: "Mecánico actualizado ✅",
      mechanic: mechanicUpdated,
    });
  } catch (error) {
    if (error.name === "CastError" || error.name === "ValidationError") {
      return res.status(400).json({
        error: "Datos inválidos ⚠️",
      });
    }
    return res.status(500).json({
      error: "Error al actualizar el mecánico ❌",
    });
  }
};

const deleteMechanic = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mechanicDeleted = await Mechanic.findByIdAndDelete(id);

    if (!mechanicDeleted) {
      return res.status(404).json({ error: "Mecánico no encontrado ⚠️" });
    }

    return res.status(200).json({
      message: "Mecánico eliminado ✅",
      mechanic: mechanicDeleted,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "ID inválido ⚠️" });
    }
    return res.status(500).json({
      error: "Error al eliminar el mecánico ❌",
    });
  }
};

module.exports = {
  getMechanics,
  getMechanicById,
  postMechanic,
  updateMechanic,
  deleteMechanic,
};
