import mongoose, { Schema, Document } from 'mongoose';

export interface ILink extends Document {
  userId: mongoose.Types.ObjectId;
  code: string;
  longUrl: string;
  clicks: number;
  lastClicked: Date | null;
  createdAt: Date;
}

const linkSchema = new Schema<ILink>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true, // Fast queries by user
    },
    code: {
      type: String,
      required: [true, 'Short code is required'],
      unique: true,
      match: [/^[A-Za-z0-9]{6,8}$/, 'Short code must be 6-8 alphanumeric characters'],
      lowercase: true,
      trim: true,
    },
    longUrl: {
      type: String,
      required: [true, 'Long URL is required'],
      match: [
        /^https?:\/\/.+/,
        'Please provide a valid URL starting with http:// or https://',
      ],
    },
    clicks: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastClicked: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Link = mongoose.model<ILink>('Link', linkSchema);
