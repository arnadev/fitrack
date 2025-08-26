import UserActivity from "@/app/models/UserActivity";
import UserFollowers from "@/app/models/UserFollowers";
import User from "@/app/models/User";

export const pushLogToFollowers = async (
  logTimestamp: Date, 
  userId: string
): Promise<void> => {
  try {
    // 1. Get the user's name from User model
    const user = await User.findById(userId, 'name');
    if (!user) {
      console.log("User not found");
      return;
    }

    // 2. Get all followers of this user
    const followersDoc = await UserFollowers.findOne({ userId });
    if (!followersDoc || followersDoc.followers.length === 0) {
      console.log("No followers found for this user");
      return;
    }

    const followerIds = followersDoc.followers.map((f: any) => f.userId);

    // 3. Create the activity object
    const newActivity = {
      activityUserId: userId,        // Who performed the action (ObjectId string)
      activityUserName: user.name,   // Fetched from User model for efficiency during render
      timestamp: logTimestamp        // When the log was created
    };

    // 4. Push into each follower's UserActivity doc
    await UserActivity.updateMany(
      { userId: { $in: followerIds } }, // all follower IDs
      { 
        $push: { 
          activity: {
            $each: [newActivity],
            $sort: { timestamp: -1 },  // Keep newest first
            $slice: 50                 // Limit to 50 activities per user
          }
        }
      },
      { upsert: true } // Create UserActivity doc if it doesn't exist
    );

    console.log(`Pushed log activity to ${followerIds.length} followers`);
  } catch (error) {
    console.error("Error pushing log to followers:", error);
  }
};