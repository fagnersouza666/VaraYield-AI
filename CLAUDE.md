# VaraYield AI - Instruções para IA

## 📋 PRIORIDADE MÁXIMA
1. **SEMPRE** siga os padrões definidos no arquivo `VARA_TECH_REFERENCES.md`
2. **NUNCA** crie arquivos desnecessários - apenas edite arquivos existentes
3. **SEMPRE** use as bibliotecas e versões especificadas no arquivo de referência
4. USE context7 para consultar documentações
5. **NUNCA** utilize dados de exemplos, ou mockados ou demos
8. **SEMPRE** use dados reais

## 🎯 Objetivos do Projeto
- Criar um otimizador de yield DeFi para Solana
- Usar IA para alocação dinâmica de fundos
- Interface React + TypeScript + Vite
- Integração com Anchor Framework
- Integração com Raydium SDK

## 🔧 Stack Tecnológico OBRIGATÓRIO
Consulte `VARA_TECH_REFERENCES.md` para:
- Versões exatas das bibliotecas
- Padrões de código TypeScript/React
- Configurações Vite e TailwindCSS
- Integração Solana/Anchor/Raydium
- Estrutura de arquivos recomendada

## 📁 Estrutura de Arquivos
```
src/
├── components/
│   ├── common/          # Componentes reutilizáveis
│   ├── wallet/         # Componentes de carteira
│   ├── defi/           # Componentes DeFi específicos
│   └── ui/             # Componentes base UI
├── hooks/              # Custom hooks
├── lib/                # Utilitários e configurações
├── store/              # Estado global (Zustand)
├── types/              # Definições TypeScript
├── utils/              # Funções utilitárias
└── constants/          # Constantes da aplicação
```

## 🚫 RESTRIÇÕES
- **NÃO** criar arquivos .md ou documentação automaticamente
- **NÃO** usar bibliotecas não listadas no arquivo de referência
- **NÃO** desviar dos padrões estabelecidos
- **SEMPRE** verificar `VARA_TECH_REFERENCES.md` antes de codificar

## ✅ COMANDOS IMPORTANTES
- `npm run dev` - Servidor de desenvolvimento
- `npm run build` - Build de produção
- `npm run lint` - Verificação de código
- `npm run type-check` - Verificação TypeScript

## 📖 Referência Técnica
Para padrões específicos, snippets de código e configurações:
**CONSULTE SEMPRE: `VARA_TECH_REFERENCES.md`**