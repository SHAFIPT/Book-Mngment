import mongoose, { Schema, Document, Types } from "mongoose";

export type UserRole = 'ADMIN' | 'AUTHOR' | 'RETAIL';

export interface IUser extends Document {
  _id: Types.ObjectId;
  userId: string; // e.g., A1, AU2, R5
  name: string;
  email: string;
  password: string;
  role: UserRole;
  revenue?: number;
  refreshToken?: string; // 🔐 for storing refresh token
  createdAt?: Date;
  updatedAt?: Date;
  status?: 'active' | 'inactive'; 
}

const UserSchema = new Schema<IUser>(
  {
    userId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['ADMIN', 'AUTHOR', 'RETAIL'],
      required: true,
    },
    revenue: { type: Number, default: 0 },
    refreshToken: { type: String },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
