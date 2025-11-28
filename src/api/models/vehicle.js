const mongoose = require("mongoose");

const vehicleSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    plate: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
      set: (val) => val.replace(/[^a-zA-Z0-9]/g, ""), // eliminamos todo lo que NO sea letra o número (guiones, espacios)
      match: [
        /^(\d{4}[B-DF-HJ-NP-TV-Z]{3}|[A-Z]{1,2}\d{4}[A-Z]{0,2})$/,
        "La matrícula no tiene un formato español válido (Ej: 1234BCD o M1234AB)",
      ], // matrñicula española actual y antigua
    },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: {
      type: Number,
      min: [1900, "El año no puede ser anterior a 1900"],
      max: [
        new Date().getFullYear() + 1,
        "El año no puede ser superior al actual",
      ],
    },
    kms: { type: Number, min: [0, "Los kilómetros no pueden ser negativos"] },
    /* active: {
      type: Boolean,
      default: true,
    }, */ // VER SI IMPLEMENTAMOS ESTO
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

vehicleSchema.index({ clientId: 1 });
/* vehicleSchema.index({ active: 1 }); */

const Vehicle = mongoose.model("Vehicle", vehicleSchema, "vehicles");
module.exports = Vehicle;
