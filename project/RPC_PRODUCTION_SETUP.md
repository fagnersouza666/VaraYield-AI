# 🚀 Configuração RPC para Produção

## 📊 **Comparação de Provedores RPC (2024)**

### **🥇 Helius - Especialista em Solana (RECOMENDADO)**

**Por que escolher:**
- ✅ Especializado 100% em Solana
- ✅ Top 1% em performance e confiabilidade  
- ✅ 1 RPC call = 1 crédito (outros cobram até 500 créditos por call)
- ✅ Powera mais de 50% do ecossistema Solana

**Planos:**
- **Free**: $0 - 1M créditos, 10 req/sec
- **Developer**: $49 - 10M créditos, 50 req/sec ⭐ **RECOMENDADO**
- **Business**: $499 - 100M créditos, 200 req/sec
- **Professional**: $999 - 200M créditos, 500 req/sec

### **🥈 QuickNode - Multi-Chain**

**Características:**
- ✅ 99.99% uptime SLA
- ✅ Nodes geograficamente distribuídos
- ✅ APIs customizadas para NFTs

**Planos:**
- **Free**: $0 - 10M créditos, 15 req/sec
- **Build**: $49 - 80M créditos, 50 req/sec
- **Scale**: $499 - 950M créditos, 250 req/sec

### **🥉 Alchemy - Enterprise**

**Vantagens:**
- ✅ 98% Customer Satisfaction
- ✅ Suporte enterprise dedicado
- ✅ 300M requests no free tier

**Limitações:**
- ⚠️ Foco principal em Ethereum
- ⚠️ Menos features específicas para Solana

---

## 🎯 **Recomendação por Caso de Uso**

### **Para MVP/Testes**
**Helius Free** ou **QuickNode Free**
- Suficiente para desenvolvimento
- Sem custos iniciais
- Fácil upgrade posterior

### **Para Produção Pequena/Média** ⭐
**Helius Developer ($49/mês)**
- 10M créditos = ~500k requests típicas
- 50 req/sec = suficiente para maioria dos apps
- Suporte via chat
- Melhor custo-benefício

### **Para Produção em Escala**
**Helius Business ($499/mês)**
- 100M créditos = ~5M requests
- 200 req/sec para high-traffic
- Suporte prioritário

---

## ⚙️ **Como Configurar**

### **1. Criar Conta Helius**
1. Acesse [helius.dev](https://helius.dev)
2. Registre-se e faça login
3. Vá em Dashboard → API Keys
4. Copie sua API key

### **2. Configurar no Projeto**
Edite o arquivo `.env`:

```bash
# Helius (recomendado)
VITE_VARA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=SEU_HELIUS_KEY

# QuickNode (alternativa)
# VITE_VARA_RPC_URL=https://your-endpoint.solana-mainnet.quiknode.pro/YOUR_KEY/

# Alchemy (enterprise)
# VITE_VARA_RPC_URL=https://solana-mainnet.g.alchemy.com/v2/YOUR_KEY
```

### **3. Testar Conexão**
```bash
npm run dev
```

No console, procure por:
```
🌐 Using Solana mainnet RPC endpoint: https://mainnet.helius-rpc.com/?api-key=...
✅ Using reliable Helius endpoint
```

---

## 📈 **Estimativa de Uso**

### **Requests Típicas por Funcionalidade:**

| Funcionalidade | Requests/Usuário | Créditos Helius |
|----------------|------------------|------------------|
| Connect Wallet | 1-2 | 1-2 |
| Get SOL Balance | 1 | 1 |
| Get Token Accounts | 2-5 | 2-5 |
| Get Token Balances | 5-20 | 5-20 |
| Get Token Prices | 1-10 | 1-10 |
| Portfolio Full Load | 10-50 | 10-50 |

### **Estimativa Mensal:**

| Usuários Ativos | Requests/Mês | Plano Recomendado |
|-----------------|--------------|-------------------|
| 100-500 | 50k-500k | Helius Free |
| 500-5k | 500k-5M | **Helius Developer ($49)** |
| 5k-50k | 5M-50M | Helius Business ($499) |
| 50k+ | 50M+ | Helius Professional ($999) |

---

## 🔧 **Configuração Avançada**

### **Environment Variables**
```bash
# .env.production
VITE_VARA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=PROD_KEY
VITE_VARA_RPC_BACKUP_1=https://rpc.ankr.com/solana
VITE_VARA_RPC_BACKUP_2=https://api.mainnet-beta.solana.com

# .env.development  
VITE_VARA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=DEV_KEY
VITE_VARA_RPC_BACKUP_1=https://api.devnet.solana.com
```

### **Rate Limiting Handling**
O sistema já possui:
- ✅ Retry automático com backoff exponencial
- ✅ Fallback para múltiplos endpoints
- ✅ Rate limit detection (403/429)
- ✅ Auto-switch para melhor endpoint

### **Monitoramento**
```javascript
// Console logs para monitorar
🏭 Production mode detected
🚀 Using enhanced wallet service  
📡 Fetching with Helius endpoint
✅ Request completed in 1.2s
⚠️ Rate limit detected, switching endpoint
```

---

## 💰 **Custos Reais**

### **Exemplo: App com 1000 usuários ativos**
- **Requests/mês**: ~2M
- **Helius Developer**: $49/mês (10M créditos)
- **Custo por usuário**: $0.049/mês
- **Savings vs enterprise**: 80%+ economia

### **ROI de RPC Pago:**
- ✅ **Performance**: 5-10x mais rápido
- ✅ **Uptime**: 99.9% vs 95% (endpoints gratuitos)
- ✅ **UX**: Sem erros de rate limiting
- ✅ **Support**: Suporte técnico quando needed

---

## 🚨 **Próximos Passos**

### **Imediato:**
1. **Criar conta Helius** (recomendado)
2. **Configurar API key** no `.env`
3. **Testar** com sua carteira real

### **Curto Prazo:**
1. **Monitorar usage** no dashboard Helius
2. **Ajustar plano** conforme crescimento
3. **Configurar alertas** de quota

### **Longo Prazo:**
1. **Metrics & monitoring** avançado
2. **Load balancing** entre múltiplos providers
3. **Caching layer** para otimizar requests

---

## ✅ **Checklist de Produção**

- [ ] Conta criada no provedor RPC
- [ ] API key obtida e testada
- [ ] `.env` configurado com endpoint pago
- [ ] Endpoints backup mantidos
- [ ] Testes realizados com carteira real
- [ ] Monitoramento de usage configurado
- [ ] Plano adequado ao volume esperado
- [ ] Alertas de quota configurados

---

**🎯 Recomendação Final: Comece com Helius Developer ($49/mês) - é especializado em Solana, confiável e tem excelente custo-benefício para produção.**