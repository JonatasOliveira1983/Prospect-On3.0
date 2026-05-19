import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/config';

export const dynamic = 'force-dynamic';

export async function GET() {
    const rawBackendUrl = process.env.BACKEND_URL;
    const rawNextPublic = process.env.NEXT_PUBLIC_API_URL;
    
    let fetchResult = 'Not tried';
    let fetchError = null;

    try {
        const testUrl = `${BACKEND_URL}/api/system/health`;
        const res = await fetch(testUrl, { cache: 'no-store' });
        fetchResult = `Status: ${res.status}, OK: ${res.ok}`;
    } catch (err: any) {
        fetchResult = 'Failed';
        fetchError = {
            message: err.message,
            stack: err.stack,
            code: err.code
        };
    }

    return NextResponse.json({
        config: {
            BACKEND_URL_import: BACKEND_URL,
            process_env_BACKEND_URL: rawBackendUrl || null,
            process_env_NEXT_PUBLIC_API_URL: rawNextPublic || null,
        },
        test_fetch: {
            result: fetchResult,
            error: fetchError
        }
    });
}
