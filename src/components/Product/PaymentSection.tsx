import Image from "next/image";
import { useRouter } from "next/navigation";
import Label from "./Label";

interface PaymentSectionProps {
  total: string;
  isAgree: boolean;
  setIsAgree: (value: boolean) => void;
  stepNumber: number;
}

const PaymentSection = ({
  total,
  isAgree,
  setIsAgree,
  stepNumber,
}: PaymentSectionProps) => {
  const router = useRouter();

  return (
    <div
      className="p-4 md:mb-0 mb-24 rounded-2xl relative"
      style={{ background: "#FFFFFF", border: "1px solid rgba(255,117,151,0.15)" }}
    >
      <Label text={"Payment Methods"} number={stepNumber} />

      {/* Payment method card */}
      <div
        className="rounded-xl p-4 flex items-center justify-between mt-4"
        style={{ background: "#FDFDFD", border: "1px solid rgba(255,117,151,0.1)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,117,151,0.1)", border: "1px solid rgba(255,117,151,0.2)" }}
          >
            <Image
              src="/images/aba.svg"
              alt="ABA Payment"
              width={28}
              height={28}
              className="aspect-square object-contain"
            />
          </div>
          <div>
            <h3 className="font-bold text-sm text-gray-900">ABA KHQR</h3>
            <p className="text-xs text-gray-600">Scan to pay with any banking App</p>
          </div>
        </div>
        <span
          className="text-sm font-bold"
          style={{
            background: "linear-gradient(135deg, #FF9CB5, #FF7597)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          ${total}
        </span>
      </div>

      {/* Agreement checkbox */}
      <div className="flex items-start gap-3 mt-4">
        <div className="relative mt-0.5 shrink-0">
          <input
            type="checkbox"
            id="agree"
            checked={isAgree}
            onChange={(e) => setIsAgree(e.target.checked)}
            className="sr-only"
          />
          <div
            onClick={() => setIsAgree(!isAgree)}
            className="w-5 h-5 rounded-md cursor-pointer flex items-center justify-center transition-all duration-200"
            style={{
              background: isAgree
                ? "linear-gradient(135deg, #E55577, #FF7597)"
                : "transparent",
              border: isAgree
                ? "1px solid #FF7597"
                : "1px solid rgba(255,117,151,0.3)",
            }}
          >
            {isAgree && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
        <label htmlFor="agree" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
          I agree
          <span
            onClick={() => router.push("/terms-and-conditions")}
            className="font-semibold ml-1 transition-colors cursor-pointer hover:opacity-80"
            style={{ color: "#FF7597" }}
          >
            Terms and Conditions
          </span>
        </label>
      </div>
    </div>
  );
};

export default PaymentSection;
