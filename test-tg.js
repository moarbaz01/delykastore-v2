const crypto = require("crypto");

const botToken = "8616543863:AAG2HWGgQITMasoKZhTJreBAkI0MfyurGqU";
const secretKey = crypto.createHash("sha256").update(botToken).digest();

const credentials = {
  id: "6124071480",
  first_name: "ABR",
  username: "arbazmr123",
  photo_url: "https://t.me/i/userpic/320/eGKuHCH84eK-lAvkIs25tmhcWhohYKdn4od30J8QSXko-ixfTzpDAS6LQn-uQDV0.jpg",
  auth_date: "1785733364",
  hash: "f0efa8f0ed313223a6eb6df26d3b43456191c98388fac6b733d6757caad05430"
};

const telegramFields = ["auth_date", "first_name", "id", "last_name", "photo_url", "username"];

const dataCheckString = telegramFields
  .filter(key => credentials[key] && credentials[key] !== "undefined" && credentials[key] !== "null")
  .map(key => `${key}=${credentials[key]}`)
  .sort()
  .join("\n");

console.log("Data check string:\n" + dataCheckString);

const hmac = crypto
  .createHmac("sha256", secretKey)
  .update(dataCheckString)
  .digest("hex");

console.log("Calculated HMAC:", hmac);
console.log("Expected HMAC:  ", credentials.hash);
console.log("Match?", hmac === credentials.hash);
