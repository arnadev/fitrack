import React from 'react'
import RoutineModel from '@/app/models/Routine'
import { connectMongo } from '@/utilities/connection';
import RoutineCard from './RoutineCard';
import CreateRoutineModal from './CreateRoutineModal';

import { Exercise } from '@/types';
import { Routine } from '@/types';

const RoutineCardSection = async ({ userId, isOwner=false } : {userId: string, isOwner?: boolean}) => {
  await connectMongo();

  const rawRoutines = await RoutineModel.find({ userId }).lean();

  // JSON stringify/parse handles all the conversion automatically
  const routines: Routine[] = JSON.parse(JSON.stringify(rawRoutines));

  return (
    <>
      {isOwner && <CreateRoutineModal />}
      <div className='lg:flex flex-wrap justify-center'>
        {routines.map(routine => (
          <RoutineCard key={routine._id} routine={routine} isOwner={isOwner}/>
        ))}
      </div>
    </>
  )
}

export default RoutineCardSection