import axios from "axios";
import HttpsProxyAgent from "https-proxy-agent";

const proxyUsername = process.env.ALUU_PROXY_USERNAME;
const proxyPassword = process.env.ALUU_PROXY_PASSWORD;
const proxyHost = process.env.ALUU_PROXY_HOST;
const proxyPort = process.env.ALUU_PROXY_PORT;

let agent;

if (proxyHost && proxyPort) {
  const authString = proxyUsername && proxyPassword ? `${proxyUsername}:${proxyPassword}@` : "";
  const proxyUrl = `http://${authString}${proxyHost}:${proxyPort}`;
  agent = HttpsProxyAgent(proxyUrl);
}

export const aluuAxios = axios.create({
  httpsAgent: agent,
});
