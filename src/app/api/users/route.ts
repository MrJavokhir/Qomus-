import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';

// GET /api/users - List all users (Admin only)
export async function GET() {
    try {
        const admin = await getCurrentUser();
        if (!isAdmin(admin)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                role: true,
                status: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ users });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
