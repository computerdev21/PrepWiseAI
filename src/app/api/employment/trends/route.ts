import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';
import { ApiResponse } from '@/lib/types';
import { statisticsCanadaService } from '@/lib/services/statisticsCanadaService';
import { rateLimit } from '@/lib/utils/rateLimit';

export async function GET(request: NextRequest) {
    try {
        // Rate limiting
        const rateLimitResult = await rateLimit.check(request, 'employment_trends', 25, 60); // 25 requests per minute
        if (!rateLimitResult.success) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Rate limit exceeded'
            }, { status: 429 });
        }

        // Authentication
        const authHeader = request.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json<ApiResponse<null>>({
                success: false,
                error: 'Unauthorized'
            }, { status: 401 });
        }

        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        const userId = decodedToken.uid;

        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const region = searchParams.get('region') || 'canada';
        const months = parseInt(searchParams.get('months') || '24', 10);

        // Fetch data
        const [trends, industries, regional] = await Promise.all([
            statisticsCanadaService.getEmploymentTrends(),
            statisticsCanadaService.getTopIndustries(),
            statisticsCanadaService.getRegionalBreakdown()
        ]);

        // Filter and process data based on query parameters
        const response = {
            trends: {
                ...trends,
                historicalTrends: trends.historicalTrends.slice(0, months)
            },
            topIndustries: industries,
            regional: regional.find(r => r.region.toLowerCase() === region.toLowerCase()) || regional[0]
        };

        return NextResponse.json<ApiResponse<typeof response>>({
            success: true,
            data: response
        });
    } catch (error) {
        console.error('Error fetching employment trends:', error);
        return NextResponse.json<ApiResponse<null>>({
            success: false,
            error: 'Failed to fetch employment trends'
        }, { status: 500 });
    }
} 