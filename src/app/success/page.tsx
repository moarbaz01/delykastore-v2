"use client";
import Loader from "@/components/Loader";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";

const MyComponent = () => {
  const searchParams = useSearchParams();
  const transactionId = searchParams.get("transactionId");
  const pack = searchParams.get("pack");
  const price = searchParams.get("price");
  const userId = searchParams.get("userId");
  const zoneId = searchParams.get("zoneId");
  const productId = searchParams.get("productId");

  const handleDownloadReceipt = () => {
    const receiptContent = `
      Transaction ID: ${transactionId}
      Pack: ${decodeURI(pack)}
      Price: ${price}
      User ID: ${userId}
      Zone ID: ${zoneId}
    `;

    const blob = new Blob([receiptContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `receipt_${transactionId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col gap-4">
        <div className="text-center bg-orange-500 p-2 shadow-lg rounded-lg">
          <div className="bg-white rounded-lg ">
            <Image
              src="/images/logo.png"
              alt="logo"
              width={100}
              height={100}
              className="mx-auto"
            />
            <p className="text-orange-500 text-xl font-bold my-4">
              ការបញ្ជាទិញរបស់អ្នក ទទួលបានជោគជ័យ
            </p>
            <table
              cellSpacing={0}
              cellPadding={10}
              className="text-white font-extrabold text-lg  w-full"
            >
              <tbody>
                <tr className="bg-orange-500 border-4 border-white">
                  <td className="text-2xl ">តាមរយ:</td>
                  <td>ABA KHQR</td>
                </tr>

                <tr className="bg-orange-500 border-4 border-white">
                  <td className=" text-2xl">កញ្ចប់:</td>
                  <td>{decodeURI(pack)}</td>
                </tr>

                <tr className="bg-orange-500 border-4 border-white">
                  <td className="text-2xl">តម្លៃ:</td>
                  <td>${price}</td>
                </tr>
                <tr className="bg-orange-500 border-4 border-white">
                  <td className="text-2xl">លេខសម្គាល់:</td>
                  <td>
                    {userId}{" "}
                    {zoneId && <span className="text-white">({zoneId})</span>}
                  </td>
                </tr>
                <tr className="bg-orange-500 border-4 border-white">
                  <td className="text-2xl">លេខវិក័យប័ត្រ:</td>
                  <td>{transactionId}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-center gap-4">
          <Link href="/">
            <button className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-primary/80 transition duration-300">
              ថយក្រោយ
            </button>
          </Link>
          <button
            onClick={handleDownloadReceipt}
            className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition duration-300 flex items-center gap-2"
          >
            ទាញយក
          </button>
          {productId && transactionId && (
            <Link href={`/spin?productid=${productId}&transactionid=${transactionId}`}>
              <button className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300">
                បង្វិលឱកាស
              </button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

const SuccessPage = () => {
  return (
    <Suspense fallback={<Loader />}>
      <MyComponent />
    </Suspense>
  );
};

export default SuccessPage;
