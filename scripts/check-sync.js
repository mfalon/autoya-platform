const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'data', 'camera_sync.json');
try {
  if (fs.existsSync(file)) {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    console.log('Keys in camera_sync.json:', Object.keys(data));
    for (const key of Object.keys(data)) {
      console.log(`Key: ${key}, Length of image: ${data[key]?.image ? data[key].image.length : 0}, Timestamp: ${data[key]?.timestamp}`);
    }
  } else {
    console.log('File data/camera_sync.json does not exist');
  }
} catch (err) {
  console.error(err);
}
