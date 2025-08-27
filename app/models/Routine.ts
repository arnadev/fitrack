import mongoose from "mongoose";
import { Exercise } from "@/types";

const routineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { 
    type: String, 
    required: true,
    trim: true,
    minlength: 1,
    maxlength: 100
  },
  exercises: {
    type: [
      {
        name: { 
          type: String, 
          required: true,
          trim: true,
          minlength: 1,
          maxlength: 100
        },
        sets: { 
          type: Number, 
          required: true,
          min: 1,
          max: 100
        },
        repLower: { 
          type: Number, 
          required: true,
          min: 1,
          max: 1000
        },
        repUpper: { 
          type: Number, 
          required: true,
          min: 1,
          max: 1000
        },
        weight: { 
          type: Number, 
          required: true,
          min: 0,
          max: 10000
        },
        _id: false,
      }
    ],
    validate: {
      validator: function(exercises: Exercise[]) {
        if (!exercises || exercises.length === 0) return false;
        return exercises.every((ex: Exercise) => ex.repLower <= ex.repUpper);
      },
      message: 'At least one exercise required and repLower must be ≤ repUpper'
    }
  },
  createdAt: { type: Date, default: Date.now },
});

// Avoid model overwrite in dev hot-reload
const Routine = mongoose.models.Routine || mongoose.model("Routine", routineSchema);
export default Routine;