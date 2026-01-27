import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// This endpoint initializes the database schema and creates admin user
// Call this once after deploying to a new database
// GET /api/db-init?secret=YOUR_SECRET

export async function GET(request: NextRequest) {
    const secret = request.nextUrl.searchParams.get('secret');

    // Require a secret to prevent unauthorized access
    // Set DB_INIT_SECRET environment variable on Railway
    const expectedSecret = process.env.DB_INIT_SECRET || 'qomus-init-2026';

    if (secret !== expectedSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: string[] = [];

    try {
        // Test connection
        await prisma.$connect();
        results.push('✅ Database connected');

        // Check if users table exists and has data
        let needsSchema = false;
        let needsSeed = false;

        try {
            const userCount = await prisma.user.count();
            results.push(`✅ Users table exists (${userCount} users)`);
            if (userCount === 0) {
                needsSeed = true;
            }
        } catch {
            needsSchema = true;
            results.push('⚠️ Tables do not exist - need schema push');
        }

        if (needsSchema) {
            results.push('❌ Schema not synced. Please run from Railway console:');
            results.push('   npx prisma db push');
            results.push('   npx prisma db seed');
            return NextResponse.json({
                success: false,
                results,
                instructions: [
                    '1. Go to Railway dashboard',
                    '2. Select your project',
                    '3. Click on your service',
                    '4. Go to "Shell" tab',
                    '5. Run: npx prisma db push',
                    '6. Run: npx prisma db seed'
                ]
            });
        }

        if (needsSeed) {
            // Create admin user directly
            results.push('🔧 Creating admin user...');

            const adminPassword = await bcrypt.hash('admin12345', 12);

            await prisma.user.upsert({
                where: { username: 'admin' },
                update: {},
                create: {
                    username: 'admin',
                    passwordHash: adminPassword,
                    role: 'ADMIN',
                },
            });

            results.push('✅ Admin user created');
            results.push('   Username: admin');
            results.push('   Password: admin12345');
        }

        return NextResponse.json({
            success: true,
            results,
            message: needsSeed ? 'Admin user created! You can now log in.' : 'Database is ready!'
        });

    } catch (error) {
        console.error('DB init error:', error);
        return NextResponse.json({
            success: false,
            results,
            error: String(error)
        }, { status: 500 });
    }
}
