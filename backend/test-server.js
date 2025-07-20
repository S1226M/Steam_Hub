import fetch from 'node-fetch';

async function testServer() {
  try {
    console.log('🧪 Testing backend server...');
    
    // Test basic server response
    const response = await fetch('http://localhost:5000/api/auth/test');
    console.log('✅ Server is running on port 5000');
    
    // Test live stream endpoint
    const streamResponse = await fetch('http://localhost:5000/api/livestream/active/all');
    console.log('✅ Live stream endpoint is accessible');
    
  } catch (error) {
    console.error('❌ Server test failed:', error.message);
    console.log('💡 Make sure:');
    console.log('   1. Backend server is running (npm start)');
    console.log('   2. MongoDB is running');
    console.log('   3. Port 5000 is not blocked');
  }
}

testServer(); 