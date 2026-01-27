import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';

// GET /api/registrations/export.csv - Export registrations as CSV (ADMIN only)
export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!isAdmin(user)) {
            return NextResponse.json(
                { error: 'Admin access required' },
                { status: 403 }
            );
        }

        const registrations = await prisma.teamRegistration.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                event: {
                    select: {
                        titleEn: true,
                        date: true,
                    },
                },
                leader: {
                    select: {
                        username: true,
                    },
                },
            },
        });

        // Create CSV content
        const headers = ['Team Name', 'Event', 'Event Date', 'Members Count', 'Leader', 'Rating', 'Notes', 'Registered At'];
        const rows = registrations.map((reg) => [
            reg.teamName,
            reg.event.titleEn,
            reg.event.date.toISOString().split('T')[0],
            reg.membersCount.toString(),
            reg.leader.username,
            reg.ratingStatus,
            reg.notes || '',
            reg.createdAt.toISOString(),
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
        ].join('\n');

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="registrations.csv"',
            },
        });

    } catch (error) {
        console.error('Export registrations error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
