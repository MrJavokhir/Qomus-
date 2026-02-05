import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET /api/users/me - Get current user profile
export async function GET() {
    try {
        const session = await getCurrentUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
            select: {
                id: true,
                username: true,
                email: true,
                photoUrl: true,
                role: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}

// PUT /api/users/me - Update current user profile
export async function PUT(request: NextRequest) {
    try {
        const session = await getCurrentUser();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.userId },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const body = await request.json();
        const { username, email, photoUrl, currentPassword, newPassword } = body;

        // Build update data
        const updateData: Record<string, unknown> = {};

        if (username && username !== user.username) {
            // Check if username is taken
            const existing = await prisma.user.findUnique({ where: { username } });
            if (existing && existing.id !== user.id) {
                return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
            }
            updateData.username = username;
        }

        if (email !== undefined) {
            updateData.email = email;
        }

        if (photoUrl !== undefined) {
            updateData.photoUrl = photoUrl;
        }

        // Password change
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: 'Current password required' }, { status: 400 });
            }

            const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isValid) {
                return NextResponse.json({ error: 'Invalid current password' }, { status: 400 });
            }

            updateData.passwordHash = await bcrypt.hash(newPassword, 10);
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: updateData,
            select: {
                id: true,
                username: true,
                email: true,
                photoUrl: true,
                role: true,
            }
        });

        return NextResponse.json({ user: updatedUser });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
