const Mechanic = require("../models/mechanic");

const getMechanics = async (req, res, next) => {
    try {
        const mechanics = await Mechanic.find();
        return res.status(200).json(mechanics);
    } catch (error) {
        return res.status(500).json({ error: "Error obteniendo los mecanicos" });
    }


}