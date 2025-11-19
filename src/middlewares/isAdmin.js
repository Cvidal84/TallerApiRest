const isAdmin = (req, res, next) => {
  // asegúrate de que exista req.body (DELETE suele venir sin body)
  req.body = req.body || {};

  // Si es admin, puede hacer cualquier cosa
  if (req.user.role === "admin") {
    // solo en PUT/PATCH y si se edita a sí mismo, mantenemos su rol
    if ((req.method === "PUT")
        && req.params.id
        && String(req.params.id) === String(req.user._id)) {
      req.body.role = "admin";
    }
    return next();
  }

  // Si es user
  if (req.user.role === "user") {
    if (req.params.id && String(req.params.id) !== String(req.user._id)) {
      return res.status(403).json("No puedes editar o eliminar a otro usuario ❌");
    }

    // En DELETE puede borrarse a sí mismo (no hay body)
    if (req.method === "DELETE") {
      return next();
    }

    const { email, password } = req.body;
    if (email || password) {
      return next();
    }

    return res.status(403).json("Sólo tienes permitido cambiar tu email o contraseña ⚠️");
  }

  return res.status(403).json("No tienes permisos ❌");
};

module.exports = { isAdmin };