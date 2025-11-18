const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const clientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    documentNumber: { type: String, required: true, trim: true, unique: true },
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      zip: { type: String, trim: true },
      country: { type: String, trim: true, default: "ES" },
    },
    telephone: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      match: [
        /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
        "Por favor, introduce un correo electrónico válido.",
      ],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

//para hacer busquedas rápidas mas tarde por nombre o por telefono
clientSchema.index({ name: 1 });
clientSchema.index({ telephone: 1 });

const Client = mongoose.model("Client", clientSchema, "clients");
module.exports = Client;
