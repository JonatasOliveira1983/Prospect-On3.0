import { jsPDF } from "jspdf";

interface LeadData {
  name: string;
  address: string;
  score: number;
  category?: string;
  idade_anos: number;
  valuation: {
    total_appreciation_gain: number;
    gain_per_unit: number;
  };
  vision_analysis: {
    desgaste: string;
    urgencia: boolean;
    patologias?: string[];
  };
  market: {
    avg_m2_price: number;
    avg_m2?: number;
    total_units?: number;
    bairro?: string;
  };
}

export function generateReport(lead: LeadData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // ════════════════════════════════════════════
  // HEADER — Faixa azul Otto
  // ════════════════════════════════════════════
  doc.setFillColor(0, 51, 102);
  doc.rect(0, 0, pageWidth, 42, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("PROSPECT-ON 1.0", pageWidth / 2, 16, { align: "center" });
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Relatório de Integridade e Valorização Patrimonial", pageWidth / 2, 26, { align: "center" });
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, pageWidth / 2, 34, { align: "center" });

  // ════════════════════════════════════════════
  // NOME DO CONDOMÍNIO
  // ════════════════════════════════════════════
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(lead.name, pageWidth / 2, 56, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(lead.address, pageWidth / 2, 64, { align: "center" });

  // Linha separadora
  doc.setDrawColor(0, 51, 102);
  doc.setLineWidth(0.5);
  doc.line(20, 70, pageWidth - 20, 70);

  let y = 82;

  // ════════════════════════════════════════════
  // SEÇÃO 1: SCORE DE OPORTUNIDADE
  // ════════════════════════════════════════════
  doc.setTextColor(0, 51, 102);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("1. SCORE DE OPORTUNIDADE OTTO", 20, y);
  y += 10;

  doc.setFillColor(240, 240, 240);
  doc.rect(20, y - 4, pageWidth - 40, 28, 'F');

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Score de Prioridade:`, 30, y + 4);
  doc.setFont("helvetica", "bold");
  const scoreColor = lead.score >= 9 ? [220, 38, 38] : lead.score >= 6 ? [234, 179, 8] : [34, 197, 94];
  doc.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setFontSize(22);
  doc.text(`${lead.score.toFixed(1)} / 10.0`, 130, y + 6);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Categoria: ${lead.category || "N/A"}`, 30, y + 16);
  doc.text(`Idade do Edifício: ${lead.idade_anos} anos`, 130, y + 16);

  y += 38;

  // ════════════════════════════════════════════
  // SEÇÃO 2: DIAGNÓSTICO DE IMAGEM (IA VISION)
  // ════════════════════════════════════════════
  doc.setTextColor(0, 51, 102);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("2. DIAGNÓSTICO DE IMAGEM (IA VISION)", 20, y);
  y += 10;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Estado Detectado:", 30, y);
  
  const desgasteColor = lead.vision_analysis.desgaste === "Crítico" ? [220, 38, 38] :
    lead.vision_analysis.desgaste === "Elevado" ? [234, 136, 8] :
    lead.vision_analysis.desgaste === "Médio" ? [234, 179, 8] : [34, 197, 94];
  doc.setTextColor(desgasteColor[0], desgasteColor[1], desgasteColor[2]);
  doc.text(lead.vision_analysis.desgaste.toUpperCase(), 80, y);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  
  y += 8;
  doc.text(`Urgência de Intervenção: ${lead.vision_analysis.urgencia ? "SIM — Ação imediata recomendada" : "NÃO — Manutenção preventiva"}`, 30, y);
  
  y += 8;
  const patologias = lead.vision_analysis.patologias || [];
  if (patologias.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.text("Patologias Identificadas:", 30, y);
    doc.setFont("helvetica", "normal");
    y += 6;
    patologias.forEach((p: string) => {
      doc.text(`   • ${p}`, 30, y);
      y += 5;
    });
  } else {
    doc.text("Nenhuma patologia identificada pela IA.", 30, y);
    y += 6;
  }

  y += 4;
  doc.setFillColor(255, 248, 220);
  doc.rect(20, y - 2, pageWidth - 40, 14, 'F');
  doc.setFontSize(9);
  doc.setTextColor(100, 70, 0);
  doc.text("Análise baseada em visão computacional (Gemini Vision). Recomenda-se vistoria presencial para confirmação.", 30, y + 6);
  
  y += 22;

  // ════════════════════════════════════════════
  // SEÇÃO 3: DADOS DE MERCADO
  // ════════════════════════════════════════════
  doc.setTextColor(0, 51, 102);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("3. DADOS DE MERCADO IMOBILIÁRIO", 20, y);
  y += 10;

  doc.setFillColor(240, 240, 240);
  doc.rect(20, y - 4, pageWidth - 40, 24, 'F');

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Bairro: ${lead.market.bairro || "N/A"}`, 30, y + 4);
  doc.text(`Preço Médio do m²: R$ ${lead.market.avg_m2_price?.toLocaleString('pt-BR') || 'N/A'}`, 30, y + 12);
  doc.text(`m² Médio por Unidade: ${lead.market.avg_m2 || 'N/A'} m²`, 120, y + 4);
  doc.text(`Total de Unidades: ${lead.market.total_units || 'N/A'}`, 120, y + 12);

  y += 32;

  // ════════════════════════════════════════════
  // SEÇÃO 4: ÍNDICE DE VALORIZAÇÃO PATRIMONIAL
  // ════════════════════════════════════════════
  doc.setTextColor(0, 51, 102);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("4. ÍNDICE DE VALORIZAÇÃO PATRIMONIAL", 20, y);
  y += 10;

  // Big green box
  doc.setFillColor(230, 255, 230);
  doc.rect(20, y - 4, pageWidth - 40, 32, 'F');
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(0.8);
  doc.rect(20, y - 4, pageWidth - 40, 32, 'S');

  doc.setTextColor(0, 128, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("VALORIZAÇÃO ESTIMADA COM REVITALIZAÇÃO OTTO:", pageWidth / 2, y + 6, { align: "center" });
  
  doc.setFontSize(20);
  doc.text(`+R$ ${lead.valuation.total_appreciation_gain.toLocaleString('pt-BR')}`, pageWidth / 2, y + 20, { align: "center" });

  y += 38;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Ganho por Apartamento: R$ ${lead.valuation.gain_per_unit.toLocaleString('pt-BR')}`, 30, y);
  doc.text(`Fator de Valorização: 12% (base FIPE/SECOVI)`, 30, y + 7);

  y += 20;

  // ════════════════════════════════════════════
  // RODAPÉ
  // ════════════════════════════════════════════
  doc.setDrawColor(0, 51, 102);
  doc.setLineWidth(0.3);
  doc.line(20, 272, pageWidth - 20, 272);
  
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("PROSPECT-ON 1.0", pageWidth / 2, 280, { align: "center" });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Este relatório é gerado automaticamente para fins de prospecção comercial.", pageWidth / 2, 288, { align: "center" });

  // Download
  const filename = `Laudo_Valorizacao_${lead.name.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
