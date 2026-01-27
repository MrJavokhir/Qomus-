import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { resourceSchema } from '@/lib/validations';
import { ZodError } from 'zod';

// GET /api/resources - List all resources with optional filtering
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const fileType = searchParams.get('fileType');
        const tag = searchParams.get('tag');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (fileType) where.fileType = fileType;
        if (tag) where.tags = { contains: `"${tag}"` };

        const resources = await prisma.resource.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ resources });

    } catch (error) {
        console.error('Get resources error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/resources - Create new resource (ADMIN only)
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
        const validatedData = resourceSchema.parse(body);

        const resource = await prisma.resource.create({
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

        return NextResponse.json({ resource }, { status: 201 });

    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Create resource error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
