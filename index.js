require("dotenv").config();
const express = require("express");
const { connectDB } = require("./src/config/db");
const clientsRouter = require("./src/api/routes/client");
const vehiclesRouter = require("./src/api/routes/vehicle");
const usersRouter = require("./src/api/routes/user");
const mechanicsRouter = require("./src/api/routes/mechanic");
const workordersRouter = require("./src/api/routes/workorder");
const cors = require("cors"); // para conectar al frontend

const app = express();

connectDB();

app.use(cors());//para poder conectar backend con frontend
app.use(express.json());

app.use("/api/v1/clients", clientsRouter);
app.use("/api/v1/vehicles", vehiclesRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/mechanics", mechanicsRouter);
app.use("/api/v1/workorders", workordersRouter);

app.use((req, res, next) => {
  return res.status(404).json("Route not found ❌");
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor levantado en http://localhost:${PORT} ✅`);
});
