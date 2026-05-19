import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const envPath = path.join(process.cwd(), '..', 'backend', '.env');
    
    const status = {
      GOOGLE_MAPS_API_KEY: false,
      GEMINI_API_KEY: false,
      BR_API_BASE_URL: true, // Always active (free API)
    };

    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const lines = content.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#') || !trimmed.includes('=')) continue;
        
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=').trim();
        
        if (key.trim() === 'GOOGLE_MAPS_API_KEY' && value.length > 0) {
          status.GOOGLE_MAPS_API_KEY = true;
        }
        if (key.trim() === 'GEMINI_API_KEY' && value.length > 0) {
          status.GEMINI_API_KEY = true;
        }
      }
    }

    return NextResponse.json(status);
  } catch (error) {
    console.error('Erro ao verificar status das APIs:', error);
    return NextResponse.json({
      GOOGLE_MAPS_API_KEY: false,
      GEMINI_API_KEY: false,
      BR_API_BASE_URL: true,
    });
  }
}
