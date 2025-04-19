import mongoose, { Document, Schema } from "mongoose";

interface IContact extends Document {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

const contactSchema = new Schema<IContact>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Contact =
  mongoose.models.Contact || mongoose.model<IContact>("Contact", contactSchema);
export default Contact;
