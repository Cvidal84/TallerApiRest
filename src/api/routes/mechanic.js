const {
    getMechanics,
    getMechanicById,
    getMechanicByName,
    getMechanicByTelephone,
    postMechanic,
    updateMechanic,
    deleteMechanic
} = require("../controllers/mechanic");

const mechanicsRouter = require("express").Router();

// Obtener todos los mecánicos
mechanicsRouter.get("/", getMechanics);

// Buscar mecánicos por nombre → /mechanics/search?name=juan
mechanicsRouter.get("/search", getMechanicByName);

// Buscar mecánico por teléfono → /mechanics/telephone/600000000
mechanicsRouter.get("/telephone/:telephone", getMechanicByTelephone);

// Obtener mecánico por ID (DEBE IR DESPUÉS DE TODAS LAS RUTAS ESPECIALES)
mechanicsRouter.get("/:id", getMechanicById);

// Crear mecánico
mechanicsRouter.post("/", postMechanic);

// Actualizar mecánico
mechanicsRouter.put("/:id", updateMechanic);

// Eliminar mecánico
mechanicsRouter.delete("/:id", deleteMechanic);

module.exports = mechanicsRouter;

