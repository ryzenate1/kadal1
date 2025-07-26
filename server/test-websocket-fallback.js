// This script tests the WebSocket service and simulates a fallback to REST API
// It modifies the WebSocket service temporarily to simulate a connection failure

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Paths to files
const websocketServicePath = path.join(__dirname, 'services', 'websocketService.js');
const backupPath = path.join(__dirname, 'services', 'websocketService.js.bak');

// Function to modify WebSocket service to simulate failure
function disableWebSocketService() {
  console.log('Backing up WebSocket service...');
  
  // First create a backup
  fs.copyFileSync(websocketServicePath, backupPath);
  
  console.log('Modifying WebSocket service to simulate failure...');
  
  // Read the original content
  const content = fs.readFileSync(websocketServicePath, 'utf8');
  
  // Replace the connection handler to reject all connections
  const modifiedContent = content.replace(
    /wss\.on\('connection', async \(ws, req\) => {/g,
    `wss.on('connection', async (ws, req) => {
      // Simulated failure for testing API fallback
      console.log('Simulating WebSocket connection failure for testing');
      ws.close(1011, 'WebSocket service unavailable for testing');
      return;
      
      // Original code below is not executed during test
    `
  );
  
  // Write the modified content
  fs.writeFileSync(websocketServicePath, modifiedContent);
  
  console.log('WebSocket service modified successfully');
}

// Function to restore WebSocket service
function restoreWebSocketService() {
  console.log('Restoring WebSocket service...');
  
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, websocketServicePath);
    fs.unlinkSync(backupPath);
    console.log('WebSocket service restored successfully');
  } else {
    console.log('No backup found, skipping restore');
  }
}

// Function to run API fallback test
function runApiFallbackTest() {
  return new Promise((resolve, reject) => {
    console.log('Running API fallback test...');
    
    const child = exec('node test-api-fallback.js', (error, stdout, stderr) => {
      if (error) {
        console.error('Test execution failed:', error);
        reject(error);
        return;
      }
      
      console.log('--- TEST OUTPUT ---');
      console.log(stdout);
      
      if (stderr) {
        console.error('--- TEST ERRORS ---');
        console.error(stderr);
      }
      
      console.log('Test completed');
      resolve();
    });
    
    // Forward output for real-time viewing
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  });
}

// Main function
async function testWebSocketFallback() {
  try {
    // 1. Modify WebSocket service
    disableWebSocketService();
    
    // 2. Run API fallback test
    await runApiFallbackTest();
    
    console.log('WebSocket fallback test completed successfully!');
    console.log('The test has verified that the system can operate via REST API');
    console.log('when WebSocket connections are unavailable.');
    
    return true;
  } catch (error) {
    console.error('WebSocket fallback test failed:', error);
    return false;
  } finally {
    // 3. Restore WebSocket service regardless of test outcome
    restoreWebSocketService();
  }
}

// Check if this script is run directly
if (require.main === module) {
  console.log('Testing WebSocket fallback mechanism...');
  
  testWebSocketFallback()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}
