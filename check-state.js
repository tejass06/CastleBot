// Check Shoukaku state constants
const { Constants } = require('shoukaku');
console.log('State enum:', Constants.State);
console.log('\nState values:');
for (const [key, value] of Object.entries(Constants.State)) {
  console.log(`  ${key}: ${value}`);
}
