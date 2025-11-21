const {
    getWorkorders,
    getWorkordersByClientName,
    getWorkorderByClientId,
    getWorkordersByPlate,
    getWorkordersByVehicleId,
    postWorkorder,
    updateWorkorder,
    deleteWorkorder
} = require("../controllers/workorder");

const workordersRouter = require("express").Router();

workordersRouter.get("/", getWorkorders);

workordersRouter.get("/search", getWorkordersByClientName);

workordersRouter.get("/plate/:plate", getWorkordersByPlate);

workordersRouter.get("/client/:clientId", getWorkorderByClientId);

workordersRouter.post("/", postWorkorder);

workordersRouter.put("/:id", updateWorkorder);

workordersRouter.delete("/:id", deleteWorkorder);

module.exports = workordersRouter;