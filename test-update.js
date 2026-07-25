const axios = require('axios');

async function test() {
  try {
    const id = '673f443bde8290ab6b6e4e3b';
    const slider = {
      title: "Main Slider",
      description: "Test description",
      images: [
        { url: "https://res.cloudinary.com/dzoqponzy/image/upload/v1736605051/slider/mblv2g2v1p43x1x4s5g8.webp" }
      ]
    };
    
    // We need to bypass authentication for the test or pass a valid token?
    // Oh, the route requires authentication!
    // const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
  } catch(e) {
    console.error(e.response?.data || e.message);
  }
}
test();
