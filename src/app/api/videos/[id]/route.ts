import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { videoSchema } from '@/lib/validations';
import { ZodError } from 'zod';

interface RouteContext {
    params: Promise<{ id: string }>;
}

// GET /api/videos/[id]
export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;

        const video = await prisma.video.findUnique({
            where: { id },
        });

        if (!video) {
            return NextResponse.json(
                { error: 'Video not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ video });

    } catch (error) {
        console.error('Get video error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/videos/[id]
export async function PUT(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const user = await getCurrentUser();

        if (!isAdmin(user)) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { id } = await context.params;
        const body = await request.json();
        const validatedData = videoSchema.parse(body);

        const video = await prisma.video.update({
            where: { id },
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

        return NextResponse.json({ video });

    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Update video error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/videos/[id]
export async function DELETE(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const user = await getCurrentUser();

        if (!isAdmin(user)) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { id } = await context.params;

        await prisma.video.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Video deleted successfully' });

    } catch (error) {
        console.error('Delete video error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
