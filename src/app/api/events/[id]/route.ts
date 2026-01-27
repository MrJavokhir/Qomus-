import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { eventSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { parseTashkentTime, nowInTashkent } from '@/lib/date-utils';

interface RouteContext {
    params: Promise<{ id: string }>;
}

// GET /api/events/[id] - Get single event
export async function GET(
    request: NextRequest,
    context: RouteContext
) {
    try {
        const { id } = await context.params;

        const event = await prisma.event.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { registrations: true },
                },
                createdBy: {
                    select: { username: true },
                },
                gallery: {
                    orderBy: { order: 'asc' }
                }
            },
        });

        if (!event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ event });

    } catch (error) {
        console.error('Get event error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PUT /api/events/[id] - Update event (ADMIN only)
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
        const validatedData = eventSchema.parse(body);

        // Parse time in Tashkent timezone
        const startsAt = parseTashkentTime(validatedData.date, validatedData.time).toDate();
        const now = nowInTashkent().toDate();

        const event = await prisma.event.update({
            where: { id },
            data: {
                titleUz: validatedData.titleUz,
                titleEn: validatedData.titleEn,
                descriptionUz: validatedData.descriptionUz,
                descriptionEn: validatedData.descriptionEn,
                startsAt: startsAt,
                date: new Date(validatedData.date), // Keep legacy
                time: validatedData.time,          // Keep legacy
                locationUz: validatedData.locationUz,
                locationEn: validatedData.locationEn,
                coverImageUrl: body.coverImageUrl !== undefined ? body.coverImageUrl : undefined,
                status: startsAt >= now ? 'UPCOMING' : 'PAST',
            },
        });

        return NextResponse.json({ event });

    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Update event error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/events/[id] - Delete event (ADMIN only)
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

        await prisma.event.delete({
            where: { id },
        });

        return NextResponse.json({ message: 'Event deleted successfully' });

    } catch (error) {
        console.error('Delete event error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
