import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';

interface Context {
    params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Context) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !isAdmin(admin)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const { id } = await params;
        const body = await request.json();

        // Prevent self-modifying role to something not admin? User rules say "At least one ADMIN must exist" and "Admin cannot delete himself".
        if (id === admin.userId && body.role && body.role !== 'ADMIN') {
            return NextResponse.json({ error: 'You cannot remove your own admin role' }, { status: 400 });
        }

        const user = await prisma.user.update({
            where: { id },
            data: {
                role: body.role,
                status: body.status,
            },
            select: { id: true, username: true, role: true, status: true }
        });

        return NextResponse.json({ user });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: Context) {
    try {
        const admin = await getCurrentUser();
        if (!admin || !isAdmin(admin)) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const { id } = await params;

        if (id === admin.userId) {
            return NextResponse.json({ error: 'You cannot delete yourself' }, { status: 400 });
        }

        await prisma.user.delete({ where: { id } });

        return NextResponse.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
