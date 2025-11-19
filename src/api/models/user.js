const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true },
        password: { type: String, required: true},
        role: { type: String, enum: ["user", "admin"], default: "user" }
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

userSchema.pre("save", function () {
    this.password = bcrypt.hashSync(this.password,10);
})

const User = mongoose.model("User", userSchema, "users");
module.exports = User;