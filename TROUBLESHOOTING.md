# Troubleshooting Guide - VaraYield AI

## Problemas de Conectividade da Carteira

### Problema: "Dados da carteira não estão sendo carregados"

#### Diagnóstico Rápido

1. **Execute o diagnóstico RPC**:
   ```bash
   cd project
   node scripts/diagnose-rpc.js
   ```

2. **Acesse o debugger da carteira**:
   - Abra o aplicativo em desenvolvimento
   - Vá para "Wallet Debug" na barra lateral
   - Conecte sua carteira
   - Clique em "Run Tests"

### Soluções Comuns

#### 1. Problemas de RPC Endpoint

**Sintomas:**
- Erro "RPC endpoint error"
- Timeout ao buscar dados
- Erro 403/401 em endpoints

**Solução:**
```bash
# 1. Teste endpoints disponíveis
node scripts/diagnose-rpc.js

# 2. Configure endpoints funcionais no .env.local
VITE_VARA_RPC_URL=https://api.mainnet-beta.solana.com/
VITE_VARA_RPC_BACKUP_1=https://api.mainnet-beta.solana.com
```

#### 2. Problemas de Rede/Firewall

**Sintomas:**
- Todos os endpoints falham
- Erro "fetch failed"
- Timeout em todas as conexões

**Solução:**
- Verifique conexão com internet
- Teste com VPN se necessário
- Configure proxy se estiver em rede corporativa

#### 3. Limite de Taxa (Rate Limiting)

**Sintomas:**
- Erro 429 "Too Many Requests"
- Erro 403 "Forbidden"
- Falhas intermitentes

**Solução:**
- Use endpoints RPC pagos para produção
- Implemente delay entre requisições
- Configure fallback para múltiplos endpoints

### Endpoints RPC Recomendados

#### Gratuitos (Testados e Funcionais)
```bash
# Primário (mais rápido)
https://api.mainnet-beta.solana.com/

# Backup
https://api.mainnet-beta.solana.com
```

#### Pagos (Para Produção)
```bash
# Helius
https://rpc.helius.xyz/?api-key=YOUR_API_KEY

# QuickNode
https://your-endpoint.solana-mainnet.quiknode.pro/YOUR_API_KEY/

# Alchemy
https://solana-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

### Configuração para Desenvolvimento

1. **Crie arquivo .env.local**:
   ```bash
   # Endpoints verificados
   VITE_VARA_RPC_URL=https://api.mainnet-beta.solana.com/
   VITE_VARA_RPC_BACKUP_1=https://api.mainnet-beta.solana.com
   
   # Configurações de debug
   VITE_DEBUG_MODE=true
   VITE_WALLET_TIMEOUT=30000
   ```

2. **Teste a configuração**:
   ```bash
   npm run dev
   # Acesse http://localhost:5173
   # Vá para "Wallet Debug" e execute testes
   ```

### Modo Demo

Se os problemas persistirem, você pode usar o modo demo:

```javascript
// No console do navegador
window.walletService?.setWalletMode('demo');
```

### Logs de Debug

Para análise detalhada, abra o console do navegador (F12) e procure por:

- `🔍 Fetching wallet balances` - Início da busca
- `✅ Wallet balances fetched` - Sucesso
- `❌ Failed to fetch` - Erro
- `🌐 Using Solana mainnet RPC` - Endpoint sendo usado

### Quando Buscar Ajuda

Se após seguir este guia o problema persistir:

1. Execute `node scripts/diagnose-rpc.js` e salve o resultado
2. Abra o console do navegador e salve os logs
3. Anote qual carteira está usando (Phantom, Solflare, etc.)
4. Informe se está usando VPN ou rede corporativa

### Configuração para Produção

Para uso em produção, recomendamos:

1. **RPC Pago**: Use Helius, QuickNode ou Alchemy
2. **Monitoramento**: Configure alertas para falhas de RPC
3. **Fallback**: Configure múltiplos endpoints
4. **Cache**: Implemente cache para reduzir requisições

```javascript
// Exemplo de configuração robusta
const productionEndpoints = [
  'https://rpc.helius.xyz/?api-key=YOUR_PRIMARY_KEY',
  'https://your-endpoint.solana-mainnet.quiknode.pro/BACKUP_KEY/',
  'https://api.mainnet-beta.solana.com', // Fallback gratuito
];
```

### Atualizações

Este guia será atualizado conforme novos endpoints sejam testados e validados. Verifique regularmente para melhorias na conectividade.