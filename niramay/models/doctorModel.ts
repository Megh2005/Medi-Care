import mongoose, { Document, Schema } from "mongoose";

interface IDoctor extends Document {
  name: string;
  user_rating: number;
  experience: string;
  description: string;
  degree: string;
  specialist: string;
  email: string;
  phone: string;
  location: string;
  about: string;
  languages: string[];
  education: string[];
  specializations: string[];
  awards: string[];
  availableDays: string[];
  availableTimeSlots: string[];
}

const doctorSchema = new Schema<IDoctor>(
  {
    name: {
      type: String,
      required: true,
    },
    user_rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
    },
    experience: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    degree: {
      type: String,
      required: true,
    },
    specialist: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    about: {
      type: String,
      required: true,
    },
    languages: {
      type: [String],
      required: true,
    },
    education: {
      type: [String],
      required: true,
    },
    specializations: {
      type: [String],
      required: true,
    },
    awards: {
      type: [String],
      default: [],
    },
    availableDays: {
      type: [String],
      required: true,
      enum: {
        values: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        message: "{VALUE} is not a valid day",
      },
    },
    availableTimeSlots: {
      type: [String],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Doctor =
  mongoose.models.Doctor || mongoose.model<IDoctor>("Doctor", doctorSchema);
export default Doctor;
