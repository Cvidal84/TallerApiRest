const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,}$/, "Por favor, introduce un correo electrónico válido"],
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: [8, "Contraseña de 8 caracteres mínimo"],
    },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.pre("save", function (next) {
  // SOLO hasheamos la contraseña si ha sido modificada (registro o cambio de clave), sino me dará errores de login por DOBLE-HASH!!!!!!
  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, 10);
  }
  next();
});

const User = mongoose.model("User", userSchema, "users");
module.exports = User;
