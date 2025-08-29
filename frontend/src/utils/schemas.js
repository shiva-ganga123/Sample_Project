import { z } from "zod";

// Login form
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Register form
export const registerSchema = z.object({
  name: z.string().min(2, { message: "Name too short" }),
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

// Item form
export const itemSchema = z.object({
  title: z.string().min(2, { message: "Title too short" }),
  category: z.enum(["bill", "policy", "warranty", "other"]),
  amount: z.number().min(0),
  dueDate: z.date(),
  status: z.enum(["open", "paid", "expired"]),
  notes: z.string().optional(),
});
