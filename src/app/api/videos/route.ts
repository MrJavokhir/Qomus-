import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { videoSchema } from '@/lib/validations';
import { ZodError } from 'zod';

// GET /api/videos - List all videos
export async function GET() {
    try {
        const videos = await prisma.video.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ videos });

    } catch (error) {
        console.error('Get videos error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/videos - Create new video (ADMIN only)
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!isAdmin(user)) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const validatedData = videoSchema.parse(body);

        const video = await prisma.video.create({
            data: {
                titleUz: validatedData.titleUz,
                titleEn: validatedData.titleEn,
                descriptionUz: validatedData.descriptionUz,
                descriptionEn: validatedData.descriptionEn,
                videoUrl: validatedData.videoUrl,
                sourceType: validatedData.sourceType,
                durationSeconds: validatedData.durationSeconds || null,
                thumbnailUrl: validatedData.thumbnailUrl || null,
            },
        });

        return NextResponse.json({ video }, { status: 201 });

    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Create video error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
