const { isAdmin } = require("../../middlewares/isAdmin");
const { isAuth } = require("../../middlewares/isAuth");
const {
  register,
  login,
  getUsers,
  updateUser,
  deleteUser,
} = require("../controllers/user");

const usersRouter = require("express").Router();

usersRouter.post("/register", register);
usersRouter.post("/login", login);
usersRouter.get("/", isAuth, getUsers);
usersRouter.put("/:id", isAuth, isAdmin, updateUser);
usersRouter.delete("/:id", isAuth, isAdmin, deleteUser);

module.exports = { usersRouter };
