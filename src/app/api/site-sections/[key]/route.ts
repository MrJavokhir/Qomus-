import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser, isAdmin } from '@/lib/auth';

// GET /api/site-sections/[key] - Get section by key
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ key: string }> }
) {
    try {
        const { key } = await params;

        const section = await prisma.siteSection.findUnique({
            where: { key },
        });

        if (!section) {
            // Return default content if not in DB
            if (key === 'team_section') {
                return NextResponse.json({
                    section: {
                        key: 'team_section',
                        titleUz: 'Bizning jamoa',
                        titleEn: 'Our Team',
                        bodyUz: 'Qomus platformasi ortidagi professional jamoa bilan tanishing',
                        bodyEn: 'Meet the professional team behind the Qomus platform',
                    }
                });
            }
            return NextResponse.json({ error: 'Section not found' }, { status: 404 });
        }

        return NextResponse.json({ section });
    } catch (error) {
        console.error('Get section error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT /api/site-sections/[key] - Update section (Admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ key: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || !isAdmin(user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const { key } = await params;
        const body = await request.json();

        const section = await prisma.siteSection.upsert({
            where: { key },
            update: {
                titleUz: body.titleUz,
                titleEn: body.titleEn,
                bodyUz: body.bodyUz,
                bodyEn: body.bodyEn,
            },
            create: {
                key,
                titleUz: body.titleUz || '',
                titleEn: body.titleEn || '',
                bodyUz: body.bodyUz || '',
                bodyEn: body.bodyEn || '',
            },
        });

        return NextResponse.json({ section });
    } catch (error) {
        console.error('Update section error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
