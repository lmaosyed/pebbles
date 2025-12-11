import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String
    },
    profileImage: {
        type: String,
        default: "/assets/default-pfp.png",
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    role: {
  type: String,
  enum: ["user", "admin"],
  default: "user"
},
isBanned: {
  type: Boolean,
  default: false
},




});

export default mongoose.model("User", userSchema);
