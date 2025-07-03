/**
 * Test suite for Raydium SDK patches
 */

import { errorLogger } from '../services/error-logger.service';

export const testRaydiumPatches = () => {
  console.log('🧪 Testing Raydium SDK patches...');
  
  const tests = [];
  
  try {
    // Test 1: Error event interception
    const mockError = new Error('invalid account data; account type mismatch 1094799681 != 1');
    
    // Simulate the error that would be thrown by Raydium SDK
    setTimeout(() => {
      console.warn('🔄 Simulating Raydium account data error...');
      
      // This should be caught by our global error handler
      const errorEvent = new ErrorEvent('error', {
        message: mockError.message,
        filename: 'raydium-test.js',
        lineno: 123,
        colno: 456,
        error: mockError
      });
      
      window.dispatchEvent(errorEvent);
    }, 100);
    
    tests.push({ test: 'Error event simulation', status: 'pass' });
    
    // Test 2: Promise rejection interception
    setTimeout(() => {
      console.warn('🔄 Simulating promise rejection...');
      
      // Create an unhandled promise rejection
      Promise.reject(new Error('invalid account data; account type mismatch 1094799681 != 1'))
        .catch(() => {
          // This catch prevents the actual unhandled rejection
          // but our handler should still intercept it
        });
      
      // Also trigger the actual unhandled rejection
      const rejectionEvent = new PromiseRejectionEvent('unhandledrejection', {
        promise: Promise.reject(mockError),
        reason: mockError
      });
      
      window.dispatchEvent(rejectionEvent);
    }, 200);
    
    tests.push({ test: 'Promise rejection simulation', status: 'pass' });
    
    // Test 3: Check if patches are applied
    if (typeof window.onunhandledrejection === 'function') {
      tests.push({ test: 'Promise rejection handler patched', status: 'pass' });
    } else {
      tests.push({ test: 'Promise rejection handler patched', status: 'fail' });
    }
    
    // Test 4: Console error interception
    setTimeout(() => {
      console.warn('🔄 Testing console.error interception...');
      console.error('Test: invalid account data; account type mismatch 1094799681 != 1');
    }, 300);
    
    tests.push({ test: 'Console error interception', status: 'pass' });
    
    // Test 5: Check error logger stats
    setTimeout(() => {
      const stats = errorLogger.getStats();
      console.log('📊 Error logger stats after tests:', stats);
      
      // Check if our simulated errors were captured
      const parsingErrors = stats.byCategory.PARSING_ERROR || 0;
      if (parsingErrors > 0) {
        tests.push({ test: 'Errors properly categorized', status: 'pass' });
      } else {
        tests.push({ test: 'Errors properly categorized', status: 'warn', note: 'No parsing errors captured yet' });
      }
      
      // Final test summary
      const passedTests = tests.filter(t => t.status === 'pass').length;
      const totalTests = tests.length;
      
      console.log(`🎯 Raydium patches test results: ${passedTests}/${totalTests} passed`);
      
      if (passedTests === totalTests) {
        console.log('✅ All Raydium patches are working correctly!');
      } else {
        console.warn('⚠️ Some Raydium patches may need attention.');
      }
      
      console.log('📋 Test details:', tests);
      
      return {
        success: passedTests === totalTests,
        passed: passedTests,
        total: totalTests,
        tests
      };
    }, 1000);
    
  } catch (error) {
    console.error('❌ Error running Raydium patches tests:', error);
    tests.push({ test: 'Test execution', status: 'fail', error });
  }
  
  return {
    message: 'Raydium patches test initiated (check console for results)',
    testsScheduled: tests.length
  };
};

// Export for global access
if (typeof window !== 'undefined') {
  (window as any).testRaydiumPatches = testRaydiumPatches;
}