import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Busca os dados diretamente da API Backend (SQL) v5.1
    const response = await fetch('http://localhost:8002/api/leads', {
      cache: 'no-store' // Garante dados sempre frescos do SQL
    });
    
    if (!response.ok) {
      return NextResponse.json({ error: 'Erro ao buscar dados do backend' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao conectar com a API SQL:', error);
    return NextResponse.json({ error: 'Servidor Backend Offline' }, { status: 503 });
  }
}
