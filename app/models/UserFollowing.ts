import mongoose from 'mongoose';

const UserFollowingSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // The user who is following others
  following: [{
    userId: String,
    followedAt: { type: Date, default: Date.now }
  }], // List of people this user follows
  followingCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index for efficient queries (userId already has unique index)
UserFollowingSchema.index({ "following.userId": 1 });

export default mongoose.models.UserFollowing || mongoose.model('UserFollowing', UserFollowingSchema);
