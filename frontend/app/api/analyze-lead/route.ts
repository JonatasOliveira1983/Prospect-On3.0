import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/config';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const response = await fetch(`${BACKEND_URL}/api/analyze-lead`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            cache: 'no-store'
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Erro ao analisar lead' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Erro ao conectar com a API de análise:', error);
        return NextResponse.json({ error: 'Servidor Backend Offline' }, { status: 503 });
    }
}