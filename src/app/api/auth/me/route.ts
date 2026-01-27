import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const tokenPayload = await getCurrentUser();

        if (!tokenPayload) {
            return NextResponse.json(
                { error: 'Not authenticated' },
                { status: 401 }
            );
        }

        // Get fresh user data from database
        let user;
        try {
            user = await prisma.user.findUnique({
                where: { id: tokenPayload.userId },
                select: {
                    id: true,
                    username: true,
                    role: true,
                    status: true,
                    createdAt: true,
                },
            });
        } catch (error) {
            console.error('Database error in /me:', error);
            return NextResponse.json(
                { error: 'Database connection error' },
                { status: 503 }
            );
        }

        if (!user) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Check if user is disabled
        if (user.status === 'DISABLED') {
            return NextResponse.json(
                { error: 'Account disabled' },
                { status: 403 }
            );
        }

        return NextResponse.json({ user });

    } catch (error) {
        console.error('Get current user error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
