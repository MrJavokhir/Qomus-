import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/stats/home - Get public statistics for home page
export async function GET() {
    try {
        // Get current date for upcoming/past calculation
        const now = new Date();

        // Parallel queries for efficiency
        const [
            totalEvents,
            upcomingEvents,
            pastEvents,
            totalRegistrations,
            totalResources,
            totalVideos,
            totalUsers
        ] = await Promise.all([
            prisma.event.count(),
            prisma.event.count({
                where: { status: 'UPCOMING' }
            }),
            prisma.event.count({
                where: { status: 'PAST' }
            }),
            prisma.teamRegistration.count(),
            prisma.resource.count(),
            prisma.video.count(),
            prisma.user.count({
                where: { status: 'ACTIVE' }
            })
        ]);

        return NextResponse.json({
            totalEvents,
            upcomingEvents,
            pastEvents,
            totalRegistrations,
            totalResources,
            totalVideos,
            totalUsers
        });

    } catch (error) {
        console.error('Home stats error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch statistics' },
            { status: 500 }
        );
    }
}
