const { generateToken } = require("../../utils/jwt/jwt");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = new User({
      email,
      password,
      role: "user",
    });
    const userSaved = await user.save();

    /* LIMPIEZA DE SEGURIDAD PARA NO ENVIAR LA CONTRASEÑA AUNQUE VAYA HASHEADA: */
    const userResponse = userSaved.toObject();
    delete userResponse.password;

    return res
      .status(201)
      .json({ message: "Usuario registrado con éxito ✅", user: userResponse });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ error: "Ese email ya está registrado ❌" });
    }
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Datos de usuario inválidos ❌" });
    }
    res.status(500).json({ error: "Error registrando al usuario ⚠️" });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ error: "Usuario o contraseña incorrectos ❌" });
    }
    if (bcrypt.compareSync(password, user.password)) {
      const token = generateToken(user._id);
      const userResponse = user.toObject();
      delete userResponse.password;
      return res
        .status(200)
        .json({ message: "Login exitoso ✅", token, user: userResponse });
    } else {
      return res
        .status(400)
        .json({ error: "Usuario o contraseña incorrectos ❌" });
    }
  } catch (error) {
    return res.status(500).json({ error: "Error en el login ⚠️" });
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ error: "Error obteniendo los usuarios ⚠️" });
  }
};

//funcion para modificar los usuarios
const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Extraemos SOLO lo que permitimos editar:
    const { email, password, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        error: `No se ha encontrado ningún usuario con el id ${id} ❌`,
      });
    }

    if (email) user.email = email;
    if (role) user.role = role;
    if (password) user.password = password;

    const userUpdated = await user.save();

    const userResponse = userUpdated.toObject();
    delete userResponse.password;
    return res.status(200).json({
      message: "Usuario editado con éxito ✅",
      user: userResponse,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ error: "Datos de usuario inválidos ❌" });
    }
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ error: "Ya existe un usuario registrado con ese email ❌" });
    }
    return res.status(500).json({ error: "Error al editar el usuario ⚠️" });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userDeleted = await User.findByIdAndDelete(id);
    if (!userDeleted) {
      return res.status(404).json({ error: "Usuario no encontrado ❌" });
    }
    return res.status(200).json({
      message: "Usuario eliminado correctamente ✅",
      user: { email: userDeleted.email },
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ error: "ID de usuario inválido ❌" });
    }
    return res.status(500).json({ error: "Error al eliminar el usuario ⚠️" });
  }
};

module.exports = {
  register,
  login,
  getUsers,
  updateUser,
  deleteUser,
};
