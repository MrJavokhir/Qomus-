import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';

// GET /api/team-members - List all team members
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const visibleOnly = searchParams.get('visible') === 'true';

        const where = visibleOnly ? { status: 'VISIBLE' } : {};

        const members = await prisma.teamMember.findMany({
            where,
            orderBy: { order: 'asc' },
        });

        return NextResponse.json({ members });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

// POST /api/team-members - Create team member (Admin)
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await request.json();
        const member = await prisma.teamMember.create({
            data: {
                fullName: body.fullName,
                positionUz: body.positionUz,
                positionEn: body.positionEn,
                bioUz: body.bioUz,
                bioEn: body.bioEn,
                photoUrl: body.photoUrl,
                order: Number(body.order) || 0,
                status: body.status || 'VISIBLE',
                telegramUrl: body.telegramUrl,
                linkedinUrl: body.linkedinUrl,
                instagramUrl: body.instagramUrl,
            }
        });

        return NextResponse.json({ member }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
