const { verify } = require("jsonwebtoken");
const User = require("../api/models/user");
const { verifyJwt } = require("../utils/jwt/jwt");

const isAuth = async (req, res, next) =>{
    try {
        //de bearer token, queremos quedarnos solo con token y hacemos destructuring o lo que sea
        const [, token] = req.headers.authorization.split(" ");
        //verificamos el token bueno
        const { id } = verifyJwt(token);

        const user = await User.findById(id);
        //ponemos esto a null para que nadie lo vea
        user.password = null;
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json("❌ No estás autorizado ❌")
    }
}

module.exports = { isAuth };