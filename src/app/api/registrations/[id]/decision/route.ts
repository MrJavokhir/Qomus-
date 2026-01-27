import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';

// PATCH /api/registrations/[id]/decision - Accept or decline a registration
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || !isAdmin(user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { id } = await params;
        const body = await request.json();
        const { decisionStatus, decisionNote } = body;

        // Validate decision status
        if (!['ACCEPTED', 'DECLINED'].includes(decisionStatus)) {
            return NextResponse.json(
                { error: 'Invalid decision. Must be ACCEPTED or DECLINED.' },
                { status: 400 }
            );
        }

        // Check if registration exists
        const registration = await prisma.teamRegistration.findUnique({
            where: { id },
            include: { event: true },
        });

        if (!registration) {
            return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
        }

        // Update registration with decision
        const updated = await prisma.teamRegistration.update({
            where: { id },
            data: {
                decisionStatus,
                decisionNote: decisionNote || null,
                decidedAt: new Date(),
                decidedById: user.userId,
            },
            include: {
                event: {
                    select: {
                        id: true,
                        titleUz: true,
                        titleEn: true,
                    },
                },
                leader: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        return NextResponse.json({
            message: `Registration ${decisionStatus.toLowerCase()}`,
            registration: updated,
        });

    } catch (error) {
        console.error('Decision error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
