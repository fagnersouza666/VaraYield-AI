/**
 * Buffer polyfill validation and testing
 */

export const testBufferPolyfill = () => {
  console.log('🧪 Testing Buffer polyfill...');
  
  const tests = [];
  
  try {
    // Test 1: Buffer exists
    if (typeof Buffer !== 'undefined') {
      console.log('✅ Buffer is available globally');
      tests.push({ test: 'Buffer availability', status: 'pass' });
    } else {
      console.error('❌ Buffer is not available');
      tests.push({ test: 'Buffer availability', status: 'fail' });
    }

    // Test 2: Buffer.from
    if (Buffer && typeof Buffer.from === 'function') {
      const testString = 'Hello, Solana!';
      const buffer = Buffer.from(testString);
      console.log('✅ Buffer.from() works:', buffer);
      tests.push({ test: 'Buffer.from()', status: 'pass' });
    } else {
      console.error('❌ Buffer.from() not available');
      tests.push({ test: 'Buffer.from()', status: 'fail' });
    }

    // Test 3: Buffer.alloc
    if (Buffer && typeof Buffer.alloc === 'function') {
      const allocated = Buffer.alloc(10, 0);
      console.log('✅ Buffer.alloc() works:', allocated);
      tests.push({ test: 'Buffer.alloc()', status: 'pass' });
    } else {
      console.error('❌ Buffer.alloc() not available');
      tests.push({ test: 'Buffer.alloc()', status: 'fail' });
    }

    // Test 4: Buffer.concat
    if (Buffer && typeof Buffer.concat === 'function') {
      const buf1 = Buffer.from('Hello');
      const buf2 = Buffer.from(' World');
      const concatenated = Buffer.concat([buf1, buf2]);
      console.log('✅ Buffer.concat() works:', concatenated);
      tests.push({ test: 'Buffer.concat()', status: 'pass' });
    } else {
      console.error('❌ Buffer.concat() not available');
      tests.push({ test: 'Buffer.concat()', status: 'fail' });
    }

    // Test 5: Global and process
    if (typeof global !== 'undefined') {
      console.log('✅ global is available');
      tests.push({ test: 'global availability', status: 'pass' });
    } else {
      console.error('❌ global is not available');
      tests.push({ test: 'global availability', status: 'fail' });
    }

    if (typeof process !== 'undefined') {
      console.log('✅ process is available');
      tests.push({ test: 'process availability', status: 'pass' });
    } else {
      console.error('❌ process is not available');
      tests.push({ test: 'process availability', status: 'fail' });
    }

  } catch (error) {
    console.error('❌ Buffer polyfill test failed:', error);
    tests.push({ test: 'Buffer test execution', status: 'fail', error });
  }

  const passedTests = tests.filter(t => t.status === 'pass').length;
  const totalTests = tests.length;
  
  console.log(`🎯 Buffer polyfill test results: ${passedTests}/${totalTests} passed`);
  
  if (passedTests === totalTests) {
    console.log('✅ All Buffer polyfill tests passed! Solana/Raydium SDKs should work correctly.');
  } else {
    console.warn('⚠️ Some Buffer polyfill tests failed. This may cause issues with Solana/Raydium SDKs.');
  }

  return {
    success: passedTests === totalTests,
    passed: passedTests,
    total: totalTests,
    tests
  };
};

// Auto-run test in development
if (import.meta.env.DEV) {
  setTimeout(() => {
    testBufferPolyfill();
  }, 1000);
}

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).testBufferPolyfill = testBufferPolyfill;
}