"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import toast from "react-hot-toast";
import SliderComponent from "../Home/Banner/Component";
import PaymentForm from "./PaymentForm";
import CostItem from "./CostItem";
import { BackgroundGradient } from "../ui/BackgroundGradient";

declare const AbaPayway: any;

interface ApplyCouponParams {
  couponCode: string;
  amountSelected: {
    id: string;
    price: string;
    amount: string;
  };
  _id: string; // productId
}

const Label = ({ number, text }) => {
  return (
    <div className="absolute -top-5 left-2  ">
      <BackgroundGradient className="flex items-center w-fit h-auto  gap-2 bg-black text-white rounded-3xl  py-2 px-4 ">
        <div className="bg-red-500 text-white font-bold rounded-full h-8 w-8 flex items-center justify-center">
          {number}
        </div>
        <h1 className="text-lg text-white">{text}</h1>
      </BackgroundGradient>
    </div>
  );
};

const Product = ({
  name,
  _id,
  isDeleted,
  region,
  slides,
  banner,
  isApi,
  stock,
  cost,
  game,
}: {
  name: string;
  _id: string;
  image: string;
  region?: string;
  isDeleted: boolean;
  category: string;
  isApi: boolean;
  stock: true;
  slides: string[];
  banner: string;
  game: string;
  cost: {
    id: string;
    amount: string;
    price: string;
    image?: string;
    note?: string;
    category?: string;
  }[];
}) => {
  const [userId, setUserId] = useState(() =>
    game === "mobilelegends"
      ? region === "philippines"
        ? localStorage.getItem("philipps-userId")
        : localStorage.getItem("getotopup-userId") ?? ""
      : ""
  );

  const [zoneId, setZoneId] = useState(() =>
    game === "mobilelegends"
      ? region === "philippines"
        ? localStorage.getItem("philipps-zoneId")
        : localStorage.getItem("getotopup-zoneId") ?? ""
      : ""
  );

  const [amountSelected, setAmountSelected] = useState<{
    id: string;
    amount: string;
    price: string;
  }>({
    id: "",
    amount: "",
    price: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [playerAvailable, setPlayerAvailable] = useState(false);
  const router = useRouter();
  const [isAgree, setIsAgree] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const formRef = useRef(null);
  const [costCategories, setCostCategories] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

  // Apply Coupon
  const applyCoupon = async ({
    couponCode,
    amountSelected,
    _id,
  }: ApplyCouponParams): Promise<void> => {
    // Input validation
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }

    if (!amountSelected?.id) {
      setCouponError("Please select a purchase option");
      return;
    }

    try {
      setIsCheckingCoupon(true);
      setCouponError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/coupon/validate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coupon: couponCode.trim(),
            costId: amountSelected.id,
            price: amountSelected.price,
            productId: _id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to apply coupon");
      }

      // Success case - updated to match backend response
      setAppliedCoupon({
        code: couponCode,
        discount: data.discount,
        finalPrice: data.finalPrice,
        couponDetails: data.couponDetails,
        minAmount: data.couponDetails?.minAmount || 0,
      });

      toast.success(data.message || "Coupon applied successfully!");
    } catch (error) {
      console.error("Coupon error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to apply coupon. Please try again.";
      setCouponError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleApplyCoupon = async () => {
    await applyCoupon({
      couponCode,
      amountSelected,
      _id,
    });
  };

  const checkUserAccount = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.post("/api/verify-user-account", {
        game,
        userId,
        zoneId,
      });

      const { username, error } = res.data;
      console.log(error);
      if (username) {
        setPlayerAvailable(true);
        setMessage(username);
        setErrorMessage("");
      } else {
        setPlayerAvailable(false);
        setMessage("");
        setErrorMessage(error);
      }
    } catch (error) {
      setErrorMessage(
        error.response.data.error || "Error checking player information"
      );
    } finally {
      setLoading(false);
    }
  }, [game, userId, zoneId]);

  // Fetch Check Role - optimized with better error handling
  const fetchCheckRole = useCallback(async () => {
    if (!userId) {
      setErrorMessage("Please fill userId");
      return;
    }

    if (["mobilelegends", "magicchess", "genshinimpact"].includes(game)) {
      if (!zoneId) {
        setErrorMessage("Please fill zoneId");
        return;
      }
    }

    // Static responses for specific games/regions
    if (game === "magicchess") {
      setPlayerAvailable(true);
      setMessage("ត្រូវប្រាកដថាIDរបស់អ្នកត្រឹមត្រូវ");
      setErrorMessage("");
      return;
    }

    if (!region || region !== "brazil") {
      await checkUserAccount();
      console.log("region");
      return;
    }
    try {
      console.log("checkrole", region);
      setLoading(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Add timeout

      const res = await fetch("/api/checkrole", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          zoneId,
          productId: "13",
          product: "mobilelegends",
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await res.json();

      if (data.status === 200) {
        setPlayerAvailable(true);
        setMessage(data.username);
        localStorage.setItem("getotopup-userId", userId);
        localStorage.setItem("getotopup-zoneId", zoneId);
        setErrorMessage("");
      } else {
        setErrorMessage(data.message);
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        setErrorMessage("Request timed out. Please try again.");
      } else {
        console.error("Check role error:", error);
        setErrorMessage("Error checking player information");
      }
    } finally {
      setLoading(false);
    }
  }, [userId, zoneId, game]);
  // Check Role
  const handleSubmitCheckRole = async (
    e: React.SyntheticEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    await fetchCheckRole();
  };

  useEffect(() => {
    if (paymentData && formRef.current) {
      try {
        if (typeof AbaPayway !== "undefined") {
          AbaPayway.checkout();
        }
      } catch (error) {
        console.error("Error calling AbaPayway.checkout:", error);
      }
    }
  }, [paymentData]);

  // Input Change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPlayerAvailable(false);
    setMessage("");
    if (name === "userId") {
      setUserId(value);
    } else if (name === "zoneId") {
      setZoneId(value);
    }
  };

  // Fetch Categories
  const fetchCategories = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL!}/categories`);
    const data = await res.json();
    const extractName = data.map((category) => category.name);
    setCostCategories(extractName);
  };

  // Create Order
  const createOrder = useCallback(async () => {
    if (!userId) {
      toast.error("Please fill UserId");
      return;
    }
    if (isApi) {
      if (["mobilelegends", "magicchess", "genshinimpact"].includes(game)) {
        if (!zoneId) {
          toast.error("Please fill ZoneId");
          return;
        }

        if (!playerAvailable) {
          toast.error("Please check role");
          return;
        }
      }
    }

    // Select amount
    if (!amountSelected.id) {
      toast.error("Please select amount");
      return;
    }

    if (!isAgree) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    if (!stock) {
      toast.error("Product is out of stock");
      return;
    }

    const params = {
      name,
      costId: amountSelected.id,
      orderDetails: amountSelected.amount,
      orderType: isApi ? "API Order" : "Custom Order",
      userId,
      zoneId,
      game,
      region: region,
      productId: _id,
      couponCode: appliedCoupon?.code,
      isCouponApplied: !!appliedCoupon,
    };

    try {
      const res = await axios.post("/api/payway/create-transaction", params, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = res.data;

      if (res.status === 200) {
        // Set the payment data to display the checkout page
        setPaymentData(data);
      }
    } catch (error) {
      console.log("error", error);
      toast.error("Error Creating Order");
    }
  }, [
    userId,
    zoneId,
    amountSelected,
    _id,
    stock,
    game,
    region,
    isApi,
    name,
    playerAvailable,
    isAgree,
    appliedCoupon,
  ]);

  // Grouped Cose
  const groupedCost = useMemo(
    () =>
      costCategories.map((category) => ({
        category,
        items: cost.filter((item) => item.category === category),
      })),
    [cost, costCategories]
  );

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    toast.success("Coupon removed successfully!");
  };

  const total = useMemo(() => {
    const basePrice = parseFloat(amountSelected.price) || 0;
    if (!appliedCoupon) return basePrice.toFixed(2);

    const discountedPrice = appliedCoupon.finalPrice
      ? parseFloat(appliedCoupon.finalPrice)
      : basePrice - basePrice * (appliedCoupon.discount / 100);

    return Math.max(0, discountedPrice).toFixed(2);
  }, [amountSelected, appliedCoupon]);

  useEffect(() => {
    if (amountSelected.id) {
      setAppliedCoupon(null);
      setCouponError("");
    }
  }, [amountSelected]);
  // Initialize Cat And Banners
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fallback
  if (isDeleted) {
    return (
      <div className="w-full flex justify-center items-center">
        <h1 className="text-2xl">Product Not Found</h1>
      </div>
    );
  }
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3  max-w-screen-xl mx-auto gap-6 py-6 sm:px-6 px-4  ">
        <div className="">
          {/* <Banner /> */}
          {slides.length > 0 && <SliderComponent slides={slides} />}
          {banner && (
            <div className="flex items-center gap-4 mt-4">
              <Image
                src={banner as string}
                alt={banner as string}
                width={400}
                height={400}
                className="rounded-xl  w-full"
              />
            </div>
          )}
        </div>
        {/* Checkout */}
        <div className=" lg:col-span-2 flex flex-col gap-8">
          <BackgroundGradient className="px-4 py-8 bg-black rounded-3xl relative ">
            <Label text={"បញ្ចូល អាយឌី"} number={1} />
            <form className="flex flex-col gap-4 mt-4">
              <input
                type="text"
                placeholder="User ID"
                onChange={handleInputChange}
                value={userId}
                name="userId"
                autoComplete="on"
                className="rounded-lg bg-white w-full border-2 text-black placeholder:font-bold focus:outline-blue-500 focus:outline border-[#bdbdbd] py-2 px-4"
              />
              {["mobilelegends", "magicchess"].includes(game) && (
                <input
                  type="text"
                  placeholder={`SERVER ID`}
                  onChange={handleInputChange}
                  value={zoneId}
                  name="zoneId"
                  autoComplete="on"
                  className="rounded-lg w-full placeholder:font-bold bg-white border-2 text-black focus:outline-blue-500 focus:outline border-[#bdbdbd] py-2 px-4"
                />
              )}

              {game === "genshinimpact" && (
                <select
                  onChange={(e) => setZoneId(e.target.value)}
                  value={zoneId}
                  name="zoneId"
                  className="rounded-lg w-full placeholder:font-bold  bg-white border-2 text-black focus:outline-blue-500 focus:outline border-[#bdbdbd] py-2 px-4"
                >
                  <option value="">Select Server</option>
                  <option value="Asia">Asia</option>
                  <option value="America">America</option>
                  <option value="Europe">Europe</option>
                  <option value="TH, HK, MO">TH, HK, MO</option>
                </select>
              )}
              {message &&
                (game === "magicchess" ? (
                  <p className="text-red-500 rounded-lg font-bold bg-white text-lg p-2 my-1">
                    {message}
                  </p>
                ) : (
                  <p className="text-red-500 rounded-lg bg-white text-lg p-2 my-1">
                    USERNAME : {message}
                  </p>
                ))}
              {errorMessage && (
                <p className="text-red-400 rounded-lg bg-white text-lg p-2 my-1">
                  {errorMessage}
                </p>
              )}
              {[
                "mobilelegends",
                "magicchess",
                "genshinimpact",
                "pubg",
                "freefire",
                "honorofkings",
                "bloodstrike",
              ].includes(game) && (
                <button
                  type="submit"
                  onClick={handleSubmitCheckRole}
                  disabled={loading}
                  className="bg-red-500 w-full rounded-lg p-2 text-white shadow-md font-bold"
                >
                  {loading ? "Loading..." : "ពិនិត្យ ឈ្មោះ"}
                </button>
              )}
            </form>
          </BackgroundGradient>

          <BackgroundGradient className="px-4 py-8 rounded-3xl bg-black relative">
            <Label text={"ជ្រើសរើសកញ្ចប់ ពេជ្រ"} number={2} />
            {groupedCost.map((item, index) => (
              <div key={index} className="mt-4">
                {item.category !== "no_category" && item.items.length !== 0 && (
                  <div className="bg-red-500 text-white flex items-center mx-auto mt-2 gap-2  rounded-xl py-2 px-4 w-fit ">
                    <h1 className="font-bold text-lg  ">{item.category}</h1>
                  </div>
                )}

                <div className="grid md:grid-cols-3 grid-cols-2 gap-4 md:gap-6 mt-4">
                  {item.items.map((item, i) => {
                    return (
                      <CostItem
                        key={item.id}
                        item={item}
                        i={i}
                        amountSelected={amountSelected}
                        setAmountSelected={setAmountSelected}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </BackgroundGradient>

          {/* Updated Coupon Section */}
          <BackgroundGradient className="px-4 py-8 relative bg-black rounded-3xl">
            <Label text={"អនុវត្តកូដកា"} number={appliedCoupon ? "✓" : "3"} />

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex gap-2 flex-col">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  disabled={!!appliedCoupon}
                  className="flex-1 rounded-lg bg-white border-2 text-black focus:outline-blue-500 focus:outline border-[#bdbdbd] py-2 px-4"
                />
              </div>

              {couponError && (
                <p className="text-red-500 text-sm">{couponError}</p>
              )}

              {appliedCoupon && (
                <div className="bg-green-100 text-green-800 p-2 rounded-lg">
                  <p className="font-bold">
                    {appliedCoupon.couponDetails?.type === "percentage"
                      ? `${appliedCoupon.discount}% discount applied!`
                      : `$${appliedCoupon.discount} discount applied!`}
                  </p>
                  {appliedCoupon.couponDetails?.minAmount && (
                    <p className="text-sm">
                      Valid on orders over $
                      {appliedCoupon.couponDetails.minAmount}
                    </p>
                  )}
                </div>
              )}

              {appliedCoupon ? (
                <button
                  onClick={removeCoupon}
                  className="bg-red-500 w-24  rounded-lg p-2 text-white font-bold"
                >
                  Remove
                </button>
              ) : (
                <button
                  onClick={handleApplyCoupon}
                  disabled={isCheckingCoupon || !couponCode.trim()}
                  className="bg-red-500 w-24 rounded-lg p-2 text-white font-bold disabled:opacity-50"
                >
                  {isCheckingCoupon ? (
                    <span className="inline-flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-1 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Applying
                    </span>
                  ) : (
                    "Apply"
                  )}
                </button>
              )}
            </div>
          </BackgroundGradient>

          {/* Payment Options */}
          <BackgroundGradient className="px-4 py-8 bg-black relative rounded-3xl">
            <Label text={"ទូទាត់ប្រាក់បានគ្រប់ធនាគារ"} number={4} />
            <div className=" w-full rounded-xl p-4 bg-gray-500 border-white border flex items-center justify-between mt-4 ">
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
                  <p>Scan to pay with any banking app</p>
                </div>
              </div>
              <p className="text-lg font-bold text-red-200"> ${total}</p>
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
                I agree
                <span
                  onClick={() => router.push("/terms-and-conditions")}
                  className="text-red-500 font-bold  ml-2 cursor-pointer"
                >
                  TERMS AND CONDITIONS
                </span>
              </label>
            </div>
          </BackgroundGradient>

          {/* Payment Summary - Updated to show discount breakdown */}
          <div className="md:static z-[50] fixed bottom-2 left-0 w-full md:px-0 md:mt-2 px-2">
            <div className="bg-red-50  md:rounded-none rounded-2xl  text-black -mt-8 p-4 flex items-center justify-between">
              <div>
                <div className="text-lg">
                  {appliedCoupon ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span>Original:</span>
                        <span className="line-through">
                          ${amountSelected.price}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Discount:</span>
                        <span className="text-red-500">
                          -$
                          {(
                            parseFloat(amountSelected.price) - parseFloat(total)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </>
                  ) : null}
                  <p className="text-red-500 font-bold">
                    TOTAL : <span className="">{total}$</span>
                  </p>
                </div>
                <p className="text-gray-700 font-extrabold">
                  {amountSelected.amount}
                </p>
              </div>
              <button
                disabled={
                  !isAgree ||
                  (game === "mobilelegends" && !playerAvailable) ||
                  !amountSelected.id
                }
                onClick={createOrder}
                className="bg-red-500 shadow-md shadow-red-500 disabled:opacity-50 w-[100px] rounded-lg p-2 text-white font-bold "
              >
                បង់ ឥឡូវ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <PaymentForm paymentData={paymentData} formRef={formRef} />
    </>
  );
};
export default Product;
