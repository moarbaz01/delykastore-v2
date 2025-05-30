// lib/axiosWithProxy.ts
import axios from "axios";
import HttpsProxyAgent from "https-proxy-agent";

const proxyUsername = process.env.PROXY_USERNAME!;
const proxyPassword = process.env.PROXY_PASSWORD!;
const proxyHost = process.env.PROXY_HOST!;
const proxyPort = process.env.PROXY_PORT!;
const proxyUrl = `http://${proxyUsername}:${proxyPassword}@${proxyHost}:${proxyPort}`;
const agent = HttpsProxyAgent(proxyUrl);

const generateAuthToken = () => {
  const username = process.env.TOPUP_GHORBD_USERNAME as string;
  const key = process.env.TOPUP_GHORBD_KEY as string;

  return Buffer.from(`${username}:${key}`).toString("base64");
};

const token = generateAuthToken();

export const axiosWithProxy = axios.create({
  httpsAgent: agent,
  headers: {
    Authorization: `Basic ${token}`,
    "Content-Type": "application/json",
  },
});
