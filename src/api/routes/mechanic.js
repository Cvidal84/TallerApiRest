const isAdmin = require("../../middlewares/isAdmin");
const isAuth = require("../../middlewares/isAuth");
const {
  getMechanics,
  getMechanicById,
  postMechanic,
  updateMechanic,
  deleteMechanic,
} = require("../controllers/mechanic");

const mechanicsRouter = require("express").Router();

mechanicsRouter.get("/", isAuth, getMechanics);
mechanicsRouter.get("/:id", isAuth, getMechanicById);

mechanicsRouter.post("/", isAuth, isAdmin, postMechanic);

mechanicsRouter.put("/:id", isAuth, isAdmin, updateMechanic);

mechanicsRouter.delete("/:id", isAuth, isAdmin, deleteMechanic);

module.exports = mechanicsRouter;
