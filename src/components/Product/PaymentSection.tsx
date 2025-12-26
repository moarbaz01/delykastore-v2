import Image from "next/image";
import { useRouter } from "next/navigation";
import Label from "./Label";

interface PaymentSectionProps {
  total: string;
  isAgree: boolean;
  setIsAgree: (value: boolean) => void;
}

const PaymentSection = ({
  total,
  isAgree,
  setIsAgree,
}: PaymentSectionProps) => {
  const router = useRouter();

  return (
    <div className="p-4 md:mb-0 mb-24 bg-secondary border border-gray-600 relative rounded-lg">
      <Label text={"ទូទាត់ប្រាក់បានគ្រប់ធនាគារ"} number={4} />
      <div className="w-full rounded-lg p-4 bg-card-bg border-[#6b5d4f] flex items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <Image
            src="/images/aba.svg"
            alt="KHQR Payment"
            width={50}
            height={50}
            className="aspect-square"
          />
          <div>
            <h1 className="font-bold">ABA KHQR</h1>
            <p>ស្កៅនដើម្បីទូទាត់ជាមួយ App ត្រូវបាន</p>
          </div>
        </div>
        <p className="text-lg font-bold text-primary">${total}</p>
      </div>
      <div className="flex items-center pt-4 gap-4 mt-4">
        <input
          type="checkbox"
          id="agree"
          checked={isAgree}
          onChange={(e) => setIsAgree(e.target.checked)}
          className="w-4 h-4"
        />
        <label htmlFor="agree">
          ខ្ញុំយល់ព្រំ
          <span
            onClick={() => router.push("/terms-and-conditions")}
            className="text-primary font-bold ml-2 cursor-pointer"
          >
            លក្ខខណ្ឌ និង លេខខណ្ឌ
          </span>
        </label>
      </div>
    </div>
  );
};

export default PaymentSection;
