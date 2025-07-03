
// Script para monitorar logs no navegador
// Cole este código no console do navegador (F12)

console.log('🔍 Monitor de logs ativado');

// Interceptar console.error
const originalError = console.error;
console.error = function(...args) {
  originalError.apply(console, ['❌ ERRO:', ...args]);
  return originalError.apply(console, arguments);
};

// Interceptar console.warn
const originalWarn = console.warn;
console.warn = function(...args) {
  originalWarn.apply(console, ['⚠️ AVISO:', ...args]);
  return originalWarn.apply(console, arguments);
};

// Interceptar fetch errors
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('🌐 Fetch:', args[0]);
  return originalFetch.apply(this, arguments)
    .then(response => {
      if (!response.ok) {
        console.error('🚫 Fetch failed:', response.status, response.statusText, args[0]);
      } else {
        console.log('✅ Fetch success:', response.status, args[0]);
      }
      return response;
    })
    .catch(error => {
      console.error('💥 Fetch error:', error.message, args[0]);
      throw error;
    });
};

// Monitorar erros globais
window.addEventListener('error', (event) => {
  console.error('💥 Erro global:', event.error?.message || event.message, {
    filename: event.filename,
    line: event.lineno,
    column: event.colno,
    error: event.error
  });
});

// Monitorar promises rejeitadas
window.addEventListener('unhandledrejection', (event) => {
  console.error('💥 Promise rejeitada:', event.reason);
});

console.log('✅ Monitor configurado! Todos os erros serão logados aqui.');
