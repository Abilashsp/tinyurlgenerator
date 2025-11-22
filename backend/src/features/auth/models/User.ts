import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";

/**
 * IUser Interface - Defines User document structure
 * @interface IUser
 */
export interface IUser extends Document {
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * User Schema - Enforces data validation and indexes
 * Security features:
 * - Email: unique, lowercase, trimmed
 * - passwordHash: Never store plain text
 * - Timestamps: Track account creation
 * - Indexes: Fast queries on email
 */
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address",
      ],
      index: true, // Fast lookup on login
    },
    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Exclude from queries by default
    },
  },
  {
    timestamps: true, // Auto creates createdAt, updatedAt
  }
);

/**
 * Pre-save hook: Hash password before storing
 * SECURITY: Never store plain-text passwords
 * bcrypt salt rounds = 12 (industry standard for 2024)
 */
userSchema.pre<IUser>("save", async function (next) {
  // Only hash if password is new or modified
  if (!this.isModified("passwordHash")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Instance method: Compare password
 * Used during login to verify password
 * SECURITY: bcrypt timing-attack resistant
 * @param candidatePassword - Password provided by user
 * @returns Promise<boolean>
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

/**
 * Model export
 * Compiled User model for database operations
 */
export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
