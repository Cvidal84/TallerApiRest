/**
 * Script para crear un usuario admin en la BD de producción (Render/MongoDB Atlas).
 * Ejecutar desde la carpeta TallerApiRest: node create_admin_user.js
 */
require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const DB_URL = process.env.DB_URL;

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, trim: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true, versionKey: false }
);

// Middleware de hash (igual que en el modelo original)
userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.password = bcrypt.hashSync(this.password, 10);
  }
  next();
});

const User = mongoose.model("User", userSchema, "users");

async function createAdmin() {
  try {
    console.log("Conectando a MongoDB Atlas...");
    await mongoose.connect(DB_URL);
    console.log("✅ Conexión establecida.");

    const email = "admin@taller.com";
    const password = "Admin1234!";

    // Comprobamos si ya existe
    const existing = await User.findOne({ email });
    if (existing) {
      console.log(`⚠️  El usuario ${email} ya existe con rol: ${existing.role}`);
      // Si existe pero no es admin, lo actualizamos
      existing.role = "admin";
      await existing.save();
      console.log("✅ Rol actualizado a 'admin'.");
    } else {
      const user = new User({ email, password, role: "admin" });
      await user.save();
      console.log(`✅ Usuario creado: ${email} / ${password} (rol: admin)`);
    }
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("Desconectado de MongoDB.");
  }
}

createAdmin();
