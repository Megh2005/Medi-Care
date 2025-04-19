import mongoose, { Document, Schema } from "mongoose";

export interface IDiet extends Document {
  dietDescription: string;
  generatedBy: mongoose.Types.ObjectId;
}

const dietSchema = new Schema<IDiet>(
  {
    dietDescription: {
      type: String,
      required: true,
    },
    generatedBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Diet = mongoose.models.Diet || mongoose.model<IDiet>("Diet", dietSchema);
export default Diet;
