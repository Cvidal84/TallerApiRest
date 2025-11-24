const mongoose = require("mongoose");

const mechanicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    telephone: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

mechanicSchema.index({ name: 1 }, { collation: { locale: "es", strength: 1 } }); // aquí ignoramos las tildes
mechanicSchema.index({ telephone: 1 });

const Mechanic = mongoose.model("Mechanic", mechanicSchema, "mechanics");
module.exports = Mechanic;
