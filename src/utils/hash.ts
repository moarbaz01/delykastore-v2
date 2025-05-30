import MD5 from "crypto-js/md5";

type Params = Record<string, string | number>;

export const generateSign = (
    params: Params,
    key: string = "1234567890"
): string => {
    if (!params || !key) {
        throw new Error("Both params and key are required");
    }

    const sortedParams = Object.keys(params)
        .sort()
        .map((k) => `${k}=${params[k]}`)
        .join("&");

    const stringToHash = `${sortedParams}&${key}`;

    // Using crypto-js MD5 hash (since it supports MD5 in browser and server)
    const firstMd5 = MD5(stringToHash).toString();
    const secondMd5 = MD5(firstMd5).toString();

    return secondMd5;
};
