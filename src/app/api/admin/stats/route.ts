import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';

// GET /api/admin/stats - Get admin dashboard statistics
export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!isAdmin(user)) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const [
            totalUsers,
            totalEvents,
            upcomingEvents,
            totalRegistrations,
            pendingRegistrationsCount,
            totalResources,
            totalVideos,
            recentRegistrations,
            pendingRegistrations,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.event.count(),
            prisma.event.count({ where: { status: 'UPCOMING' } }),
            prisma.teamRegistration.count(),
            prisma.teamRegistration.count({ where: { decisionStatus: 'PENDING' } }),
            prisma.resource.count(),
            prisma.video.count(),
            prisma.teamRegistration.findMany({
                take: 10,
                orderBy: { createdAt: 'desc' },
                include: {
                    event: { select: { titleEn: true, titleUz: true } },
                    leader: { select: { username: true } },
                },
            }),
            prisma.teamRegistration.findMany({
                where: { decisionStatus: 'PENDING' },
                take: 5,
                orderBy: { createdAt: 'asc' }, // Oldest pending first
                include: {
                    event: { select: { titleEn: true, titleUz: true } },
                    leader: { select: { username: true } },
                },
            }),
        ]);

        return NextResponse.json({
            stats: {
                totalUsers,
                totalEvents,
                upcomingEvents,
                totalRegistrations,
                pendingRegistrations: pendingRegistrationsCount,
                totalResources,
                totalVideos,
            },
            recentRegistrations,
            pendingRegistrations,
        });

    } catch (error) {
        console.error('Get admin stats error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
