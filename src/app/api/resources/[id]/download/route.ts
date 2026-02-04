import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import { join } from 'path';

// GET /api/resources/[id]/download - Download resource file
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const resource = await prisma.resource.findUnique({
            where: { id },
        });

        if (!resource) {
            return NextResponse.json({ error: 'Resource not found' }, { status: 404 });
        }

        const fileUrl = resource.fileUrl;

        // If it's an external URL, redirect to it with download headers
        if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
            // For external URLs, we fetch and stream the file
            try {
                const fileResponse = await fetch(fileUrl);
                if (!fileResponse.ok) {
                    return NextResponse.json({ error: 'File not accessible' }, { status: 404 });
                }

                const contentType = fileResponse.headers.get('content-type') || 'application/octet-stream';
                const fileName = resource.titleEn.replace(/[^a-zA-Z0-9]/g, '_') +
                    (resource.fileType === 'PDF' ? '.pdf' : '.docx');

                return new NextResponse(fileResponse.body, {
                    headers: {
                        'Content-Type': contentType,
                        'Content-Disposition': `attachment; filename="${fileName}"`,
                    },
                });
            } catch {
                return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
            }
        }

        // Handle local files - serve from filesystem
        const localPath = fileUrl.startsWith('/uploads/')
            ? join(process.cwd(), 'public', fileUrl)
            : join(process.cwd(), 'public', 'uploads', fileUrl);

        try {
            const fileBuffer = await readFile(localPath);

            // Determine content type based on file extension
            const ext = fileUrl.split('.').pop()?.toLowerCase();
            const contentTypeMap: Record<string, string> = {
                'pdf': 'application/pdf',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'doc': 'application/msword',
                'txt': 'text/plain',
            };
            const contentType = contentTypeMap[ext || ''] || 'application/octet-stream';
            const fileName = resource.titleEn.replace(/[^a-zA-Z0-9]/g, '_') +
                (resource.fileType === 'PDF' ? '.pdf' : resource.fileType === 'DOCX' ? '.docx' : `.${ext}`);

            return new NextResponse(fileBuffer, {
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': `attachment; filename="${fileName}"`,
                },
            });
        } catch (fileError) {
            console.error('File read error:', fileError);
            return NextResponse.json({ error: 'File not found on server' }, { status: 404 });
        }

    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
