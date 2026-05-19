# 📄 Plano de Simplificação Radical & CRM de Prospecção (v4.0)

Este plano detalha a simplificação do **Prospect-On 3.0** para focar 100% nas necessidades reais da **Otto Pinturas**: captação de dados reais (Telefone, E-mail, Endereço), gerenciamento de favoritos ("Leads Quentes") e um CRM simples para registro de interações e histórico de prospecção comercial.

---

## 🎯 1. Escopo de Alterações e Simplificação

### A. O que será Removido (Remover Ruído Financista)
*   Métricas de **VGV Estimado**, **Comissão de Venda**, **Lucro Estimado** e **Área Estimada em m²** baseada em andares fictícios.
*   Cálculos matemáticos complexos de orçamento no backend e no frontend.
*   Páginas ou abas de comissões e visualizadores de relatórios financeiros automáticos que confundem o usuário.

### B. O que será Adicionado (CRM de Prospecção Real)
1.  **Coluna e Lógica de Favoritos (`is_favorite`):**
    *   Adicionaremos o campo `is_favorite BOOLEAN DEFAULT 0` na tabela SQLite `leads`.
    *   Criaremos o endpoint `/api/leads/{lead_id}/favorite` no FastAPI para marcar/desmarcar favoritos.
    *   Adicionaremos o botão de estrela ("Favoritar") em cada linha da tabela de leads no Dashboard.
2.  **Aba "Leads Quentes" Simplificada:**
    *   A página `/leads-quentes` exibirá apenas os leads que foram marcados como favoritos (`is_favorite = 1`).
    *   A página usará o mesmo componente de listagem para manter o design coeso, sem repetição desnecessária de código.
3.  **CRM de Contatos Unificado (`LeadDetailModal`):**
    *   Criaremos um modal único e lindo que substitui todas as versões anteriores de vistoria manual e detalhes.
    *   **Atalhos Rápidos de Ação:**
        *   **Botão Chamar no WhatsApp:** Abre diretamente o WhatsApp Web com o número do condomínio pré-configurado (`https://wa.me/55...`).
        *   **Botão Mandar E-mail:** Link `mailto` automático para o e-mail coletado.
    *   **Campos de Registro Comercial:**
        *   *Status do Contato* (Dropdown: `Aguardando Abordagem`, `Contato Iniciado`, `Proposta Enviada`, `Reunião Agendada`, `Sem Interesse`).
        *   *Anotações da Conversa* (Textarea para anotações rápidas das ligações ou mensagens).
        *   *Agendar Retorno* (Seletor de data e hora para ligar novamente).

---

## 🛠️ 2. Arquivos a Serem Modificados

### 1. Backend: Banco de Dados (`backend/src/utils/database.py`)
*   **Alteração:** Adicionar coluna `is_favorite` na tabela `leads`. Adicionar coluna `contact_status` para gerenciar a etapa do funil comercial.
*   **Ações:**
    *   Atualizar o método `_create_tables` para incluir a migração automática das colunas `is_favorite` e `contact_status`.
    *   Implementar `toggle_favorite(lead_id)` no banco.
    *   Atualizar `save_interaction` para salvar também o status do contato.

### 2. Backend: Endpoints API (`backend/api.py`)
*   **Alteração:** Criar o endpoint `POST /api/leads/{lead_id}/favorite` que recebe o estado do favorito e atualiza.
*   **Alteração:** Atualizar `POST /api/leads/{lead_id}/interaction` para receber `notes`, `return_date` e `status`.
*   **Alteração:** Simplificar `/api/analyze-lead` para apenas salvar contatos simples, sem calcular VGV.

### 3. Frontend: Componente de Tabela (`frontend/app/components/LeadTable.tsx`)
*   **Alteração:** Adicionar o botão de estrela para favoritar ao lado do nome do condomínio. Ao clicar, faz a requisição instantânea para a API e atualiza a estrela (preenchida/vazia).
*   **Alteração:** Ao clicar na linha, em vez de abrir a Vistoria manual financeira antiga, abre o novo `LeadDetailModal` simplificado.

### 4. Frontend: Novo Modal CRM (`frontend/app/components/LeadDetailModal.tsx`)
*   **Criação:** Criar um novo componente limpo contendo a imagem do condomínio, contatos (WhatsApp, E-mail, Site) e o painel CRM (Notas, Status, Data de Retorno).

### 5. Frontend: Aba Leads Quentes (`frontend/app/(system)/leads-quentes/page.tsx`)
*   **Alteração:** Reescrever a página para simplesmente filtrar os leads com `is_favorite === true` e listá-los. Remover todos os contadores de VGV acumulado e comissões.

---

## 🚦 3. Critérios de Aceitação

1.  **Botão de Favoritos Funcional:** Clicar na estrela no Dashboard adiciona o lead imediatamente aos favoritos no banco e na UI.
2.  **Lista Quente Reativa:** O lead favoritado aparece na página "Leads Quentes" imediatamente. Se desfavoritado, sai da lista quente.
3.  **CRM de Contatos Salva com Sucesso:** Preencher o status do contato e as anotações no modal atualiza o banco de dados e exibe o histórico correto.
4.  **Integração WhatsApp Web:** Clicar no telefone comercial redireciona para o WhatsApp de prospecção corretamente.
5.  **Interface Limpa:** Zero menções a VGV, comissões de corretagem ou valores prediais estimados.
