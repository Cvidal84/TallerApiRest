const isAdmin = require("../../middlewares/isAdmin");
const isAuth = require("../../middlewares/isAuth");
const {
  getClients,
  getClientById,
  postClient,
  updateClient,
  deleteClient,
} = require("../controllers/client");

const clientsRouter = require("express").Router();

clientsRouter.get("/", isAuth, getClients);
clientsRouter.get("/:id", isAuth, getClientById);

clientsRouter.post("/", isAuth, postClient);

clientsRouter.put("/:id", isAuth, updateClient);

clientsRouter.delete("/:id", isAuth, isAdmin, deleteClient);

module.exports = clientsRouter;
