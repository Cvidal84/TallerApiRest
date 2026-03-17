const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  description: { type: String, required: true }, // Ej: "Filtro Aceite"
  quantity: { type: Number, default: 1 },
  price: { type: Number, default: 0 },
});

const workorderSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Client",
      required: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    //snapshot: guardamos matrícula y datos básicos aquí. Si el coche se borra o cambia de dueño, la factura histórica no se rompe.
    snapshot: {
      vehiclePlate: {
        type: String,
        required: true,
        trim: true,
        uppercase: true,
      },
      clientName: { type: String, required: true, trim: true },
      kms: { type: Number, required: true }, // Kms de entrada, quremos que actualice en el modelo vehicle
    },
    //usuario que crea la orden:
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    //mecánico al que se asigna el trabajo
    mechanicId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Mechanic",
      required: true,
    },
    //estados:
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Cancelled"],
      default: "Pending",
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },

    items: [itemSchema], // desglose
    completedDate: {
      type: Date,
    }, // se rellena al pasar status a 'Completed'
    paidDate: {
      type: Date,
    }, // se rellena al pasar paymentStatus a 'Paid'
    estimatedCost: { type: Number },
    finalCost: { type: Number },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

workorderSchema.pre("save", function (next) {
  const order = this;
  /* Lógica para fecha de COMPLETADO */
  // Si cambia el estado a Completed y aun no tiene fecha...
  if (
    order.isModified("status") &&
    order.status === "Completed" &&
    !order.completedDate
  ) {
    order.completedDate = new Date();
  }
  /* Lógica para fecha de PAGADO */
  // Si cambia el estado de pago a Paid y aun no tiene fecha...
  if (
    order.isModified("paymentStatus") &&
    order.paymentStatus === "Paid" &&
    !order.paidDate
  ) {
    order.paidDate = new Date();
  }
  next();
});

const Workorder = mongoose.model("Workorder", workorderSchema, "workorders");
module.exports = Workorder;
