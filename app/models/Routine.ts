import mongoose from "mongoose";

const routineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  exercises: [
    {
      name: { type: String, required: true },
      sets: { type: Number, required: true },
      repLower: { type: Number, required: true },
      repUpper: { type: Number, required: true },
      weight: { type: Number, required: true },
    },  
  ],
  createdAt: { type: Date, default: Date.now },
});

const Routine =  mongoose.models.Routine || mongoose.model("Routine", routineSchema);
export default Routine;
