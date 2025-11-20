/* const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const workOrderSchema = new Schema(
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
        },
        //

    }
) */