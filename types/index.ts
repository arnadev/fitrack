import { Types, Document } from "mongoose";

// Core data types
export interface Exercise {
  name: string;
  sets: number;
  repLower: number;
  repUpper: number;
  weight: number;
}

export interface Routine {
  _id: string;
  userId: string;
  name: string;
  exercises: Exercise[];
  createdAt: string;
}

export interface LeanUser {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

export interface LeanLogEntry {
  entry: string;
  timeStamp: Date;
}

export interface LeanLog {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  logs: LeanLogEntry[];
  timestamp: Date;
}

export interface LogDocument extends Document<Types.ObjectId> {
  userId: Types.ObjectId;
  logs: LeanLogEntry[];
  timestamp: Date;
}

export interface LeanActivityEntry {
  activityUserName: string;
  activityUserId: Types.ObjectId;
  timestamp: Date;
}

export interface LeanActivity {
  userId: Types.ObjectId;
  activity: LeanActivityEntry[];
  updatedAt: Date;
  lastSeen: Date;
}

export interface ActivityDocument extends Document<Types.ObjectId> {
  userId: Types.ObjectId;
  activity: LeanActivityEntry[];
  updatedAt: Date;
  lastSeen: Date;
}
