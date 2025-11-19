const { generateToken } = require("../../utils/jwt/jwt");
const User = require("../models/user");
const bcrypt = require("bcrypt");

const register = async (req, res, next) => {
  try {
    const userDuplicated = await User.findOne({ email: req.body.email });
    if (userDuplicated) {
      return res
        .status(400)
        .json("Este usuario ya existe en la base de datos ❌");
    }
    const user = new User(req.body);
    const userSaved = await user.save();

    /* LIMPIEZA DE SEGURIDAD PARA NO ENVIAR LA CONTRASEÑA AUNQUE VAYA HASHEADA: */
    const userResponse = userSaved.toObject();
    delete userResponse.password;

    return res
      .status(201)
      .json({ message: "Usuario registrado con éxito", user: userResponse });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ error: "Datos de usuario inválidos" });
    }
    res.status(500).json({ error: "Error registrando al usuario ⚠️" });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    //si el usuario no esta responde incorrecto
    if (!user) {
      return res.status(400).json("Usuario o contraseña incorrectos ❌");
    }
    //si esta el usuario, compara la contraseña que puse con la del usuario, encripta ambas para compararlas
    if (bcrypt.compareSync(password, user.password)) {
      const token = generateToken(user._id);
      return res.status(200).json({ token, user });
    } else {
      return res.status(400).json("Usuario o contraseña incorrectos ❌");
    }
  } catch (error) {
    return res.status(400).json("error ⚠️");
  }
};

//vamos a hacer que se puedan ver todos los usuarios para la autentificacion
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(400).json("Error ⚠️");
  }
};

//funcion para modificar los usuarios
/* const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const newUser = new User(req.body);
    newUser._id = id;
    if (req.user.role === "admin") {
      newUser.role = "admin";
    }
    const userUpdated = await User.findByIdAndUpdate(id, newUser, {
      new: true,
    });
    return res.status(200).json({
      message: `The user  ${userUpdated.name} was successfully updated ✅`,
      user: userUpdated,
    });
  } catch (error) {
    return res.status(400).json("Error ⚠️");
  }
}; */

const updateUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ error: `No se ha encontrado ningún usuario con el id ${id}` });
    }
    /* SI USAMOS EL FINDBYIDANDUPDATE LA LIAMOS SI EL CAMBIO ESTÁ EN LA CONTRASEÑA PORQUE SE GUARDARÁ SIN HASHEAR, ENTONCES: */
    Object.assign(user, req.body);
    const userUpdated = await user.save();

    const userResponse = userUpdated.toObject();
    delete userResponse.password;
    return res.status(200).json({
      message: "Usuario editado con éxito",
      user: userResponse,
    });
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({ error: "Datos de usuario inválidos" });
    }
    return res.status(500).json({ error: "Error al editar el usuario" });
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userDeleted = await User.findByIdAndDelete(id);
    return res.status(200).json({
      message: `The user ${userDeleted.email} was successfully deleted ✅`,
    });
  } catch (error) {
    return res.status(400).json("Error ⚠️");
  }
};

module.exports = {
  register,
  login,
  getUsers,
  updateUser,
  deleteUser,
};
