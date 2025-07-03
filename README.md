# Vara Yield Optimizer

![image](https://github.com/user-attachments/assets/8b907b66-beb0-4fb1-8938-cd3b46fb2862)



VaraYield Optimizer is a decentralized yield optimizer built on Solana that uses artificial intelligence to dynamically allocate funds across various DeFi protocols for maximum returns. The platform simplifies DeFi yield farming by abstracting complex interactions into a single "Optimize" button while maintaining complete user control over risk preferences.

## 🚀 Features

- **AI-Driven Optimization**: Smart allocation across Solana DeFi protocols like Raydium and Serum
- **Automated Rebalancing**: Dynamic fund reallocation based on changing APRs
- **Risk Customization**: User-defined risk levels (Conservative, Moderate, Aggressive)
- **Protocol Integration**: Direct integration with leading Solana DeFi platforms
- **Real-time Analytics**: Live APY tracking and performance metrics
- **Smart Contract Abstraction**: Complex DeFi interactions simplified into one-click operations

## 🛠 Tech Stack

- **Blockchain**: Solana
- **Frontend**: React + TypeScript + Vite
- **Styling**: TailwindCSS
- **Icons**: Lucide React
- **Smart Contracts**: Anchor Framework
- **DeFi Protocols**: Raydium, Serum, Marinade, Port Finance

## 🏗 Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/solanayield-ai.git
cd solanayield-ai
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## 🔧 Configuration

1. Create a `.env` file in the root directory:
```env
VITE_VARA_RPC_URL=your_rpc_url
VITE_VARA_NETWORK=devnet  # or mainnet-beta
```

2. Configure your preferred Solana wallet (Phantom recommended)

## 🔧 Solução de Problemas

### ✅ RESOLVIDO: Dados da carteira não carregam

**Problema identificado e corrigido**: Endpoints RPC não funcionais foram substituídos por endpoints testados e verificados.

**Diagnóstico automático**:
```bash
cd project
node scripts/diagnose-rpc.js
```

**Solução implementada**:
- ✅ Endpoints RPC testados e funcionais
- ✅ Sistema de fallback robusto
- ✅ Diagnóstico automático de conectividade
- ✅ Interface de debug integrada

### Phantom Wallet fica "Connecting"
1. **Desabilite o autoConnect**: O projeto está configurado com `autoConnect={false}` para evitar loops
2. **Clique manualmente** no botão "Select Wallet" para conectar
3. **Verifique se a Phantom está desbloqueada** e configurada para Mainnet
4. **Recarregue a página** se a conexão falhar

### Dashboard mostra "Aguardando Dados"
1. **Normal**: O sistema não usa dados mockados/simulados
2. **APIs Reais**: Todas as métricas aguardam conexão com APIs reais do Raydium
3. **Desenvolvimento**: Para desenvolvimento, integre com APIs reais

### Portfolio mostra erro de RPC
**ATUALIZADO**: Agora usa endpoints verificados e funcionais.

1. **Endpoints Testados**: O sistema agora usa apenas endpoints RPC testados
2. **Debug Integrado**: Acesse "Wallet Debug" na barra lateral para diagnóstico
3. **Fallback Automático**: Sistema troca automaticamente para endpoints funcionais
4. **Guia Completo**: Veja [TROUBLESHOOTING.md](TROUBLESHOOTING.md) para guia detalhado

### Como configurar RPC personalizado
1. Copie `.env.example` para `.env.local`
2. Configure `VITE_VARA_RPC_URL` com seu endpoint
3. Teste com: `node scripts/diagnose-rpc.js`
4. Reinicie o projeto

### Debug e Monitoramento
- **Wallet Debugger**: Interface integrada para testar conectividade
- **Script de Diagnóstico**: Ferramenta CLI para testar endpoints RPC
- **Logs Detalhados**: Console do navegador mostra status detalhado
- **Modo Demo**: Fallback para dados demonstrativos se necessário

## 🔒 Security

- All smart contracts are thoroughly audited
- Implements best practices for DeFi security
- Regular security updates and monitoring

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🌟 Acknowledgments

- VARA Foundation
- Raydium Protocol
- Serum DEX
- Marinade Finance
- Port Finance

## 📊 Current Status

- [x] Smart Contract Development
- [x] Frontend Implementation
- [x] AI Integration
- [x] Protocol Integration
- [ ] Mainnet Launch
- [ ] Cross-chain Expansion

## 🚨 Disclaimer

This project is in beta. Always do your own research before investing in DeFi protocols. Cryptocurrency investments come with high risk.
