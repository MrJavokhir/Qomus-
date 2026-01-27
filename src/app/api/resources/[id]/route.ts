import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { resourceSchema } from '@/lib/validations';
import { ZodError } from 'zod';

interface RouteContext {
    params: Promise<{ id: string }>;
}

// GET /api/resources/[id]
export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;

        const resource = await prisma.resource.findUnique({
            where: { id },
        });

        if (!resource) {
            return NextResponse.json(
                { error: 'Resource not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ resource });

    } catch (error) {
        console.error('Get resource error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/resources/[id]
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
        const validatedData = resourceSchema.parse(body);

        const resource = await prisma.resource.update({
            where: { id },
            data: {
                titleUz: validatedData.titleUz,
                titleEn: validatedData.titleEn,
                descriptionUz: validatedData.descriptionUz,
                descriptionEn: validatedData.descriptionEn,
                fileUrl: validatedData.fileUrl,
                fileType: validatedData.fileType,
                tags: JSON.stringify(validatedData.tags),
            },
        });

        return NextResponse.json({ resource });

    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Update resource error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/resources/[id]
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

        await prisma.resource.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Resource deleted successfully' });

    } catch (error) {
        console.error('Delete resource error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
