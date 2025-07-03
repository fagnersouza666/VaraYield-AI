import React from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';

export const WalletConnectionDebug: React.FC = () => {
  const { wallet, publicKey, connected, connecting, disconnecting } = useWallet();
  const { connection } = useConnection();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <h4 className="font-bold mb-2">Wallet Debug</h4>
      <div className="space-y-1">
        <div>Wallet: {wallet?.adapter.name || 'None'}</div>
        <div>Connected: {connected ? '✅' : '❌'}</div>
        <div>Connecting: {connecting ? '🔄' : '⏸️'}</div>
        <div>Disconnecting: {disconnecting ? '🔄' : '⏸️'}</div>
        <div>PublicKey: {publicKey ? `${publicKey.toString().slice(0, 8)}...` : 'None'}</div>
        <div>RPC: {connection.rpcEndpoint}</div>
        <div className="text-xs text-gray-400 mt-2">
          {connecting && 'Tentando conectar...'}
          {connected && 'Conectado com sucesso!'}
          {!connected && !connecting && 'Clique para conectar'}
        </div>
      </div>
    </div>
  );
};