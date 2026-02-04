import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

// This endpoint initializes the database tables and creates admin user
// GET /api/db-init?secret=qomus-init-2026

export async function GET(request: NextRequest) {
    const secret = request.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.DB_INIT_SECRET || 'qomus-init-2026';

    if (secret !== expectedSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const results: string[] = [];

    try {
        // Test connection
        await prisma.$connect();
        results.push('✅ Database connected');

        // Create tables if they don't exist, or update them
        try {
            // Create enums first (PostgreSQL only)
            await prisma.$executeRaw`DO $$ BEGIN CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'ADMIN'); EXCEPTION WHEN duplicate_object THEN null; END $$;`;
            await prisma.$executeRaw`DO $$ BEGIN CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`;
            await prisma.$executeRaw`DO $$ BEGIN CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'PAST'); EXCEPTION WHEN duplicate_object THEN null; END $$;`;
            await prisma.$executeRaw`DO $$ BEGIN CREATE TYPE "RatingStatus" AS ENUM ('GREEN', 'YELLOW', 'RED'); EXCEPTION WHEN duplicate_object THEN null; END $$;`;
            await prisma.$executeRaw`DO $$ BEGIN CREATE TYPE "FileType" AS ENUM ('PDF', 'DOCX', 'OTHER'); EXCEPTION WHEN duplicate_object THEN null; END $$;`;
            await prisma.$executeRaw`DO $$ BEGIN CREATE TYPE "VideoSourceType" AS ENUM ('UPLOAD', 'URL'); EXCEPTION WHEN duplicate_object THEN null; END $$;`;
            results.push('✅ Enums checked/created');

            // 1. Users Table
            await prisma.$executeRaw`
                CREATE TABLE IF NOT EXISTS "users" (
                    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
                    "username" TEXT NOT NULL,
                    "password_hash" TEXT NOT NULL,
                    "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
                    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
                    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
                );
            `;
            await prisma.$executeRaw`CREATE UNIQUE INDEX IF NOT EXISTS "users_username_key" ON "users"("username");`;
            results.push('✅ Users table ready');

            // 2. Events Table
            await prisma.$executeRaw`
                CREATE TABLE IF NOT EXISTS "events" (
                    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
                    "title_uz" TEXT NOT NULL,
                    "title_en" TEXT NOT NULL,
                    "description_uz" TEXT NOT NULL,
                    "description_en" TEXT NOT NULL,
                    "date" TIMESTAMP(3) NOT NULL,
                    "time" TEXT NOT NULL,
                    "location_uz" TEXT NOT NULL,
                    "location_en" TEXT NOT NULL,
                    "created_by_id" TEXT NOT NULL,
                    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
                );
            `;
            // Add missing columns to Events
            await prisma.$executeRaw`ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "starts_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;`;
            await prisma.$executeRaw`ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'UPCOMING';`;
            await prisma.$executeRaw`ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "cover_image_url" TEXT;`;
            await prisma.$executeRaw`ALTER TABLE "events" ADD COLUMN IF NOT EXISTS "registration_deadline_at" TIMESTAMP(3);`;
            results.push('✅ Events table ready (and updated)');

            // 3. Event Images
            await prisma.$executeRaw`
                CREATE TABLE IF NOT EXISTS "event_images" (
                    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
                    "event_id" TEXT NOT NULL,
                    "image_url" TEXT NOT NULL,
                    "order" INTEGER NOT NULL DEFAULT 0,
                    CONSTRAINT "event_images_pkey" PRIMARY KEY ("id")
                );
            `;
            results.push('✅ Event images table ready');

            // 4. Team Registrations
            await prisma.$executeRaw`
                CREATE TABLE IF NOT EXISTS "team_registrations" (
                    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
                    "event_id" TEXT NOT NULL,
                    "team_name" TEXT NOT NULL,
                    "members_count" INTEGER NOT NULL,
                    "leader_user_id" TEXT NOT NULL,
                    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT "team_registrations_pkey" PRIMARY KEY ("id")
                );
            `;
            // Add missing columns to Team Registrations
            await prisma.$executeRaw`ALTER TABLE "team_registrations" ADD COLUMN IF NOT EXISTS "rating_status" TEXT NOT NULL DEFAULT 'YELLOW';`;
            await prisma.$executeRaw`ALTER TABLE "team_registrations" ADD COLUMN IF NOT EXISTS "notes" TEXT;`;
            await prisma.$executeRaw`ALTER TABLE "team_registrations" ADD COLUMN IF NOT EXISTS "decision_status" TEXT NOT NULL DEFAULT 'PENDING';`;
            await prisma.$executeRaw`ALTER TABLE "team_registrations" ADD COLUMN IF NOT EXISTS "decision_note" TEXT;`;
            await prisma.$executeRaw`ALTER TABLE "team_registrations" ADD COLUMN IF NOT EXISTS "decided_at" TIMESTAMP(3);`;
            await prisma.$executeRaw`ALTER TABLE "team_registrations" ADD COLUMN IF NOT EXISTS "decided_by_id" TEXT;`;
            results.push('✅ Team registrations table ready (and updated)');

            // 5. Reports
            await prisma.$executeRaw`
                CREATE TABLE IF NOT EXISTS "reports" (
                    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
                    "title_uz" TEXT NOT NULL,
                    "title_en" TEXT NOT NULL,
                    "body_uz" TEXT NOT NULL,
                    "body_en" TEXT NOT NULL,
                    "cover_image_url" TEXT,
                    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
                );
            `;
            results.push('✅ Reports table ready');

            // 6. Resources
            await prisma.$executeRaw`
                CREATE TABLE IF NOT EXISTS "resources" (
                    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
                    "title_uz" TEXT NOT NULL,
                    "title_en" TEXT NOT NULL,
                    "description_uz" TEXT NOT NULL,
                    "description_en" TEXT NOT NULL,
                    "file_url" TEXT NOT NULL,
                    "file_type" TEXT NOT NULL DEFAULT 'PDF',
                    "tags" TEXT NOT NULL DEFAULT '[]',
                    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
                );
            `;
            results.push('✅ Resources table ready');

            // 7. Videos
            await prisma.$executeRaw`
                CREATE TABLE IF NOT EXISTS "videos" (
                    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
                    "title_uz" TEXT NOT NULL,
                    "title_en" TEXT NOT NULL,
                    "description_uz" TEXT NOT NULL,
                    "description_en" TEXT NOT NULL,
                    "video_url" TEXT NOT NULL,
                    "source_type" TEXT NOT NULL DEFAULT 'URL',
                    "duration_seconds" INTEGER,
                    "thumbnail_url" TEXT,
                    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
                );
            `;
            results.push('✅ Videos table ready');

            // 8. Partners
            await prisma.$executeRaw`
                CREATE TABLE IF NOT EXISTS "partners" (
                    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
                    "name" TEXT NOT NULL,
                    "description_uz" TEXT NOT NULL,
                    "description_en" TEXT NOT NULL,
                    "logo_url" TEXT,
                    "link_url" TEXT,
                    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
                );
            `;
            results.push('✅ Partners table ready');

            // 9. Team Members
            await prisma.$executeRaw`
                CREATE TABLE IF NOT EXISTS "team_members" (
                    "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
                    "full_name" TEXT NOT NULL,
                    "position_uz" TEXT NOT NULL,
                    "position_en" TEXT NOT NULL,
                    "bio_uz" TEXT DEFAULT '',
                    "bio_en" TEXT DEFAULT '',
                    "photo_url" TEXT DEFAULT '',
                    "status" TEXT NOT NULL DEFAULT 'VISIBLE',
                    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
                );
            `;
            // Add missing columns to Team Members
            await prisma.$executeRaw`ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "telegram_url" TEXT;`;
            await prisma.$executeRaw`ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "linkedin_url" TEXT;`;
            await prisma.$executeRaw`ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "instagram_url" TEXT;`;
            await prisma.$executeRaw`ALTER TABLE "team_members" ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0;`;
            results.push('✅ Team members table ready');

            // 10. Site Sections
            await prisma.$executeRaw`
                CREATE TABLE IF NOT EXISTS "site_sections" (
                    "key" TEXT NOT NULL,
                    "title_uz" TEXT NOT NULL,
                    "title_en" TEXT NOT NULL,
                    "body_uz" TEXT NOT NULL,
                    "body_en" TEXT NOT NULL,
                    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    CONSTRAINT "site_sections_pkey" PRIMARY KEY ("key")
                );
            `;
            results.push('✅ Site sections table ready');

            results.push('🚀 Database schema fully updated!');
        } catch (schemaError) {
            const errorMsg = schemaError instanceof Error ? schemaError.message : String(schemaError);
            results.push(`❌ Schema update error: ${errorMsg}`);
            return NextResponse.json({ success: false, results, error: errorMsg }, { status: 500 });
        }

        // Create admin user
        try {
            const userCount = await prisma.user.count();
            if (userCount === 0) {
                results.push('🔧 Creating admin user...');
                const adminPassword = await bcrypt.hash('admin12345', 12);

                await prisma.user.create({
                    data: {
                        username: 'admin',
                        passwordHash: adminPassword,
                        role: 'ADMIN',
                    },
                });

                results.push('✅ Admin user created');
                results.push('   Username: admin');
                results.push('   Password: admin12345');
            } else {
                results.push(`✅ Users exist (${userCount} users)`);
            }
        } catch (userError) {
            const errorMsg = userError instanceof Error ? userError.message : String(userError);
            results.push(`⚠️ User creation note: ${errorMsg}`);
        }

        return NextResponse.json({
            success: true,
            results,
            message: 'Database initialized! You can now log in with admin/admin12345'
        });

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('DB init error:', errorMsg);
        return NextResponse.json({
            success: false,
            results,
            error: errorMsg
        }, { status: 500 });
    }
}
