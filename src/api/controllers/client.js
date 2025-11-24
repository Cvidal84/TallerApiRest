const Client = require("../models/client");

const getClients = async (req, res, next) => {
  try {
    let { search, page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    //construimos el filtro:
    let filter = {};
    if (search) {
      filter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { documentNumber: { $regex: search, $options: "i" } },
          { telephone: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    // cálculo de páginas:
    const [clients, total] = await Promise.all([
      Client.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Client.countDocuments(filter),
    ]);

    // 4. Respuesta completa con metadatos
    return res.status(200).json({
      clients,
      pagination: {
        totalData: total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        limit: limit,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error buscando los clientes ❌" });
  }
};

const getClientById = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado ⚠️" });
    }
    return res.status(200).json(client);
  } catch (error) {
    if (error.name === "CastError") {
      return res
        .status(400)
        .json({ error: "La solicitud contiene datos inválidos ⚠️" });
    }
    return res.status(500).json({ error: "Error obteniendo el cliente ❌" });
  }
};

const postClient = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Faltan datos del cliente ⚠️" });
    }

    const newClient = new Client(req.body);
    const clientSaved = await newClient.save();

    return res.status(201).json({
      message: "Cliente creado con éxito ✅",
      client: clientSaved,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      // Si falla la validación (ej. falta un campo requerido)
      return res.status(400).json({ error: "Datos de cliente inválidos ⚠️" });
    }

    if (error.code === 11000) {
      // Error por duplicado de email o documentNumber
      return res
        .status(409)
        .json({ error: "El email o número de documento ya existe ⚠️" });
    }

    return res.status(500).json({ error: "Error al crear el cliente ❌" });
  }
};

const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { _id, ...data } = req.body; // ignoramos _id por si acaso

    const clientUpdated = await Client.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!clientUpdated) {
      return res.status(404).json({ error: "Cliente no encontrado ⚠️" });
    }

    return res.status(200).json({
      message: "Cliente actualizado ✅",
      client: clientUpdated,
    });
  } catch (error) {
    if (error.name === "CastError" || error.name === "ValidationError") {
      return res.status(400).json({
        error: "La solicitud contiene datos inválidos ⚠️",
      });
    }
    if (error.code === 11000) {
      return res
        .status(409) // 409 Conflict
        .json({ error: "El email o documento ya existe en otro cliente ⚠️" });
    }
    return res.status(500).json({
      error: "Error al actualizar el cliente ❌",
    });
  }
};

const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clientDeleted = await Client.findByIdAndDelete(id);

    if (!clientDeleted) {
      return res.status(404).json({ error: "Cliente no encontrado ⚠️" });
    }

    return res.status(200).json({
      message: "Cliente eliminado ✅",
      client: clientDeleted,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        error: "La solicitud contiene datos inválidos ⚠️",
      });
    }
    return res.status(500).json({
      error: "Error al eliminar el cliente ❌",
    });
  }
};

module.exports = {
  getClients,
  getClientById,
  postClient,
  updateClient,
  deleteClient,
};
