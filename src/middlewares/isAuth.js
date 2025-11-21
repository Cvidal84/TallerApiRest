const User = require("../api/models/user");
const { verifyJwt } = require("../utils/jwt/jwt");

const isAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No autorizado ❌" });
  try {
    const decoded = verifyJwt(token);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ error: "Usuario no encontrado ❌" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json("No autorizado ❌");
  }
};

module.exports = isAuth;
