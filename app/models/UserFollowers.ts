import mongoose from 'mongoose';

const UserFollowersSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // The user being followed
  followers: [{ 
    userId: String, 
    followedAt: { type: Date, default: Date.now }
  }], // List of people following this user
  followerCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Compound index for efficient queries (userId already has unique index)
UserFollowersSchema.index({ "followers.userId": 1 });

export default mongoose.models.UserFollowers || mongoose.model('UserFollowers', UserFollowersSchema);
