import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAuthenticated } from '@/lib/auth';

// GET /api/registrations/me - Get current user's registrations
export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!isAuthenticated(user)) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        const registrations = await prisma.teamRegistration.findMany({
            where: { leaderUserId: user!.userId },
            orderBy: { createdAt: 'desc' },
            include: {
                event: {
                    select: {
                        id: true,
                        titleUz: true,
                        titleEn: true,
                        date: true,
                        time: true,
                        locationUz: true,
                        locationEn: true,
                        status: true,
                    },
                },
            },
        });

        return NextResponse.json({ registrations });

    } catch (error) {
        console.error('Get my registrations error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
