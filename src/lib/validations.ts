import { z } from 'zod';

// Auth schemas
export const signupSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(20, 'Username must be at most 20 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password must be at most 100 characters'),
});

export const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

// Event schemas
export const eventSchema = z.object({
    titleUz: z.string().min(1, 'Title (UZ) is required').max(200),
    titleEn: z.string().min(1, 'Title (EN) is required').max(200),
    descriptionUz: z.string().min(1, 'Description (UZ) is required'),
    descriptionEn: z.string().min(1, 'Description (EN) is required'),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
    time: z.string().min(1, 'Time is required'),
    locationUz: z.string().min(1, 'Location (UZ) is required').max(200),
    locationEn: z.string().min(1, 'Location (EN) is required').max(200),
    coverImageUrl: z.string().optional().nullable(),
    gallery: z.array(z.object({
        imageUrl: z.string(),
        order: z.number().int()
    })).optional(),
});

// Registration schemas
export const registrationSchema = z.object({
    eventId: z.string().uuid('Invalid event ID'),
    teamName: z.string().min(1, 'Team name is required').max(100),
    membersCount: z.number().int().min(1, 'At least 1 member required').max(20, 'Maximum 20 members'),
});

export const ratingUpdateSchema = z.object({
    ratingStatus: z.enum(['GREEN', 'YELLOW', 'RED']),
    notes: z.string().max(1000).optional(),
});

// Report schemas
export const reportSchema = z.object({
    titleUz: z.string().min(1, 'Title (UZ) is required').max(200),
    titleEn: z.string().min(1, 'Title (EN) is required').max(200),
    bodyUz: z.string().min(1, 'Body (UZ) is required'),
    bodyEn: z.string().min(1, 'Body (EN) is required'),
    coverImageUrl: z.string().url().optional().or(z.literal('')),
});

// Resource schemas
export const resourceSchema = z.object({
    titleUz: z.string().min(1, 'Title (UZ) is required').max(200),
    titleEn: z.string().min(1, 'Title (EN) is required').max(200),
    descriptionUz: z.string().min(1, 'Description (UZ) is required'),
    descriptionEn: z.string().min(1, 'Description (EN) is required'),
    fileUrl: z.string().min(1, 'File URL is required'),
    fileType: z.enum(['PDF', 'DOCX', 'OTHER']),
    tags: z.array(z.string()).default([]),
});

// Video schemas
export const videoSchema = z.object({
    titleUz: z.string().min(1, 'Title (UZ) is required').max(200),
    titleEn: z.string().min(1, 'Title (EN) is required').max(200),
    descriptionUz: z.string().min(1, 'Description (UZ) is required'),
    descriptionEn: z.string().min(1, 'Description (EN) is required'),
    videoUrl: z.string().min(1, 'Video URL is required'),
    sourceType: z.enum(['UPLOAD', 'URL']).default('URL'),
    durationSeconds: z.number().int().min(0).optional().nullable(),
    thumbnailUrl: z.string().optional().nullable(),
});

// Partner schemas
export const partnerSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    descriptionUz: z.string().min(1, 'Description (UZ) is required'),
    descriptionEn: z.string().min(1, 'Description (EN) is required'),
    logoUrl: z.string().url().optional().or(z.literal('')),
    linkUrl: z.string().url().optional().or(z.literal('')),
});

// Type exports
export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type RegistrationInput = z.infer<typeof registrationSchema>;
export type RatingUpdateInput = z.infer<typeof ratingUpdateSchema>;
export type ReportInput = z.infer<typeof reportSchema>;
export type ResourceInput = z.infer<typeof resourceSchema>;
export type VideoInput = z.infer<typeof videoSchema>;
export type PartnerInput = z.infer<typeof partnerSchema>;
