const { 
    getClients, 
    getClientByName, 
    getClientById, 
    getClientByDocument, 
    getClientByTelephone, 
    postClient, 
    updateClient, 
    deleteClient 
} = require("../controllers/client");

const clientsRouter = require("express").Router();

// Obtener todos
clientsRouter.get("/", getClients);

// Buscar por nombre
clientsRouter.get("/search", getClientByName);

// Buscar por documento
clientsRouter.get("/document/:documentNumber", getClientByDocument);

// Buscar por teléfono
clientsRouter.get("/telephone/:telephone", getClientByTelephone);

// Buscar por ID (debe ir al final de los GET)
clientsRouter.get("/:id", getClientById);

// Crear
clientsRouter.post("/", postClient);

// Actualizar
clientsRouter.put("/:id", updateClient);

// Eliminar
clientsRouter.delete("/:id", deleteClient);

module.exports = clientsRouter;
