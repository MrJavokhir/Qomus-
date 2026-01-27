import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin, isAuthenticated } from '@/lib/auth';
import { registrationSchema } from '@/lib/validations';
import { ZodError } from 'zod';
import { isDeadlinePassed, computeEventStatus } from '@/lib/timezone';

// GET /api/registrations - List all registrations (ADMIN only)
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!isAdmin(user)) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId');
        const ratingStatus = searchParams.get('ratingStatus');
        const decisionStatus = searchParams.get('decisionStatus');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (eventId) where.eventId = eventId;
        if (ratingStatus) where.ratingStatus = ratingStatus;
        if (decisionStatus) where.decisionStatus = decisionStatus;

        const registrations = await prisma.teamRegistration.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                event: {
                    select: {
                        id: true,
                        titleUz: true,
                        titleEn: true,
                        date: true,
                        time: true,
                    },
                },
                leader: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                decidedBy: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        return NextResponse.json({ registrations });

    } catch (error) {
        console.error('Get registrations error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/registrations - Create new registration (authenticated users)
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!isAuthenticated(user)) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = registrationSchema.parse(body);

        // Check if event exists
        const event = await prisma.event.findUnique({
            where: { id: validatedData.eventId },
        });

        if (!event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        // Check if event is in the past (computed based on Tashkent time)
        const eventStatus = computeEventStatus(event.date, event.time);
        if (eventStatus === 'PAST') {
            return NextResponse.json(
                { error: 'Cannot register for past events' },
                { status: 400 }
            );
        }

        // Check if registration deadline has passed
        if (isDeadlinePassed(event.registrationDeadlineAt)) {
            return NextResponse.json(
                { error: 'Registration deadline has passed' },
                { status: 400 }
            );
        }

        // Check for duplicate team name
        const existingRegistration = await prisma.teamRegistration.findUnique({
            where: {
                eventId_teamName: {
                    eventId: validatedData.eventId,
                    teamName: validatedData.teamName,
                },
            },
        });

        if (existingRegistration) {
            return NextResponse.json(
                { error: 'Team name already registered for this event' },
                { status: 400 }
            );
        }

        const registration = await prisma.teamRegistration.create({
            data: {
                eventId: validatedData.eventId,
                teamName: validatedData.teamName,
                membersCount: validatedData.membersCount,
                leaderUserId: user!.userId,
                ratingStatus: 'YELLOW',
                decisionStatus: 'PENDING',
            },
            include: {
                event: {
                    select: {
                        titleUz: true,
                        titleEn: true,
                    },
                },
            },
        });

        return NextResponse.json({ registration }, { status: 201 });

    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: 'Validation error', details: error.issues },
                { status: 400 }
            );
        }

        console.error('Create registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
