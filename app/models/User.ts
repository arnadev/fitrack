import mongoose, { Schema, models } from "mongoose";

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Avoid model overwrite in dev hot-reload
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;