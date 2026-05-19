import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await request.json();

        const response = await fetch(`http://localhost:8002/api/leads/${id}/interaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            cache: 'no-store'
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Erro ao salvar interação' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Erro ao conectar com a API de interações:', error);
        return NextResponse.json({ error: 'Servidor Backend Offline' }, { status: 503 });
    }
}