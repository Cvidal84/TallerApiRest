require("dotenv").config();
const express = require("express");
const { connectDB } = require("./src/config/db");
const clientsRouter = require("./src/api/routes/client");
const vehiclesRouter = require("./src/api/routes/vehicle");


const app = express();

connectDB();

app.use(express.json());

app.use("/api/v1/clients", clientsRouter);
app.use("/api/v1/vehicles", vehiclesRouter);


app.use((req, res, next) => {
    return res.status(404).json("Route not found ❌");
});




const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Servidor levantado en http://localhost:${PORT}✅`)
});