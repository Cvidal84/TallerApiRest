const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const clientSchema = new Schema(
    {
        name: {type: String, required: true, trim: true},
        documentNumber: {type:String, required: true, trim: true, unique: true},
        address: {
                    street: { type: String, trim: true },
                    city:   { type: String, trim: true },
                    zip:    { type: String, trim: true },
                    country:{ type: String, trim: true, default: "ES" },
                },  
        telephone: {type: String, required: true, trim: true},
        email: {type: String, required: true, trim: true, lowercase: true, unique: true}
    },
    {
        timestamps: true,
        versionKey: false
    }
)

//para hacer busquedas rápidas mas tarde por nombre o por telefono
clientSchema.index({ name: 1 });
clientSchema.index({ documentNumber: 1 });
clientSchema.index({ telephone: 1 });

const Client = mongoose.model("clients", clientSchema, "clients");
module.exports = Client;