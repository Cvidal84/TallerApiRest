const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const mechanicSchema = new Schema(
    {
        name: { type: String, required: true, trim: true },
        telephone: { type: String, required: true, trim: true },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

const Mechanic = mongoose.model("Mechanic", mechanicSchema, "mechanics");
module.exports = Mechanic;