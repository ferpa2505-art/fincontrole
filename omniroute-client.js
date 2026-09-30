/**
 * OmniRoute Client — Cliente para chamar Claude via OmniRoute Gateway
 * Use em qualquer lugar do FinControle
 * 
 * Exemplo:
 *   const claude = new OmniRouteClient();
 *   const resposta = await claude.call('Sua pergunta aqui');
 *   const analise = await claude.analisarDados(fluxoCaixa);
 */

const OMNIROUTE_CONFIG = {
  API_URL: 'http://localhost:20128/v1/messages',
  MODEL: 'claude-sonnet-5-5',
  MAX_TOKENS: 2048,
  TIMEOUT: 30000 // 30 segundos
};

class OmniRouteClient {
  constructor(config = {}) {
    this.config = { ...OMNIROUTE_CONFIG, ...config };
    this.isOnline = false;
    this.checkConnection();
  }

  /**
   * Verifica se OmniRoute está online
   */
  async checkConnection() {
    try {
      const response = await fetch(this.config.API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.MODEL,
          max_tokens: 100,
          system: 'Responda com "OK"',
          messages: [{ role: 'user', content: 'OK' }]
        })
      });
      this.isOnline = response.ok;
      console.log('[OmniRoute] Status:', this.isOnline ? '🟢 Online' : '🔴 Offline');
    } catch (error) {
      this.isOnline = false;
      console.warn('[OmniRoute] Offline:', error.message);
    }
  }

  /**
   * Chama Claude via OmniRoute
   * @param {string} userMessage — Mensagem do usuário
   * @param {string} systemPrompt — Prompt do sistema (opcional)
   * @param {object} options — Opções adicionais (maxTokens, etc)
   * @returns {Promise<string>} Resposta de Claude
   */
  async call(userMessage, systemPrompt = '', options = {}) {
    if (!this.isOnline) {
      await this.checkConnection();
      if (!this.isOnline) {
        throw new Error('OmniRoute não está disponível. Certifique-se que está rodando em localhost:20128');
      }
    }

    try {
      const requestBody = {
        model: this.config.MODEL,
        max_tokens: options.max_tokens || this.config.MAX_TOKENS,
        system: systemPrompt || 'Você é um assistente útil e prestativo.',
        messages: [
          {
            role: 'user',
            content: userMessage
          }
        ]
      };

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.config.TIMEOUT);

      const response = await fetch(this.config.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OmniRoute error: ${response.status} — ${error}`);
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || '';
      return content;
    } catch (error) {
      console.error('[OmniRoute] Erro ao chamar Claude:', error);
      throw error;
    }
  }

  /**
   * Analisa dados financeiros e sugere insights
   * @param {object} dadosFinanceiros — { fluxoCaixa: array, totalEntradas: number, totalSaidas: number, contas: array }
   * @returns {Promise<string>} Análise de Claude
   */
  async analisarDados(dadosFinanceiros) {
    const systemPrompt = `Você é um analista financeiro especializado em finanças pessoais.
Analise os dados apresentados e forneça insights úteis sobre o fluxo de caixa, padrões de gastos e saúde financeira.
Seja conciso e prático. Use formatação clara com tópicos quando apropriado.
Sempre responda em Português (Brasil).`;

    const userMessage = `Analise meus dados financeiros:

Período: ${new Date().toLocaleDateString('pt-BR')}
Total de Entradas: R$ ${dadosFinanceiros.totalEntradas?.toFixed(2) || '0,00'}
Total de Saídas: R$ ${dadosFinanceiros.totalSaidas?.toFixed(2) || '0,00'}
Saldo: R$ ${(dadosFinanceiros.totalEntradas - dadosFinanceiros.totalSaidas)?.toFixed(2) || '0,00'}

Transações:
${dadosFinanceiros.fluxoCaixa?.slice(0, 20)?.map((t, i) => 
  `${i + 1}. ${t.description || 'Sem descrição'} — R$ ${t.amount?.toFixed(2) || '0,00'} (${t.type === 'income' ? 'Entrada' : 'Saída'}) [${t.category || 'Sem categoria'}]`
).join('\n') || 'Nenhuma transação'}

Forneça uma análise breve com insights sobre padrões, alertas e oportunidades.`;

    return this.call(userMessage, systemPrompt, { max_tokens: 1024 });
  }

  /**
   * Sugere formas de economizar baseado em transações
   * @param {array} transacoes — Array de transações { description, amount, category, type, date }
   * @returns {Promise<string>} Sugestões de economia de Claude
   */
  async sugerirEconomia(transacoes) {
    const systemPrompt = `Você é um consultor de economia pessoal.
Analise os gastos apresentados e sugira formas práticas e realistas de economizar dinheiro.
Identifique padrões de gastos desnecessários, categorias onde há possibilidade de redução, e hábitos a otimizar.
Seja prático e motivador. Sempre responda em Português (Brasil).`;

    // Agrupa gastos por categoria
    const gastosPorCategoria = {};
    transacoes.filter(t => t.type === 'expense').forEach(t => {
      const cat = t.category || 'Outros';
      gastosPorCategoria[cat] = (gastosPorCategoria[cat] || 0) + (t.amount || 0);
    });

    const userMessage = `Analise meus gastos e sugira formas de economizar:

Gastos por categoria:
${Object.entries(gastosPorCategoria)
  .sort((a, b) => b[1] - a[1])
  .map(([cat, total]) => `• ${cat}: R$ ${total.toFixed(2)}`)
  .join('\n')}

Últimas transações (últimos 30 dias):
${transacoes.slice(-30).map((t, i) => 
  `${i + 1}. ${t.description || 'Sem descrição'} — R$ ${t.amount?.toFixed(2) || '0,00'} (${t.category || 'Sem categoria'}) — ${new Date(t.date).toLocaleDateString('pt-BR')}`
).join('\n')}

Forneça 3-5 sugestões práticas de economia, priorizando as mais impactantes.`;

    return this.call(userMessage, systemPrompt, { max_tokens: 1024 });
  }

  /**
   * Classifica uma transação automaticamente na categoria mais apropriada
   * @param {string} descricao — Descrição da transação
   * @param {array} categoriasDisponiveis — Categorias que o app conhece
   * @returns {Promise<string>} Categoria sugerida por Claude
   */
  async classificarTransacao(descricao, categoriasDisponiveis = []) {
    const systemPrompt = `Você é um classificador de transações financeiras.
Dado uma descrição de transação e uma lista de categorias disponíveis, sugira a categoria mais apropriada.
Responda APENAS com o nome da categoria, nada mais.
Se a descrição não se encaixar bem em nenhuma categoria, responda "Outros".`;

    const categorias = categoriasDisponiveis.length > 0 
      ? categoriasDisponiveis.join(', ')
      : 'Moradia, Alimentação, Transporte, Saúde, Lazer, Educação, Contas, Salário, Freelance, Vendas, Investimentos, Outros';

    const userMessage = `Classifique esta transação em uma destas categorias: ${categorias}

Descrição: "${descricao}"`;

    return this.call(userMessage, systemPrompt, { max_tokens: 50 });
  }
}

// Exportar para uso global
if (typeof window !== 'undefined') {
  window.OmniRouteClient = OmniRouteClient;
}
