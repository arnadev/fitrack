import { NextRequest, NextResponse } from 'next/server';
import { connectMongo } from '@/utilities/connection';
import Log from '@/app/models/Log';
import { verifyToken } from '@/utilities/jwt';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
  try {
    await connectMongo();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get userId and pagination parameters from query
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userLogs: any = await Log.findOne({ userId }).lean();
    
    if (!userLogs || !userLogs.logs) {
      return NextResponse.json({ 
        logs: [], 
        pagination: { page: 1, limit, total: 0, totalPages: 0, hasMore: false }
      });
    }

    // Sort logs by timestamp (newest first) and apply pagination
    const sortedLogs = userLogs.logs.sort((a: any, b: any) => 
      new Date(b.timeStamp).getTime() - new Date(a.timeStamp).getTime()
    );
    
    const total = sortedLogs.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedLogs = sortedLogs.slice(skip, skip + limit);
    const hasMore = page < totalPages;

    // Convert to plain objects for client component
    const serializedLogs = paginatedLogs.map((log: any) => ({
      entry: log.entry,
      timeStamp: log.timeStamp.toISOString()
    }));

    return NextResponse.json({ 
      logs: serializedLogs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore
      }
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectMongo();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const userId = decoded.id;
    
    const { entry } = await req.json();
    
    if (!entry || entry.trim() === '') {
      return NextResponse.json({ error: 'Entry is required' }, { status: 400 });
    }

    if (entry.trim().length > 1000) {
      return NextResponse.json({ error: 'Entry must be 1000 characters or less' }, { status: 400 });
    }

    // Find existing log document or create new one
    let userLogs = await Log.findOne({ userId });
    
    if (!userLogs) {
      userLogs = new Log({ userId, logs: [] });
    }

    // Add new log entry
    const newLogEntry = {
      entry: entry.trim(),
      timeStamp: new Date()
    };
    
    userLogs.logs.push(newLogEntry);
    await userLogs.save();
    
    revalidatePath('/home');
    return NextResponse.json({ message: 'Log added successfully' });
  } catch (error) {
    console.error('Error adding log:', error);
    return NextResponse.json({ error: 'Failed to add log' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectMongo();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const userId = decoded.id;
    
    const { timeStamp } = await req.json();
    
    if (!timeStamp) {
      return NextResponse.json({ error: 'Timestamp is required' }, { status: 400 });
    }

    const userLogs = await Log.findOne({ userId });
    
    if (!userLogs) {
      return NextResponse.json({ error: 'No logs found' }, { status: 404 });
    }

    // Remove log entry by timestamp
    userLogs.logs = userLogs.logs.filter((log: any) => 
      log.timeStamp.toISOString() !== timeStamp
    );

    await userLogs.save();
    
    revalidatePath('/home');
    return NextResponse.json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Error deleting log:', error);
    return NextResponse.json({ error: 'Failed to delete log' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await connectMongo();
    
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const userId = decoded.id;
    
    const { timeStamp, newEntry } = await req.json();
    
    if (!timeStamp || !newEntry || newEntry.trim() === '') {
      return NextResponse.json({ error: 'Timestamp and new entry are required' }, { status: 400 });
    }

    if (newEntry.trim().length > 1000) {
      return NextResponse.json({ error: 'Entry must be 1000 characters or less' }, { status: 400 });
    }

    const userLogs = await Log.findOne({ userId });
    
    if (!userLogs) {
      return NextResponse.json({ error: 'No logs found' }, { status: 404 });
    }

    // Find and update log entry by timestamp
    const logIndex = userLogs.logs.findIndex((log: any) => 
      log.timeStamp.toISOString() === timeStamp
    );

    if (logIndex === -1) {
      return NextResponse.json({ error: 'Log not found' }, { status: 404 });
    }

    userLogs.logs[logIndex].entry = newEntry.trim();
    await userLogs.save();
    
    revalidatePath('/home');
    return NextResponse.json({ message: 'Log updated successfully' });
  } catch (error) {
    console.error('Error updating log:', error);
    return NextResponse.json({ error: 'Failed to update log' }, { status: 500 });
  }
}
