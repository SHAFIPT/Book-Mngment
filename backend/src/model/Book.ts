import mongoose, { Schema, model, Document, Types } from 'mongoose';

export interface IBook extends Document {
    bookId: string;
    title: string;
    slug: string;
    authors: Types.ObjectId[];
    description: string;
    price: number;
    status?: 'approved' | 'rejected' | 'pending';
    createdAt?: Date;
    updatedAt?: Date;
}

const BookSchema = new Schema<IBook>(
    {
        bookId: { type: String, required: true, unique: true },
        title: { type: String, required: true, unique: true },
        slug: { type: String, unique: true },
        authors: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
        description: { type: String, required: true },
        status: {
            type: String,
            enum: ['approved', 'rejected', 'pending'],
            default: 'pending',
            required: false
        },
        price: { type: Number, required: true, min: 100, max: 1000 },
    },
    {
        timestamps: true,
    }
);

// Auto-generate slug before save
BookSchema.pre<IBook>('save', function (next) {
    if (!this.slug) {
        const slugify = require('slugify');
        this.slug = slugify(this.title, { lower: true, strict: true });
    }
    next();
});

// Create indexes for better query performance
BookSchema.index({ title: 'text', description: 'text' });
BookSchema.index({ price: 1 });
BookSchema.index({ authors: 1 });
BookSchema.index({ createdAt: -1 });

const BookModel = model<IBook>('Book', BookSchema);
export default BookModel;