import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/fix-resources?secret=qomus-fix-2026
// This endpoint updates existing resources to use external demo files

export async function GET(request: NextRequest) {
    const secret = request.nextUrl.searchParams.get('secret');
    const expectedSecret = process.env.DB_INIT_SECRET || 'qomus-fix-2026';

    if (secret !== expectedSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const results: string[] = [];

        // Working PDF URL (verified 200 OK)
        const pdfUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
        // Working DOCX URL (verified 200 OK)
        const docxUrl = 'https://calibre-ebook.com/downloads/demos/demo.docx';

        // Update resources with local file paths or broken URLs to working demo files
        const pdfUpdated = await prisma.resource.updateMany({
            where: {
                OR: [
                    { fileUrl: { startsWith: '/uploads/', endsWith: '.pdf' } },
                    { fileUrl: { contains: 'africau.edu' } }
                ]
            },
            data: {
                fileUrl: pdfUrl
            }
        });

        results.push(`✅ Updated ${pdfUpdated.count} PDF resources to ${pdfUrl}`);

        const docxUpdated = await prisma.resource.updateMany({
            where: {
                OR: [
                    { fileUrl: { startsWith: '/uploads/', endsWith: '.docx' } },
                    { fileUrl: { contains: 'file-examples.com' } }
                ]
            },
            data: {
                fileUrl: docxUrl
            }
        });

        results.push(`✅ Updated ${docxUpdated.count} DOCX resources to ${docxUrl}`);

        // Get updated count
        const totalResources = await prisma.resource.count();
        results.push(`📊 Total resources in database: ${totalResources}`);

        return NextResponse.json({
            success: true,
            results,
            message: 'Resources updated successfully!'
        });

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error('Fix resources error:', errorMsg);
        return NextResponse.json({
            success: false,
            error: errorMsg
        }, { status: 500 });
    }
}
