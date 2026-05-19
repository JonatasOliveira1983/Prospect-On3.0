import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch('http://localhost:8002/api/usage', {
            cache: 'no-store'
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'Erro ao buscar uso' }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Erro ao conectar com a API de uso:', error);
        return NextResponse.json({ error: 'Servidor Backend Offline' }, { status: 503 });
    }
}