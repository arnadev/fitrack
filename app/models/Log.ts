import { time, timeStamp } from "console";
import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  logs: [
    {
      entry: { 
        type: String, 
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 1000
      },
      _id: false,
      timeStamp: { type: Date, default: Date.now },
    }
  ],
  timestamp: { type: Date, default: Date.now }
});

// Avoid model overwrite in dev hot-reload
const Log = mongoose.models.Log || mongoose.model("Log", logSchema);

export default Log;
