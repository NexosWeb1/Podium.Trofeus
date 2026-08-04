/* ============================================================
   config.js: dados de negócio e ajustes globais.
   FONTE ÚNICA de contato: trocar WhatsApp, telefone, e-mail,
   Instagram, endereço e horário aqui, e em nenhum outro lugar.

   Campos vazios somem da interface em vez de aparecer em branco
   (ver hydrateContactLinks em js/main.js).
   ============================================================ */

export const CONFIG = {
  brand: 'Podium Premiações',

  // WhatsApp em formato E.164: só dígitos, com DDI 55 e DDD.
  whatsapp: '5537999120682',
  phoneDisplay: '(37) 99912-0682',

  email: 'comercial@podiumbrindes.com.br',

  // URL completa do perfil e o @ como aparece na tela.
  instagram: 'https://www.instagram.com/podium_premiacoes/',
  instagramHandle: '@podium_premiacoes',

  address: {
    street: 'Rua Enfermeira Helena, 161',
    district: 'Morro do Engenho',
    city: 'Itaúna',
    state: 'MG',
    cep: '35682-351',
  },

  hours: [
    // PENDENTE: confirmar com o cliente.
    { days: 'Segunda a sexta', time: '08h às 18h' },
    { days: 'Sábado', time: '08h às 12h' },
    { days: 'Domingo', time: 'Fechado' },
  ],

  // Mensagem base dos CTAs simples (hero, nav, rodapé) que abrem o WhatsApp.
  quickMessage:
    'Olá! Vim pelo site e gostaria de solicitar um orçamento de troféus personalizados.',
};

/**
 * Monta um link wa.me com mensagem pré-preenchida.
 * Sem número configurado, devolve o wa.me genérico com o texto pronto,
 * em vez de um `wa.me//?text=` quebrado.
 * @param {string} message Texto com quebras de linha reais.
 * @returns {string}
 */
export function waLink(message = CONFIG.quickMessage) {
  const text = encodeURIComponent(message);
  return CONFIG.whatsapp
    ? `https://wa.me/${CONFIG.whatsapp}?text=${text}`
    : `https://wa.me/?text=${text}`;
}
