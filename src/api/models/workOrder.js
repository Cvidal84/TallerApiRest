const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const workorderSchema = new Schema(
    {
        //cliente de la orden
        clientId: {
            type: Schema.Types.ObjectId,
            ref: "clients", //referencia a colección de clientes
            required: true,
        },
        //vehiculo reparado
        vehicleId: {
            type: Schema.Types.ObjectId,
            ref: "vehicles",
            required: true,
        },
        //usuario que lo crea
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        //mecánico al que se asigna el trabajo
        mechanicId: {
            type: Schema.Types.ObjectId,
            ref: "mechanics",
            required: true,
        },
        status: {
            type: String,
            enum:["Pending", "In Progress", "Completed", "Cancelled"],
            default: "Pending",
            required: true,
        },
        description: {
        type: String,
        required: true,
        trim: true,
        },
        entryDate: {
        type: Date,
        default: Date.now,
        },

        // fecha de salida / entrega
        exitDate: {
        type: Date,
        },

        // kms del coche al entrar, podria actualizar la ficha del coche.
        kms: {
        type: Number,
        },

        // costes (opcional)
        estimatedCost: { type: Number },
        finalCost: { type: Number },
    },
    {
        timestamps: true,
        versionKey: false,
    }
)

const Workorder = mongoose.model("Workorder", workorderSchema, "workorders");
module.exports = Workorder;