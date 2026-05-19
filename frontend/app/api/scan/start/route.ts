import { NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/config';

export async function POST() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/scan/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Erro ao disparar varredura no backend' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao conectar com a API de Varredura:', error);
    return NextResponse.json({ error: 'Servidor Backend Offline' }, { status: 503 });
  }
}
