#!/usr/bin/env node

/**
 * RPC Diagnostic Script
 * Tests RPC endpoints to identify connectivity issues
 */

import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';

const endpoints = [
  { name: 'Ankr (Primary)', url: 'https://rpc.ankr.com/solana' },
  { name: 'Solana Official', url: 'https://api.mainnet-beta.solana.com' },
  { name: 'Public RPC', url: 'https://solana.public-rpc.com' },
  { name: 'Helius (Free)', url: 'https://rpc.helius.xyz/?api-key=demo' },
  { name: 'ClusterAPI', url: clusterApiUrl('mainnet-beta') },
];

async function testEndpoint(endpoint) {
  console.log(`\n🔍 Testing: ${endpoint.name}`);
  console.log(`   URL: ${endpoint.url}`);
  
  try {
    const connection = new Connection(endpoint.url, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 10000,
    });

    const start = Date.now();
    
    // Test 1: Get version
    const version = await Promise.race([
      connection.getVersion(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);
    
    const versionTime = Date.now() - start;
    console.log(`   ✅ Version: ${version['solana-core']} (${versionTime}ms)`);
    
    // Test 2: Get slot
    const slotStart = Date.now();
    const slot = await Promise.race([
      connection.getSlot(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);
    
    const slotTime = Date.now() - slotStart;
    console.log(`   ✅ Current slot: ${slot} (${slotTime}ms)`);
    
    // Test 3: Test with a known wallet (Solana Foundation)
    const testWallet = new PublicKey('9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM');
    const balanceStart = Date.now();
    
    const balance = await Promise.race([
      connection.getBalance(testWallet),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);
    
    const balanceTime = Date.now() - balanceStart;
    console.log(`   ✅ Balance query: ${balance / 1e9} SOL (${balanceTime}ms)`);
    
    const totalTime = Date.now() - start;
    console.log(`   🎉 SUCCESS - Total time: ${totalTime}ms`);
    
    return {
      success: true,
      endpoint: endpoint.name,
      url: endpoint.url,
      totalTime,
      tests: {
        version: { success: true, time: versionTime },
        slot: { success: true, time: slotTime },
        balance: { success: true, time: balanceTime },
      }
    };
    
  } catch (error) {
    console.log(`   ❌ FAILED: ${error.message}`);
    
    return {
      success: false,
      endpoint: endpoint.name,
      url: endpoint.url,
      error: error.message
    };
  }
}

async function main() {
  console.log('🚀 VaraYield AI - RPC Endpoint Diagnostic Tool');
  console.log('================================================');
  
  const results = [];
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint);
    results.push(result);
    
    // Small delay between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 SUMMARY');
  console.log('==========');
  
  const successful = results.filter(r => r.success);
  const failed = results.filter(r => !r.success);
  
  console.log(`✅ Working endpoints: ${successful.length}/${results.length}`);
  console.log(`❌ Failed endpoints: ${failed.length}/${results.length}`);
  
  if (successful.length > 0) {
    console.log('\n🏆 Fastest endpoints:');
    successful
      .sort((a, b) => a.totalTime - b.totalTime)
      .slice(0, 3)
      .forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.endpoint} - ${result.totalTime}ms`);
      });
  }
  
  if (failed.length > 0) {
    console.log('\n💥 Failed endpoints:');
    failed.forEach(result => {
      console.log(`   • ${result.endpoint}: ${result.error}`);
    });
  }
  
  console.log('\n💡 Recommendations:');
  if (successful.length === 0) {
    console.log('   • All endpoints failed - check your internet connection');
    console.log('   • Try using a VPN if in a restricted network');
    console.log('   • Consider using a paid RPC provider (Helius, QuickNode, Alchemy)');
  } else if (successful.length < 3) {
    console.log('   • Limited RPC availability - consider backup endpoints');
    console.log('   • Monitor for rate limiting issues');
  } else {
    console.log('   • Good RPC connectivity!');
    console.log('   • Use the fastest endpoints for better performance');
  }
  
  console.log('\n🔗 For production, consider paid RPC providers:');
  console.log('   • Helius: https://helius.xyz/');
  console.log('   • QuickNode: https://quicknode.com/');
  console.log('   • Alchemy: https://alchemy.com/');
  
  process.exit(successful.length > 0 ? 0 : 1);
}

main().catch(console.error);