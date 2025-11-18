const mongoose = require("mongoose");
const Client = require("../../api/models/client")
const clients = require("../../data/clients")

const lanzarSemilla = async () => {
    try {
        await mongoose.connect("mongodb+srv://carlos:carlos000666@cluster0.0zzo8oh.mongodb.net/TallerApi?appName=Cluster0")

        await Client.collection.drop();
        console.log("Clientes eliminados");

        await Client.insertMany(clients);
        console.log("Clientes introducidos");

        await mongoose.disconnect();
        console.log("Desconectamos de la BBDD")
    } catch (error) {
        console.log("Error al cargar semilla")
    }
};
lanzarSemilla();
