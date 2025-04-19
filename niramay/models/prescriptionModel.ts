import mongoose, { Document, Schema } from "mongoose";

export interface IPrescription extends Document {
  prescriptionDescription: string;
  generatedBy: mongoose.Types.ObjectId;
}

const prescriptionSchema = new Schema<IPrescription>(
  {
    prescriptionDescription: {
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

const Prescription =
  mongoose.models.Prescription ||
  mongoose.model<IPrescription>("Prescription", prescriptionSchema);
export default Prescription;
