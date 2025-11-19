const jwt = require("jsonwebtoken");

//genera nuestra llave
const generateToken = (id) =>{
    return jwt.sign({id}, process.env.JWT_SECRET, { expiresIn: "30d"})
}

//verifica la llave
const verifyJwt = (token) =>{
    return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports= {
    generateToken,
    verifyJwt
}