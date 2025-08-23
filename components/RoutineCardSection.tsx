import React from 'react'
import Routine from '@/app/models/Routine'

import { connectMongo } from '@/utilities/connection';
import RoutineCard from './RoutineCard';
import { Types } from 'mongoose';

interface RoutineLean {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name: string;
  exercises: {
    name: string;
    sets: number;
    repLower: number;
    repUpper: number;
    weight: number;
  }[];
  createdAt: Date;
}

const RoutineCardSection = async ({ userId } : {userId: string}) => {
  await connectMongo();

  const routines = (await Routine.find({ userId }).lean<RoutineLean[]>()).map(routine => ({
    ...routine,
    _id: routine._id.toString(),
    userId: routine.userId.toString(),
    createdAt: routine.createdAt.toString()
  }));
  return (
    <div>
      {routines.map(routine => (
        <RoutineCard key={routine._id.toString()} routine={routine} isOwner={routine.userId.toString() === userId} />
      ))}
    </div>
  )
}

export default RoutineCardSection