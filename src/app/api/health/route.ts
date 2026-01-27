import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Health check endpoint with database connection diagnostics
// GET /api/health

export async function GET() {
    const health: Record<string, unknown> = {
        status: 'checking',
        timestamp: new Date().toISOString(),
        env: {
            nodeEnv: process.env.NODE_ENV,
            hasDbUrl: !!process.env.DATABASE_URL,
            dbUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...' || 'NOT SET',
        }
    };

    try {
        // Test database connection
        const startTime = Date.now();
        await prisma.$connect();
        const connectTime = Date.now() - startTime;

        health.database = {
            connected: true,
            connectTimeMs: connectTime,
        };

        // Try a simple query
        const queryStart = Date.now();
        const userCount = await prisma.user.count();
        const queryTime = Date.now() - queryStart;

        health.database = {
            ...health.database as object,
            queryTimeMs: queryTime,
            userCount,
            tablesExist: true,
        };

        health.status = 'healthy';

        if (userCount === 0) {
            health.warning = 'No users in database. Run: npx prisma db seed';
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        health.status = 'unhealthy';
        health.database = {
            connected: false,
            error: errorMessage,
        };

        // Check for common issues
        if (errorMessage.includes("Can't reach database server")) {
            health.diagnosis = 'Cannot reach database server. Check DATABASE_URL environment variable on Railway.';
            health.fix = [
                '1. Go to Railway Dashboard',
                '2. Check if PostgreSQL service is running',
                '3. Click on your Next.js service',
                '4. Go to Variables tab',
                '5. Check if DATABASE_URL is set',
                '6. If using internal URL, make sure both services are in same project'
            ];
        } else if (errorMessage.includes('does not exist')) {
            health.diagnosis = 'Database tables do not exist. Need to push schema.';
            health.fix = [
                '1. Go to Railway → Your service → Shell',
                '2. Run: npx prisma db push',
                '3. Run: npx prisma db seed'
            ];
        }
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    return NextResponse.json(health, { status: statusCode });
}
