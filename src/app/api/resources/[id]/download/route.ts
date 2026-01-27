import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

        // For local files (legacy), redirect to the file
        return NextResponse.redirect(new URL(fileUrl, request.url));

    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
