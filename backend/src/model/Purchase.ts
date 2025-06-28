import mongoose, { Schema, Types } from "mongoose";

export interface IPurchase extends Document {
    purchaseId: string; // e.g., 2025-06-1
    book: Types.ObjectId;
    user: Types.ObjectId;
    purchaseDate: Date;
    price: number;
    quantity: number;
  }
  
  const PurchaseSchema = new Schema<IPurchase>(
    {
      purchaseId: { type: String, required: true, unique: true },
      book: { type: Schema.Types.ObjectId, ref: 'Book', required: true },
      user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      purchaseDate: { type: Date, default: Date.now },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true, min: 1 },
    },
    { timestamps: true }
  );
  
  export default mongoose.model<IPurchase>('Purchase', PurchaseSchema);
  