import mongoose, { Document, Schema } from "mongoose";

type FoodPreference = "veg" | "non-veg" | "vegan";

interface IUser extends Document {
  fullName: string;
  email: string;
  dateOfBirth: Date;
  gender: "male" | "female" | "other";
  phone: string;
  food: FoodPreference;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    dateOfBirth: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    phone: {
      type: String,
      required: true,
    },
    food: {
      type: String,
      required: true,
      enum: ["veg", "non-veg", "vegan"],
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export default User;
