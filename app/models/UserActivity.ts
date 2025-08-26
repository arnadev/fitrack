import mongoose from "mongoose"

const UserActivitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  activity: [{
    activityUserName: { type: String, required: true },
    activityUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    timestamp: { type: Date, required: true }
  }],
  updatedAt: { type: Date, default: Date.now },
  lastSeen: { type: Date, default: new Date(0) }
});

// Avoid model overwrite in dev hot-reload
const UserActivity = mongoose.models.UserActivity || mongoose.model("UserActivity", UserActivitySchema);

export default UserActivity;
