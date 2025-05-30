import SHA256 from "crypto-js/sha256";

// Create Checksum
export const generateChecksum = (data: any) => {
  const payload = JSON.stringify(data);
  const payloadMain = Buffer.from(payload).toString("base64");
  const string = payloadMain + "/pg/v1/pay" + process.env.PHONEPE_SALT_KEY;
  const checksum =
    SHA256(string).toString() + "###" + process.env.PHONEPE_SALT_INDEX;
  return { payloadMain, checksum };
};
