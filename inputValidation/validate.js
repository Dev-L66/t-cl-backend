import {z} from 'zod';

export const validateSignupInput = z.object({
    username: z.string().min(3, { message: "Username must be at least 3 characters" }).max(50) .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Username can only contain letters, numbers ( no spaces or special characters)",
    }),
    fullName: z.string().min(3, { message: "Fullname must be at least 3 characters" }).max(50),
    email: z.string().email().min(3, { message: "email must be at least 3 characters" }).max(30),
    password: z.string().min(6, { message: "Password must be at least 6 characters" }).max(20)
}).strict();


