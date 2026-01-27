import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';
import { eventSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { parseTashkentTime, nowInTashkent } from '@/lib/date-utils';

// GET /api/events - List all events with optional status filter
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        const where = status ? { status: status as 'UPCOMING' | 'PAST' } : {};

        const events = await prisma.event.findMany({
            where,
            orderBy: { startsAt: 'asc' },
            include: {
                _count: {
                    select: { registrations: true },
                },
                gallery: {
                    orderBy: { order: 'asc' }
                }
            },
        });

        return NextResponse.json({ events });

    } catch (error) {
        console.error('Get events error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/events - Create new event (ADMIN only)
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
        const validatedData = eventSchema.parse(body);

        // Parse time in Tashkent timezone
        const startsAt = parseTashkentTime(validatedData.date, validatedData.time).toDate();
        const now = nowInTashkent().toDate();

        const event = await prisma.event.create({
            data: {
                titleUz: validatedData.titleUz,
                titleEn: validatedData.titleEn,
                descriptionUz: validatedData.descriptionUz,
                descriptionEn: validatedData.descriptionEn,
                startsAt: startsAt,
                date: new Date(validatedData.date), // Keep legacy for now
                time: validatedData.time,          // Keep legacy for now
                locationUz: validatedData.locationUz,
                locationEn: validatedData.locationEn,
                coverImageUrl: body.coverImageUrl || null,
                registrationDeadlineAt: body.registrationDeadlineAt ? new Date(body.registrationDeadlineAt) : null,
                status: startsAt >= now ? 'UPCOMING' : 'PAST',
                createdById: user!.userId,
            },
        });

        return NextResponse.json({ event }, { status: 201 });

    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Create event error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
