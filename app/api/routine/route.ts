import { connectMongo } from "@/utilities/connection";
import Routine from "@/app/models/Routine";
import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/utilities/gerUserId";
import { revalidatePath } from "next/cache";

export async function DELETE(req: NextRequest){
  try{
    const {routineId} = await req.json();
    const token = req.cookies.get("token")?.value;
    if(!token){
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = await getUserId(token); //getUserId takes care of verifying token

    await connectMongo();
    const deletedRoutine = await Routine.findOneAndDelete({ _id: routineId, userId });
    if (!deletedRoutine) {
      return NextResponse.json({ error: "Routine not found for user" }, { status: 404 });
    }
    
    // Revalidate the home page to refresh server components
    revalidatePath('/home');
    
    return NextResponse.json({ message: "Routine deleted successfully" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export async function PATCH(req: NextRequest){
  try{
    const {routineId, name, exercises} = await req.json();
    const token = req.cookies.get("token")?.value;
    if(!token){
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = await getUserId(token);
    await connectMongo();
    const routine = await Routine.findOne({ _id: routineId, userId });
    if (!routine) {
      return NextResponse.json({ error: "Routine not found for user" }, { status: 404 });
    }

    // Validation
    if (name !== undefined) {
      if (!name || name.trim().length === 0) {
        return NextResponse.json({ error: "Routine name is required" }, { status: 400 });
      }
    }

    if (exercises !== undefined) {
      if (!Array.isArray(exercises) || exercises.length === 0) {
        return NextResponse.json({ error: "At least one exercise is required" }, { status: 400 });
      }

      for (const exercise of exercises) {
        if (!exercise.name || exercise.name.trim().length === 0) {
          return NextResponse.json({ error: "Exercise name is required" }, { status: 400 });
        }
        if (!exercise.sets || exercise.sets <= 0) {
          return NextResponse.json({ error: "Sets must be positive" }, { status: 400 });
        }
        if (!exercise.repLower || exercise.repLower <= 0) {
          return NextResponse.json({ error: "Rep lower bound must be positive" }, { status: 400 });
        }
        if (!exercise.repUpper || exercise.repUpper <= 0) {
          return NextResponse.json({ error: "Rep upper bound must be positive" }, { status: 400 });
        }
        if (exercise.weight < 0) {
          return NextResponse.json({ error: "Weight must be non-negative" }, { status: 400 });
        }
        if (exercise.repLower > exercise.repUpper) {
          return NextResponse.json({ error: "Rep lower bound must be ≤ upper bound" }, { status: 400 });
        }
      }
    }

    // Update fields if provided
    if (name) routine.name = name.trim();
    if (exercises) routine.exercises = exercises;

    await routine.save();
    
    // Revalidate the home page to refresh server components
    revalidatePath('/home');
    
    return NextResponse.json({ message: "Routine updated successfully", routine }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
};

export async function POST(req: NextRequest){
  try{
    const token=req.cookies.get("token")?.value;
    if(!token){
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId=await getUserId(token);
    await connectMongo();

    //Create new routine
    const {name, exercises}=await req.json();
    
    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Routine name is required" }, { status: 400 });
    }

    if (!Array.isArray(exercises) || exercises.length === 0) {
      return NextResponse.json({ error: "At least one exercise is required" }, { status: 400 });
    }

    for (const exercise of exercises) {
      if (!exercise.name || exercise.name.trim().length === 0) {
        return NextResponse.json({ error: "Exercise name is required" }, { status: 400 });
      }
      if (!exercise.sets || exercise.sets <= 0) {
        return NextResponse.json({ error: "Sets must be positive" }, { status: 400 });
      }
      if (!exercise.repLower || exercise.repLower <= 0) {
        return NextResponse.json({ error: "Rep lower bound must be positive" }, { status: 400 });
      }
      if (!exercise.repUpper || exercise.repUpper <= 0) {
        return NextResponse.json({ error: "Rep upper bound must be positive" }, { status: 400 });
      }
      if (exercise.weight < 0) {
        return NextResponse.json({ error: "Weight must be non-negative" }, { status: 400 });
      }
      if (exercise.repLower > exercise.repUpper) {
        return NextResponse.json({ error: "Rep lower bound must be ≤ upper bound" }, { status: 400 });
      }
    }
    
    const newRoutine=new Routine({userId, name: name.trim(), exercises});
    await newRoutine.save();
    
    // Revalidate the home page to refresh server components
    revalidatePath('/home');
    
    return NextResponse.json({ message: "Routine created successfully", routine: newRoutine }, { status: 201 });
  }catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}