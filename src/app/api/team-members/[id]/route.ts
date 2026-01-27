import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';

interface Context {
    params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: Context) {
    try {
        const user = await getCurrentUser();
        if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const { id } = await params;
        const body = await request.json();

        const member = await prisma.teamMember.update({
            where: { id },
            data: {
                fullName: body.fullName,
                positionUz: body.positionUz,
                positionEn: body.positionEn,
                bioUz: body.bioUz,
                bioEn: body.bioEn,
                photoUrl: body.photoUrl,
                order: Number(body.order),
                status: body.status,
                telegramUrl: body.telegramUrl,
                linkedinUrl: body.linkedinUrl,
                instagramUrl: body.instagramUrl,
            }
        });

        return NextResponse.json({ member });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: Context) {
    try {
        const user = await getCurrentUser();
        if (!user || !isAdmin(user)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const { id } = await params;
        await prisma.teamMember.delete({ where: { id } });

        return NextResponse.json({ message: 'Deleted successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
