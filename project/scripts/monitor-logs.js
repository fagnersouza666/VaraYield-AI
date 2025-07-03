#!/usr/bin/env node

/**
 * Monitor de Logs em Tempo Real
 * Monitora erros e logs do sistema VaraYield AI
 */

import fs from 'fs';
import path from 'path';
import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 VaraYield AI - Monitor de Logs');
console.log('================================');
console.log('');

// Função para colorir logs
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function colorLog(message, color = 'white') {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`${colors.cyan}[${timestamp}]${colors.reset} ${colors[color]}${message}${colors.reset}`);
}

// 1. Verificar se aplicação está rodando
function checkApplicationStatus() {
  colorLog('📊 Verificando status da aplicação...', 'blue');
  
  try {
    // Verificar se porta 3000 está em uso
    const netstat = execSync('netstat -tulpn | grep :3000', { encoding: 'utf8' });
    if (netstat.includes(':3000')) {
      colorLog('✅ Aplicação rodando na porta 3000', 'green');
    }
  } catch (error) {
    colorLog('❌ Aplicação não está rodando na porta 3000', 'red');
  }

  try {
    // Verificar se porta 5173 está em uso (dev server)
    const netstat = execSync('netstat -tulpn | grep :5173', { encoding: 'utf8' });
    if (netstat.includes(':5173')) {
      colorLog('✅ Servidor de desenvolvimento rodando na porta 5173', 'green');
    }
  } catch (error) {
    colorLog('❌ Servidor de desenvolvimento não está rodando', 'yellow');
  }
}

// 2. Monitorar logs do navegador via script
function createBrowserLogScript() {
  const script = `
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
`;

  fs.writeFileSync(path.join(__dirname, 'browser-monitor.js'), script);
  colorLog('📝 Script de monitoramento do navegador criado: scripts/browser-monitor.js', 'blue');
}

// 3. Verificar logs de erro comuns
function checkCommonErrors() {
  colorLog('🔍 Verificando erros comuns...', 'blue');
  
  const commonChecks = [
    {
      name: 'Variáveis de ambiente',
      check: () => {
        const envPath = path.join(process.cwd(), '.env');
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8');
          if (envContent.includes('VITE_VARA_RPC_URL')) {
            return { status: 'ok', message: '.env configurado corretamente' };
          } else {
            return { status: 'warning', message: '.env existe mas VITE_VARA_RPC_URL não encontrada' };
          }
        } else {
          return { status: 'warning', message: 'Arquivo .env não encontrado' };
        }
      }
    },
    {
      name: 'Node modules',
      check: () => {
        const nodeModulesPath = path.join(process.cwd(), 'node_modules');
        if (fs.existsSync(nodeModulesPath)) {
          return { status: 'ok', message: 'node_modules presente' };
        } else {
          return { status: 'error', message: 'node_modules não encontrado - execute npm install' };
        }
      }
    },
    {
      name: 'Build files',
      check: () => {
        const distPath = path.join(process.cwd(), 'dist');
        if (fs.existsSync(distPath)) {
          const files = fs.readdirSync(distPath);
          if (files.length > 0) {
            return { status: 'ok', message: `Build presente (${files.length} arquivos)` };
          } else {
            return { status: 'warning', message: 'Pasta dist vazia' };
          }
        } else {
          return { status: 'warning', message: 'Build não encontrado - execute npm run build' };
        }
      }
    }
  ];

  commonChecks.forEach(check => {
    try {
      const result = check.check();
      const color = result.status === 'ok' ? 'green' : result.status === 'warning' ? 'yellow' : 'red';
      const icon = result.status === 'ok' ? '✅' : result.status === 'warning' ? '⚠️' : '❌';
      colorLog(`${icon} ${check.name}: ${result.message}`, color);
    } catch (error) {
      colorLog(`❌ ${check.name}: Erro ao verificar - ${error.message}`, 'red');
    }
  });
}

// 4. Testar conectividade RPC
async function testRPCConnectivity() {
  colorLog('🌐 Testando conectividade RPC...', 'blue');
  
  try {
    const diagScript = path.join(__dirname, 'diagnose-rpc.js');
    if (fs.existsSync(diagScript)) {
      colorLog('🔧 Executando diagnóstico RPC...', 'cyan');
      const child = spawn('node', [diagScript], { stdio: 'inherit' });
      
      child.on('close', (code) => {
        if (code === 0) {
          colorLog('✅ Diagnóstico RPC concluído com sucesso', 'green');
        } else {
          colorLog('❌ Diagnóstico RPC falhou', 'red');
        }
      });
    } else {
      colorLog('⚠️ Script de diagnóstico RPC não encontrado', 'yellow');
    }
  } catch (error) {
    colorLog(`❌ Erro ao executar diagnóstico RPC: ${error.message}`, 'red');
  }
}

// 5. Instruções para debug
function showDebugInstructions() {
  console.log('');
  colorLog('📋 INSTRUÇÕES DE DEBUG', 'magenta');
  colorLog('====================', 'magenta');
  console.log('');
  
  const instructions = [
    '1. 🌐 ABRIR APLICAÇÃO:',
    '   → http://localhost:3000 (produção)',
    '   → http://localhost:5173 (desenvolvimento)',
    '',
    '2. 🔍 CONSOLE DO NAVEGADOR:',
    '   → Pressionar F12',
    '   → Ir na aba "Console"',
    '   → Colar o script: scripts/browser-monitor.js',
    '',
    '3. 🛠️ DEBUG INTEGRADO:',
    '   → Na aplicação, ir em "Wallet Debug"',
    '   → Conectar carteira',
    '   → Clicar "Run Tests"',
    '',
    '4. 📊 MONITORAR NETWORK:',
    '   → F12 → aba "Network"',
    '   → Filtrar por "Fetch/XHR"',
    '   → Ver requisições e erros',
    '',
    '5. 🔧 COMANDOS ÚTEIS:',
    '   → npm run dev (desenvolvimento)',
    '   → npm run build (build)',
    '   → node scripts/diagnose-rpc.js (test RPC)',
    '',
    '6. 📱 RESET SE NECESSÁRIO:',
    '   → rm -rf node_modules package-lock.json',
    '   → npm install',
    '   → npm run dev'
  ];

  instructions.forEach(line => {
    if (line.startsWith('   →')) {
      colorLog(line, 'cyan');
    } else if (line.includes(':')) {
      colorLog(line, 'yellow');
    } else {
      console.log(line);
    }
  });
}

// Função principal
async function main() {
  checkApplicationStatus();
  console.log('');
  
  checkCommonErrors();
  console.log('');
  
  createBrowserLogScript();
  console.log('');
  
  await testRPCConnectivity();
  
  showDebugInstructions();
  
  colorLog('🎯 Monitor de logs concluído!', 'green');
  colorLog('💡 Para logs em tempo real, abra o console do navegador (F12)', 'blue');
}

main().catch(error => {
  colorLog(`💥 Erro no monitor: ${error.message}`, 'red');
  process.exit(1);
});