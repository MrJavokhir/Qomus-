import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getCurrentUser, isAdmin } from '@/lib/auth';

const ALLOWED_TYPES = {
    'resource': ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'video': ['video/mp4'],
    'image': ['image/jpeg', 'image/png', 'image/webp']
};

const MAX_SIZES = {
    'resource': 50 * 1024 * 1024, // 50MB
    'video': 300 * 1024 * 1024,   // 300MB
    'image': 5 * 1024 * 1024      // 5MB
};

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || !isAdmin(user)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const uploadType = formData.get('type') as string || 'resource'; // resource, video, image

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate type
        const allowedTypes = ALLOWED_TYPES[uploadType as keyof typeof ALLOWED_TYPES];
        if (allowedTypes && !allowedTypes.includes(file.type)) {
            return NextResponse.json({
                error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
            }, { status: 400 });
        }

        // Validate size
        const maxSize = MAX_SIZES[uploadType as keyof typeof MAX_SIZES] || MAX_SIZES.resource;
        if (file.size > maxSize) {
            return NextResponse.json({
                error: `File too large. Max: ${Math.round(maxSize / (1024 * 1024))}MB`
            }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        const path = join(uploadDir, fileName);

        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        await writeFile(path, buffer);

        return NextResponse.json({
            url: `/uploads/${fileName}`,
            name: file.name,
            size: file.size,
            type: file.type,
            originalName: file.name
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
