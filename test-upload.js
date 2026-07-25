const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpload() {
  try {
    // Create a tiny dummy image (1x1 pixel PNG)
    const base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    const buffer = Buffer.from(base64, 'base64');
    fs.writeFileSync('dummy.png', buffer);

    const formData = new FormData();
    formData.append('image', fs.createReadStream('dummy.png'));
    // We intentionally DO NOT append 'folder' to see if it causes an error

    console.log("Sending upload request...");
    const res = await axios.post('http://localhost:3000/api/upload', formData, {
      headers: formData.getHeaders()
    });
    console.log("Upload success:", res.data);
  } catch(e) {
    console.error("Upload failed:", e.response?.data || e.message);
  }
}
testUpload();
