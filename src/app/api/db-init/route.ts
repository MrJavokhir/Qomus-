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

        // Check if tables exist
        let tablesExist = false;
        try {
            await prisma.user.count();
            tablesExist = true;
            results.push('✅ Tables already exist');
        } catch {
            results.push('⚠️ Tables do not exist - creating...');
        }

        // Create tables if they don't exist
        if (!tablesExist) {
            try {
                // Create enums
                await prisma.$executeRaw`
                    DO $$ BEGIN
                        CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'ADMIN');
                    EXCEPTION
                        WHEN duplicate_object THEN null;
                    END $$;
                `;
                await prisma.$executeRaw`
                    DO $$ BEGIN
                        CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'DISABLED');
                    EXCEPTION
                        WHEN duplicate_object THEN null;
                    END $$;
                `;
                await prisma.$executeRaw`
                    DO $$ BEGIN
                        CREATE TYPE "EventStatus" AS ENUM ('UPCOMING', 'PAST');
                    EXCEPTION
                        WHEN duplicate_object THEN null;
                    END $$;
                `;
                await prisma.$executeRaw`
                    DO $$ BEGIN
                        CREATE TYPE "RatingStatus" AS ENUM ('GREEN', 'YELLOW', 'RED');
                    EXCEPTION
                        WHEN duplicate_object THEN null;
                    END $$;
                `;
                await prisma.$executeRaw`
                    DO $$ BEGIN
                        CREATE TYPE "FileType" AS ENUM ('PDF', 'DOCX', 'OTHER');
                    EXCEPTION
                        WHEN duplicate_object THEN null;
                    END $$;
                `;
                await prisma.$executeRaw`
                    DO $$ BEGIN
                        CREATE TYPE "VideoSourceType" AS ENUM ('UPLOAD', 'URL');
                    EXCEPTION
                        WHEN duplicate_object THEN null;
                    END $$;
                `;
                results.push('✅ Enums created');

                // Create tables using raw SQL
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
                results.push('✅ Users table created');

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
                        "status" "EventStatus" NOT NULL DEFAULT 'UPCOMING',
                        "cover_image_url" TEXT,
                        "created_by_id" TEXT NOT NULL,
                        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        CONSTRAINT "events_pkey" PRIMARY KEY ("id")
                    );
                `;
                results.push('✅ Events table created');

                await prisma.$executeRaw`
                    CREATE TABLE IF NOT EXISTS "event_images" (
                        "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
                        "event_id" TEXT NOT NULL,
                        "image_url" TEXT NOT NULL,
                        "order" INTEGER NOT NULL DEFAULT 0,
                        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        CONSTRAINT "event_images_pkey" PRIMARY KEY ("id")
                    );
                `;
                results.push('✅ Event images table created');

                await prisma.$executeRaw`
                    CREATE TABLE IF NOT EXISTS "team_registrations" (
                        "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
                        "event_id" TEXT NOT NULL,
                        "team_name" TEXT NOT NULL,
                        "members_count" INTEGER NOT NULL,
                        "leader_user_id" TEXT NOT NULL,
                        "rating_status" "RatingStatus" NOT NULL DEFAULT 'GREEN',
                        "notes" TEXT,
                        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        CONSTRAINT "team_registrations_pkey" PRIMARY KEY ("id")
                    );
                `;
                results.push('✅ Team registrations table created');

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
                results.push('✅ Reports table created');

                await prisma.$executeRaw`
                    CREATE TABLE IF NOT EXISTS "resources" (
                        "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
                        "title_uz" TEXT NOT NULL,
                        "title_en" TEXT NOT NULL,
                        "description_uz" TEXT NOT NULL,
                        "description_en" TEXT NOT NULL,
                        "file_url" TEXT NOT NULL,
                        "file_type" "FileType" NOT NULL DEFAULT 'PDF',
                        "tags" JSONB NOT NULL DEFAULT '[]',
                        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
                    );
                `;
                results.push('✅ Resources table created');

                await prisma.$executeRaw`
                    CREATE TABLE IF NOT EXISTS "videos" (
                        "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
                        "title_uz" TEXT NOT NULL,
                        "title_en" TEXT NOT NULL,
                        "description_uz" TEXT NOT NULL,
                        "description_en" TEXT NOT NULL,
                        "video_url" TEXT NOT NULL,
                        "source_type" "VideoSourceType" NOT NULL DEFAULT 'URL',
                        "duration_seconds" INTEGER,
                        "thumbnail_url" TEXT,
                        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
                    );
                `;
                results.push('✅ Videos table created');

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
                results.push('✅ Partners table created');

                await prisma.$executeRaw`
                    CREATE TABLE IF NOT EXISTS "team_members" (
                        "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
                        "full_name" TEXT NOT NULL,
                        "position_uz" TEXT NOT NULL,
                        "position_en" TEXT NOT NULL,
                        "bio_uz" TEXT NOT NULL DEFAULT '',
                        "bio_en" TEXT NOT NULL DEFAULT '',
                        "photo_url" TEXT NOT NULL DEFAULT '',
                        "telegram_url" TEXT NOT NULL DEFAULT '',
                        "linkedin_url" TEXT NOT NULL DEFAULT '',
                        "instagram_url" TEXT NOT NULL DEFAULT '',
                        "order" INTEGER NOT NULL DEFAULT 0,
                        "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
                        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        CONSTRAINT "team_members_pkey" PRIMARY KEY ("id")
                    );
                `;
                results.push('✅ Team members table created');

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
                results.push('✅ Site sections table created');

                results.push('✅ All tables created successfully!');
            } catch (schemaError) {
                const errorMsg = schemaError instanceof Error ? schemaError.message : String(schemaError);
                results.push(`❌ Schema creation error: ${errorMsg}`);
                return NextResponse.json({ success: false, results, error: errorMsg }, { status: 500 });
            }
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
