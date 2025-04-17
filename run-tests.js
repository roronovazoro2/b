const { execSync } = require('child_process');

console.log('Running clothing API tests...');
try {
  execSync('npx jest tests/clothing.test.js --detectOpenHandles', { stdio: 'inherit' });
  console.log('Tests completed successfully!');
} catch (error) {
  console.error('Tests failed:', error.message);
  process.exit(1);
} 