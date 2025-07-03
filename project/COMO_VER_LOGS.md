# 🔍 Como Ver Logs e Erros - VaraYield AI

## ✅ **Status Atual do Sistema**

**Aplicação:** ✅ Rodando em http://localhost:3000  
**RPC Endpoints:** ✅ 2/5 funcionando (ClusterAPI + Solana Official)  
**Build:** ✅ Funcionando  
**Dependências:** ✅ Instaladas  

---

## 🚀 **Métodos Para Ver Logs (Em Ordem de Prioridade)**

### **1. 🌐 Console do Navegador (PRINCIPAL)**

```bash
# 1. Abrir aplicação
http://localhost:3000

# 2. Abrir DevTools
Pressionar F12 ou Ctrl+Shift+I

# 3. Ir na aba "Console"

# 4. Colar o script de monitoramento:
```

**Script para colar no console:**
```javascript
// Cole este código no console do navegador (F12)

console.log('🔍 Monitor de logs ativado');

// Interceptar console.error
const originalError = console.error;
console.error = function(...args) {
  originalError.apply(console, ['❌ ERRO:', ...args]);
  return originalError.apply(console, arguments);
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

console.log('✅ Monitor configurado! Todos os erros serão logados aqui.');
```

**Logs que você verá:**
```javascript
🌐 Using Solana mainnet RPC endpoint: https://api.mainnet-beta.solana.com/
🏭 Production mode detected - wallet service configured for real data only
🚀 Using enhanced wallet service for optimal performance
📡 Fetching SOL balance with fallback...
💰 SOL balance: 1.45 SOL
✅ Wallet balances fetched successfully in 2.3s
```

---

### **2. 🛠️ Debug Integrado na Interface**

```bash
# 1. Abrir: http://localhost:3000
# 2. Na barra lateral, clicar em "Wallet Debug"
# 3. Conectar sua carteira
# 4. Clicar "Run Tests"
```

**Testes executados:**
- ✅ Wallet Info
- ✅ RPC Connection  
- ✅ RPC Fallback Status
- ✅ SOL Balance (Direct)
- ✅ SOL Balance (Fallback)
- ✅ SPL Token Accounts
- ✅ Wallet Service (Full)

---

### **3. 📊 Network Tab (Requisições HTTP)**

```bash
# 1. F12 → aba "Network"
# 2. Filtrar por "Fetch/XHR"
# 3. Recarregar página
# 4. Ver todas as requisições
```

**Status codes importantes:**
- **200** = Sucesso
- **403/429** = Rate limit
- **500** = Erro servidor
- **Failed** = Erro de rede

---

### **4. 🔧 Script de Diagnóstico RPC**

```bash
cd project
node scripts/diagnose-rpc.js
```

**Resultado atual:**
```
✅ Working endpoints: 2/5
🏆 Fastest endpoints:
   1. ClusterAPI - 966ms
   2. Solana Official - 1920ms

💥 Failed endpoints:
   • Ankr: 403 Forbidden (API key inválida)
   • Public RPC: fetch failed
   • Helius: 401 Unauthorized (API key inválida)
```

---

### **5. 📱 Monitor Completo**

```bash
cd project
node scripts/monitor-logs.js
```

**Verifica:**
- Status da aplicação
- Variáveis de ambiente
- Dependências
- Build files
- Conectividade RPC
- Instruções de debug

---

## 🐛 **Erros Comuns e Soluções**

### **❌ "RPC endpoint error"**
**Console mostra:** `Failed to fetch wallet balances`  
**Solução:** Sistema já possui fallback automático para endpoints funcionais

### **❌ "Wallet connection timeout"**
**Console mostra:** `Connection timeout`  
**Solução:**
1. Verificar se Phantom está desbloqueada
2. Recarregar página (Ctrl+F5)
3. Tentar carteira diferente

### **❌ "Rate limit exceeded"**
**Console mostra:** `429 Too Many Requests`  
**Solução:** Sistema já possui fallback automático

### **❌ "Module not found"**
**Terminal mostra:** `Cannot resolve dependency`  
**Solução:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 🎯 **Checklist de Troubleshooting**

Quando algo não funciona:

1. ✅ **Abrir console do navegador** (F12 → Console)
2. ✅ **Colar script de monitoramento** (código acima)
3. ✅ **Verificar aba Network** (F12 → Network)
4. ✅ **Usar "Wallet Debug"** na interface
5. ✅ **Executar diagnóstico RPC** (`node scripts/diagnose-rpc.js`)
6. ✅ **Verificar se carteira está desbloqueada**
7. ✅ **Testar em aba anônima** (sem cache)
8. ✅ **Reiniciar aplicação** se necessário

---

## 📋 **Comandos Úteis**

### **Ver logs em tempo real:**
```bash
# Servidor de desenvolvimento
npm run dev

# Monitor completo
node scripts/monitor-logs.js

# Diagnóstico RPC
node scripts/diagnose-rpc.js
```

### **Reset completo:**
```bash
rm -rf node_modules package-lock.json dist .vite
npm install
npm run build
npm run serve
```

### **Verificar status:**
```bash
# Processos rodando
ps aux | grep "npm\|vite" | grep -v grep

# Portas em uso
netstat -tulpn | grep ":3000\|:5173"

# Status git
git status
```

---

## 🎮 **Como Reportar Bugs**

Se encontrar erros, inclua:

1. **Screenshot do console** (F12 → Console)
2. **Logs do terminal** completos
3. **Resultado do diagnóstico RPC**
4. **Carteira utilizada** (Phantom/Solflare)
5. **Sistema operacional** e navegador
6. **Passos para reproduzir** o erro

---

## 🚀 **Próximos Passos**

1. **Abra:** http://localhost:3000
2. **Console:** F12 → Console → Cole o script de monitoramento
3. **Conecte carteira** e observe os logs
4. **Use "Wallet Debug"** para testes detalhados
5. **Monitore Network tab** para requisições HTTP

**🎯 Com esses métodos você consegue identificar e resolver qualquer problema no sistema!**