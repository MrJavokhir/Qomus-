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

        // Update resources with local file paths to use external demo files
        const pdfUpdated = await prisma.resource.updateMany({
            where: {
                fileUrl: {
                    startsWith: '/uploads/',
                    endsWith: '.pdf'
                }
            },
            data: {
                fileUrl: 'https://www.africau.edu/images/default/sample.pdf'
            }
        });

        results.push(`✅ Updated ${pdfUpdated.count} PDF resources`);

        const docxUpdated = await prisma.resource.updateMany({
            where: {
                fileUrl: {
                    startsWith: '/uploads/',
                    endsWith: '.docx'
                }
            },
            data: {
                fileUrl: 'https://file-examples.com/storage/fe1156b63820cb8f97146bd/2017/02/file-sample_100kB.docx'
            }
        });

        results.push(`✅ Updated ${docxUpdated.count} DOCX resources`);

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
