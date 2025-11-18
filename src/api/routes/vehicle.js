const { 
    getVehicles,
    getVehicleByPlate,
    getVehicleByClientId,
    postVehicle,
    updateVehicle,
    deleteVehicle
 } = require("../controllers/vehicle");

 const vehiclesRouter = require("express").Router();

 //obtener todos
 vehiclesRouter.get("/", getVehicles);

 //buscar por matricula
 vehiclesRouter.get("/plate/:plate", getVehicleByPlate);

 //buscar por cliente
 vehiclesRouter.get("/client/:clientId", getVehicleByClientId);

 //añadir un vehículo
 vehiclesRouter.post("/", postVehicle);

 //modificar vehículo
 vehiclesRouter.put("/:id", updateVehicle);

 //eliminar vehículo
 vehiclesRouter.delete("/:id", deleteVehicle);

 module.exports = vehiclesRouter;