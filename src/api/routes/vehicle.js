const isAdmin = require("../../middlewares/isAdmin");
const isAuth = require("../../middlewares/isAuth");
const {
  getVehicles,
  getVehicleByPlate,
  getVehicleByClientId,
  postVehicle,
  updateVehicle,
  deleteVehicle,
} = require("../controllers/vehicle");

const vehiclesRouter = require("express").Router();

vehiclesRouter.get("/", isAuth, getVehicles);
//buscar por matricula:
vehiclesRouter.get("/plate/:plate", isAuth, getVehicleByPlate);
//buscar por cliente:
vehiclesRouter.get("/client/:clientId", isAuth, getVehicleByClientId);

//añadir un vehículo:
vehiclesRouter.post("/", isAuth, postVehicle);

//modificar vehículo:
vehiclesRouter.put("/:id", isAuth, updateVehicle);

//eliminar vehículo:
vehiclesRouter.delete("/:id", isAuth, isAdmin, deleteVehicle);

module.exports = vehiclesRouter;
