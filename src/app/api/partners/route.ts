import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { partnerSchema } from '@/lib/validations';
import { ZodError } from 'zod';

// GET /api/partners - List all partners
export async function GET() {
    try {
        const partners = await prisma.partner.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ partners });

    } catch (error) {
        console.error('Get partners error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/partners - Create new partner (ADMIN only)
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
        const validatedData = partnerSchema.parse(body);

        const partner = await prisma.partner.create({
            data: {
                name: validatedData.name,
                descriptionUz: validatedData.descriptionUz,
                descriptionEn: validatedData.descriptionEn,
                logoUrl: validatedData.logoUrl || null,
                linkUrl: validatedData.linkUrl || null,
            },
        });

        return NextResponse.json({ partner }, { status: 201 });

    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Create partner error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
