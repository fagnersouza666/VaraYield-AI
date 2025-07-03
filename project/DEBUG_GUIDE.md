# 🔍 Guia de Debug - Como Ver Logs e Erros

## 🚀 **Métodos para Ver Logs**

### **1. Console do Navegador (PRINCIPAL)**
```bash
# 1. Abrir aplicação
npm run dev

# 2. Abrir no navegador: http://localhost:5173
# 3. Pressionar F12 ou Ctrl+Shift+I
# 4. Ir na aba "Console"
```

**Logs que você verá:**
```javascript
🌐 Using Solana mainnet RPC endpoint: https://mainnet.helius-rpc.com/?api-key=...
🏭 Production mode detected - wallet service configured for real data only
🚀 Using enhanced wallet service for optimal performance
📡 Fetching SOL balance with fallback...
💰 SOL balance: 1.45 SOL
🪙 Fetching SPL token accounts...
📊 Found 5 SPL token accounts
✅ Wallet balances fetched successfully in 2.3s
```

**Erros comuns:**
```javascript
❌ Failed to fetch wallet balances: RPC endpoint error
❌ Wallet connection timeout
❌ Rate limit exceeded
```

---

### **2. Terminal (Servidor de Desenvolvimento)**
```bash
cd project
npm run dev
```

**Logs do terminal:**
```
  VITE v5.4.19  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

**Erros de compilação aparecerão aqui:**
```
[vite] Internal server error: Failed to resolve import
Error: Cannot resolve dependency
```

---

### **3. Debug Integrado (Interface)**
```bash
# 1. Abrir aplicação: http://localhost:5173
# 2. Na barra lateral, clicar em "Wallet Debug"
# 3. Conectar carteira
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
- ✅ Demo Mode Test

---

### **4. Script de Diagnóstico RPC**
```bash
cd project
node scripts/diagnose-rpc.js
```

**Output esperado:**
```
🚀 VaraYield AI - RPC Endpoint Diagnostic Tool
================================================

🔍 Testing: Helius (Primary)
   URL: https://mainnet.helius-rpc.com/?api-key=...
   ✅ Version: 1.18.22 (518ms)
   ✅ Current slot: 123456789 (245ms)
   ✅ Balance query: 1.45 SOL (156ms)
   🎉 SUCCESS - Total time: 919ms

📊 SUMMARY
==========
✅ Working endpoints: 3/5
❌ Failed endpoints: 2/5

🏆 Fastest endpoints:
   1. Helius - 919ms
   2. Solana Official - 1247ms
   3. ClusterAPI - 1456ms
```

---

## 🐛 **Tipos de Erro e Como Resolver**

### **❌ Erro: "RPC endpoint error"**
**Sintomas:**
- Portfolio não carrega
- Carteira conecta mas não mostra saldos
- Console mostra: `Failed to fetch`

**Diagnóstico:**
```bash
# 1. Testar endpoints
node scripts/diagnose-rpc.js

# 2. Verificar .env
cat .env
```

**Solução:**
```bash
# Usar endpoint funcionais
VITE_VARA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=f3115e1c-7ca9-446f-8c67-a58ae9b4c8da
```

---

### **❌ Erro: "Wallet connection timeout"**
**Sintomas:**
- Botão "Connect Wallet" fica carregando
- Phantom não abre
- Console mostra: `Connection timeout`

**Solução:**
1. **Verificar se Phantom está instalada e desbloqueada**
2. **Recarregar página** (Ctrl+F5)
3. **Tentar carteira diferente** (Solflare)
4. **Verificar rede** (deve estar em Mainnet)

---

### **❌ Erro: "Module not found" ou "Cannot resolve"**
**Sintomas:**
- Página em branco
- Terminal mostra erro de import
- Build falha

**Solução:**
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

### **❌ Erro: "Rate limit exceeded"**
**Sintomas:**
- Dados carregam lentamente
- Console mostra: `429 Too Many Requests`
- Falhas intermitentes

**Solução:**
- ✅ **Sistema já possui fallback automático**
- ✅ **Aguardar alguns minutos**
- ✅ **Configurar RPC pago para produção**

---

## 📊 **Monitoramento Avançado**

### **Network Tab (F12 → Network)**
- Mostra todas as requisições HTTP
- Filtre por "Fetch/XHR" para ver APIs
- Status codes: 200 = OK, 403/429 = Rate limit, 500 = Erro servidor

### **Application Tab (F12 → Application)**
- Local Storage: configurações salvas
- Session Storage: dados temporários
- Service Workers: cache

### **Performance Tab (F12 → Performance)**
- Grave uma sessão para ver performance
- Identifica gargalos de carregamento

---

## 🔧 **Comandos de Debug Úteis**

### **Verificar Status Geral:**
```bash
# Status do git
git status

# Verificar dependências
npm list --depth=0

# Verificar portas em uso
netstat -tulpn | grep :5173
```

### **Logs Detalhados:**
```bash
# Vite com debug
DEBUG=vite:* npm run dev

# Build com informações detalhadas
npm run build -- --debug

# Verificar TypeScript
npx tsc --noEmit
```

### **Reset Completo:**
```bash
# Limpar tudo e reinstalar
rm -rf node_modules package-lock.json dist .vite
npm install
npm run dev
```

---

## 🎯 **Checklist de Troubleshooting**

### **Quando algo não funciona:**
1. ✅ **Verificar console do navegador** (F12)
2. ✅ **Verificar terminal** onde roda `npm run dev`
3. ✅ **Testar com "Wallet Debug"** na interface
4. ✅ **Executar diagnóstico RPC** com script
5. ✅ **Verificar se carteira está desbloqueada**
6. ✅ **Testar em aba anônima** (sem cache)
7. ✅ **Verificar conexão internet**
8. ✅ **Reiniciar aplicação** se necessário

### **Para reportar bugs:**
1. **Screenshot** do erro no console
2. **Logs do terminal** completos
3. **Resultado** do diagnóstico RPC
4. **Carteira** que está usando (Phantom/Solflare)
5. **Sistema operacional** e navegador

---

## 📱 **Como Acessar Debug**

### **Via Interface:**
1. Abrir: http://localhost:5173
2. Sidebar → "Wallet Debug" 
3. Conectar carteira
4. "Run Tests"

### **Via Console (Avançado):**
```javascript
// No console do navegador (F12)

// Ver status do wallet service
window.walletService?.getWalletMode()

// Forçar modo demo
window.walletService?.setWalletMode('demo')

// Ver status RPC
window.rpcFallback?.getEndpointStatus()

// Testar conexão
await window.connection?.getVersion()
```

---

**🎯 Com esses métodos você consegue identificar e resolver qualquer problema no sistema!**