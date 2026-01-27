import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { ratingUpdateSchema } from '@/lib/validations';
import { ZodError } from 'zod';

interface RouteContext {
    params: Promise<{ id: string }>;
}

// PATCH /api/registrations/[id]/rating - Update registration rating (ADMIN only)
export async function PATCH(
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
        const validatedData = ratingUpdateSchema.parse(body);

        const registration = await prisma.teamRegistration.update({
            where: { id },
            data: {
                ratingStatus: validatedData.ratingStatus,
                notes: validatedData.notes,
            },
            include: {
                event: {
                    select: {
                        titleUz: true,
                        titleEn: true,
                    },
                },
                leader: {
                    select: {
                        username: true,
                    },
                },
            },
        });

        return NextResponse.json({ registration });

    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Update rating error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
