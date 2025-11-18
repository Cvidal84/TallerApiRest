const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_URL);
        console.log("Conectado con éxito a MongoDB✅")
    } catch (error) {
        console.log("Error en la conexión a MongoDB❌")   
    }
}
module.exports = { connectDB };