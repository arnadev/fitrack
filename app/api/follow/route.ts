import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/utilities/connection';
import UserFollowers from '@/app/models/UserFollowers';
import UserFollowing from '@/app/models/UserFollowing';
import User from '@/app/models/User';
import { getUserId } from '@/utilities/gerUserId';

export async function POST(req: NextRequest) {
  try {
    await connectMongo();

    const token = req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = await getUserId(token);

    const { targetUserId, action } = await req.json();
    
    if (!targetUserId || !action) {
      return NextResponse.json({ error: 'Target user ID and action are required' }, { status: 400 });
    }

    if (currentUserId === targetUserId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Verify target user exists
    const targetUser = await User.findById(targetUserId).lean();
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'follow') {
      // Add to UserFollowers (target user's document)
      await UserFollowers.updateOne(
        { userId: targetUserId },
        { 
          $addToSet: { followers: { userId: currentUserId, followedAt: new Date() } },
          $inc: { followerCount: 1 },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );

      // Add to UserFollowing (current user's document)  
      await UserFollowing.updateOne(
        { userId: currentUserId },
        { 
          $addToSet: { following: { userId: targetUserId, followedAt: new Date() } },
          $inc: { followingCount: 1 },
          $set: { updatedAt: new Date() }
        },
        { upsert: true }
      );

      return NextResponse.json({ message: 'Successfully followed user', isFollowing: true });

    } else if (action === 'unfollow') {
      // Remove from UserFollowers (target user's document)
      await UserFollowers.updateOne(
        { userId: targetUserId },
        { 
          $pull: { followers: { userId: currentUserId } },
          $inc: { followerCount: -1 },
          $set: { updatedAt: new Date() }
        }
      );

      // Remove from UserFollowing (current user's document)
      await UserFollowing.updateOne(
        { userId: currentUserId },
        { 
          $pull: { following: { userId: targetUserId } },
          $inc: { followingCount: -1 },
          $set: { updatedAt: new Date() }
        }
      );

      return NextResponse.json({ message: 'Successfully unfollowed user', isFollowing: false });

    } else {
      return NextResponse.json({ error: 'Invalid action. Use "follow" or "unfollow"' }, { status: 400 });
    }

  } catch (error) {
    console.error('Error in follow/unfollow:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Get follow status
export async function GET(req: NextRequest) {
  try {
    await connectMongo();
    
    const token = req.cookies.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = await getUserId(token);
    
    const url = new URL(req.url);
    const targetUserId = url.searchParams.get('targetUserId');
    
    if (!targetUserId) {
      return NextResponse.json({ error: 'Target user ID is required' }, { status: 400 });
    }

    // Check if current user is following target user
    const userFollowing = await UserFollowing.findOne({ 
      userId: currentUserId,
      'following.userId': targetUserId 
    }).lean();

    return NextResponse.json({ isFollowing: !!userFollowing });

  } catch (error) {
    console.error('Error checking follow status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
