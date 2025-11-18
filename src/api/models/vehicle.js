const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const vehicleSchema = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: "Client", required: true },
    plate: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true,
    },
    brand: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number },
    kms: { type: Number },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

vehicleSchema.index({ clientId: 1 });

const Vehicle = mongoose.model("Vehicle", vehicleSchema, "vehicles");
module.exports = Vehicle;
