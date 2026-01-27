import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { reportSchema } from '@/lib/validations';
import { ZodError } from 'zod';

interface RouteContext {
    params: Promise<{ id: string }>;
}

// GET /api/reports/[id] - Get single report
export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;

        const report = await prisma.report.findUnique({
            where: { id },
        });

        if (!report) {
            return NextResponse.json(
                { error: 'Report not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ report });

    } catch (error) {
        console.error('Get report error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/reports/[id] - Update report (ADMIN only)
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
        const validatedData = reportSchema.parse(body);

        const report = await prisma.report.update({
            where: { id },
            data: {
                titleUz: validatedData.titleUz,
                titleEn: validatedData.titleEn,
                bodyUz: validatedData.bodyUz,
                bodyEn: validatedData.bodyEn,
                coverImageUrl: validatedData.coverImageUrl || null,
            },
        });

        return NextResponse.json({ report });

    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Update report error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/reports/[id] - Delete report (ADMIN only)
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

        await prisma.report.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Report deleted successfully' });

    } catch (error) {
        console.error('Delete report error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
