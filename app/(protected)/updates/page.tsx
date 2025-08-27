import React from 'react';
import { cookies } from 'next/headers';
import { getUserId } from '@/utilities/gerUserId';
import UserActivity from '@/app/models/UserActivity';
import Log from '@/app/models/Log';
import { connectMongo } from '@/utilities/connection';
import { LeanActivity, LeanLog } from '@/types';

interface ActivityWithLog {
  activityUserName: string;
  activityUserId: string;
  timestamp: Date;
  logEntry?: string;
  isNew?: boolean; // ✅ Simple boolean addition
}

async function getActivitiesWithLogs(userId: string): Promise<ActivityWithLog[]> {
  await connectMongo();

  // Get user's activity document
  const userActivity = await UserActivity.findOne({ userId }).lean<LeanActivity>();

  if (!userActivity || !userActivity.activity || userActivity.activity.length === 0) {
    return [];
  }

  const lastSeen = userActivity.lastSeen; // Store lastSeen before updating

  // Update lastSeen to now
  await UserActivity.updateOne({ userId }, { lastSeen: new Date() });

  // Get all unique user IDs that have activities
  const activityUserIds = [...new Set(userActivity.activity.map((a) => a.activityUserId.toString()))];

  // Fetch all log documents for these users in one query
  const logDocs = await Log.find(
    { userId: { $in: activityUserIds } },
    { userId: 1, logs: 1 }
  ).lean<LeanLog[]>();

  // Create a map for faster log lookup
  const logMap = new Map<string, string>();
  logDocs.forEach((logDoc) => {
    const userId = logDoc.userId.toString();
    logDoc.logs.forEach((log) => {
      const key = `${userId}-${log.timeStamp.getTime()}`;
      logMap.set(key, log.entry);
    });
  });

  // Map activities with their corresponding log entries
  const activitiesWithLogs: ActivityWithLog[] = userActivity.activity.map((activity) => {
    const key = `${activity.activityUserId.toString()}-${activity.timestamp.getTime()}`;
    const logEntry = logMap.get(key);
    const activityTimestamp = new Date(activity.timestamp);

    return {
      activityUserName: activity.activityUserName,
      activityUserId: activity.activityUserId.toString(),
      timestamp: activityTimestamp,
      logEntry: logEntry || 'Log entry not found',
      isNew: activityTimestamp > lastSeen,
    };
  });

  // Sort by timestamp (newest first)
  return activitiesWithLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

function formatTimeAgo(timestamp: Date): string {
  const now = new Date();
  const diffInMs = now.getTime() - timestamp.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  } else {
    return timestamp.toLocaleDateString();
  }
}

const UpdatesPage = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')!.value; //token won't be null due to middleware
  const userId = await getUserId(token);

  const activities = await getActivitiesWithLogs(userId);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Updates
          </h1>
          <p className="text-gray-600">
            See what people you follow have been logging
          </p>
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No updates yet</div>
              <p className="text-gray-500">
                Follow some users to see their fitness activities here
              </p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={`${activity.activityUserId}-${activity.timestamp.getTime()}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative"
              >
                {/* New tag */}
                {activity.isNew && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      New
                    </span>
                  </div>
                )}

                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {activity.activityUserName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        {activity.activityUserName}
                      </span>
                      <span className="text-gray-500">logged an entry</span>
                      <span className="text-gray-400 text-sm">
                        {formatTimeAgo(activity.timestamp)}
                      </span>
                    </div>

                    {/* Log Entry */}
                    <div className="bg-gray-50 rounded-lg p-4 mt-3">
                      <p className="text-gray-800 leading-relaxed">
                        {activity.logEntry}
                      </p>
                    </div>

                    {/* Timestamp */}
                    <div className="mt-3 text-xs text-gray-500">
                      {activity.timestamp.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More (Future Enhancement) */}
        {activities.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm">
              Showing latest {activities.length} activities
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdatesPage;