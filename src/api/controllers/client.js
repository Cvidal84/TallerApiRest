const Client = require("../models/client");


const getClients = async (req, res, next) => {
    try {
        const clients = await Client.find();
        return res.status(200).json(clients);
    } catch (error) {
        return res.status(400).json("error");
    }
}

const getClientById = async (req, res, next) => {
    try {
        const client = await Client.findById(req.params.id);
        if(!client) {
            return res.status(404).json({ error: "Cliente no encontrado" })
        }
        return res.status(200).json(client);
    } catch (error) {
        res.status(400).json({ error: "ID inválido o error en la búsqueda" });
    }
}

const getClientByName = async (req, res, next) => {
    try {
        const { name } = req.query;

        if (!name) {
            return res.status(400).json({ error: "Debes enviar un nombre para buscar" });
        }
        // Búsqueda insensible a mayúsculas/minúsculas
        const clients = await Client.find({ 
        name: { $regex: name, $options: "i" }
        });

        if (clients.length === 0) {
        return res.status(404).json({ error: "No se encontraron clientes con ese nombre" });
        }

        return res.status(200).json(clients);
    } catch (error) {
        return res.status(500).json({ error: "Error en la búsqueda" });
    }
}

const getClientByDocument = async (req, res, next) => {
    try {
        const { documentNumber } = req.params;
        if (!documentNumber) {
            return res.status(400).json({ error: "Debes enviar un número de documento" });
        }
        const client = await Client.findOne({
          documentNumber: { $regex: `^${documentNumber}$`, $options: "i" }
        });
        if(!client) {
            return res.status(404).json({ error: "Cliente no encontrado" });
        }
        return res.status(200).json(client);
    } catch (error) {
        return res.status(500).json({ error: "Error en la búsqueda" });
    }
}

const getClientByTelephone = async (req, res, next) => {
  try {
    const { telephone } = req.params;

    if (!telephone) {
      return res.status(400).json({ error: "Debes enviar un número de teléfono" });
    }

    const client = await Client.findOne({ telephone });

    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    return res.status(200).json(client);
  } catch (error) {
    return res.status(500).json({ error: "Error en la búsqueda" });
  }
};


const postClient = async (req, res, next) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ error: "Faltan datos del cliente" });
    }

    const newClient = new Client(req.body);
    const clientSaved = await newClient.save();

    return res.status(201).json({
      message: "Cliente creado con éxito",
      client: clientSaved
    });
  } catch (error) {
    console.error("Error al guardar cliente:", error);

    if (error.code === 11000) {
      // Error por duplicado de email o documentNumber
      return res
        .status(409)
        .json({ error: "El email o número de documento ya existe" });
    }

    return res
      .status(500)
      .json({ error: "Error al crear el cliente", details: error.message });
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
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    return res.status(200).json(clientUpdated);
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return res.status(500).json({ error: "Error al actualizar el cliente" });
  }
};


const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const clientDeleted = await Client.findByIdAndDelete(id);

    if (!clientDeleted) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }

    return res.status(200).json({
      message: "Cliente eliminado",
      elemento: clientDeleted,
    });
  } catch (error) {
    console.error("Error al eliminar cliente:", error);
    return res.status(500).json({ error: "Error al eliminar el cliente" });
  }
};


module.exports = {
    getClients,
    getClientById,
    getClientByName,
    getClientByDocument,
    getClientByTelephone,
    postClient,
    updateClient, 
    deleteClient
}