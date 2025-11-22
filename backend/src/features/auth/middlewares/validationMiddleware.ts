import { Request, Response, NextFunction } from "express";
import joi from "joi";

/**
 * Validation schemas using Joi
 * SECURITY: Validates all user inputs to prevent injection attacks
 */
export const schemas = {
  register: joi.object({
    email: joi
      .string()
      .email()
      .required()
      .messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
      }),
    password: joi
      .string()
      .min(8)
      .required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[a-zA-Z\d@$!%*?&]+$/)
      .messages({
        "string.min": "Password must be at least 8 characters",
        "string.pattern.base":
          "Password must contain uppercase, lowercase, number, and special character",
        "any.required": "Password is required",
      }),
  }),

  login: joi.object({
    email: joi
      .string()
      .email()
      .required()
      .messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required",
      }),
    password: joi
      .string()
      .required()
      .messages({
        "any.required": "Password is required",
      }),
  }),
};

/**
 * Validation Middleware Factory
 * Creates middleware that validates request body against a schema
 * @param schema - Joi schema to validate against
 * @returns Express middleware
 */
export const validate =
  (schema: joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false, // Return all errors, not just first
      stripUnknown: true, // Remove unknown properties
    });

    if (error) {
      const messages = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      res.status(400).json({
        ok: false,
        error: "Validation failed",
        details: messages,
      });
      return;
    }

    // Normalize email to lowercase
    if (value.email) {
      value.email = value.email.toLowerCase();
    }

    // Replace req.body with validated value
    req.body = value;
    next();
  };
