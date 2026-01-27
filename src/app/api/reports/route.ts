import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { reportSchema } from '@/lib/validations';
import { ZodError } from 'zod';

// GET /api/reports - List all reports
export async function GET() {
    try {
        const reports = await prisma.report.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ reports });

    } catch (error) {
        console.error('Get reports error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/reports - Create new report (ADMIN only)
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
        const validatedData = reportSchema.parse(body);

        const report = await prisma.report.create({
            data: {
                titleUz: validatedData.titleUz,
                titleEn: validatedData.titleEn,
                bodyUz: validatedData.bodyUz,
                bodyEn: validatedData.bodyEn,
                coverImageUrl: validatedData.coverImageUrl || null,
            },
        });

        return NextResponse.json({ report }, { status: 201 });

    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Create report error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
