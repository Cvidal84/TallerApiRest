const isAdmin = require("../../middlewares/isAdmin");
const isAuth = require("../../middlewares/isAuth");
const {
  getWorkorders,
  getWorkorderById,
  getWorkordersByClientId,
  getWorkordersByVehicleId,
  postWorkorder,
  updateWorkorder,
  deleteWorkorder,
} = require("../controllers/workorder");

const workordersRouter = require("express").Router();

// 1. GET GENERAL (Incluye ?search=... ?page=...)
workordersRouter.get("/", isAuth, getWorkorders);
// 2. GET ESPECÍFICOS (Deben ir ANTES de /:id)
workordersRouter.get("/client/:clientId", isAuth, getWorkordersByClientId);
workordersRouter.get("/vehicle/:vehicleId", isAuth, getWorkordersByVehicleId);
workordersRouter.get("/:id", isAuth, getWorkorderById);

workordersRouter.post("/", isAuth, postWorkorder);

workordersRouter.put("/:id", isAuth, updateWorkorder);

workordersRouter.delete("/:id", isAuth, isAdmin, deleteWorkorder);

module.exports = workordersRouter;
