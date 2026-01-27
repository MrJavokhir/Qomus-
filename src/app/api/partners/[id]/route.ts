import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { partnerSchema } from '@/lib/validations';
import { ZodError } from 'zod';

interface RouteContext {
    params: Promise<{ id: string }>;
}

// GET /api/partners/[id]
export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;

        const partner = await prisma.partner.findUnique({
            where: { id },
        });

        if (!partner) {
            return NextResponse.json(
                { error: 'Partner not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ partner });

    } catch (error) {
        console.error('Get partner error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/partners/[id]
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
        const validatedData = partnerSchema.parse(body);

        const partner = await prisma.partner.update({
            where: { id },
            data: {
                name: validatedData.name,
                descriptionUz: validatedData.descriptionUz,
                descriptionEn: validatedData.descriptionEn,
                logoUrl: validatedData.logoUrl || null,
                linkUrl: validatedData.linkUrl || null,
            },
        });

        return NextResponse.json({ partner });

    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Update partner error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/partners/[id]
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

        await prisma.partner.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Partner deleted successfully' });

    } catch (error) {
        console.error('Delete partner error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
