const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const vehicleSchema = new Schema(
    {
        clientId: {type: Schema.Types.ObjectId, ref: "clients", required: true},
        plate: {type: String, required: true, trim: true, uppercase: true, unique: true},
        brand: {type: String, required: true, trim: true},
        model: {type: String, required: true, trim: true},
        year: {type: Number},
        kms: {type: Number}, 
    },
    {
        timestamps: true,
        versionKey: false
    }
)

vehicleSchema.index({ clientId: 1 });
vehicleSchema.index({ plate: 1 });

const Vehicle = mongoose.model("vehicles", vehicleSchema, "vehicles");
module.exports = Vehicle;