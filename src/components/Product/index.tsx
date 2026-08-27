"use client";
import { useEffect, useMemo, useState } from "react";
import Label from "./Label";
import Image from "next/image";
import SliderComponent from "../Home/Banner/Component";
import PaymentForm from "./PaymentForm";
import UserIdSection from "./UserIdSection";
import PackageSection from "./PackageSection";
import CouponSection from "./CouponSection";
import PaymentSection from "./PaymentSection";
import PaymentSummary from "./PaymentSummary";
import { useProductState } from "./hooks/useProductState";
import { useCoupon } from "./hooks/useCoupon";
import { useUserVerification } from "./hooks/useUserVerification";
import { useOrder } from "./hooks/useOrder";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { calculateTotal } from "./utils/productUtils";
import GiftBox from "../ui/Gift";
import GiftModal from "../ui/GiftModal";
import axios from "axios";
import { Reveal } from "../ui/Reveal";
import { getOptimizedUrl } from "@/utils/optimizeImage";
import toast from "react-hot-toast";

declare const AbaPayway: any;

const Product = ({
  name,
  _id,
  image,
  isDeleted,
  region,
  slides,
  banner,
  isApi,
  stock,
  cost,
  gift,
  game,
  groupedCost,
  categories,
  type,
  description,
  requiresServerId,
  requiresUserId,
  requiresCharName,
  requiresUrlInput,
  urlInputLabel,
  urlInputType,
}: {
  name: string;
  description: string;
  _id: string;
  image: string;
  region?: string;
  isDeleted: boolean;
  type: string;
  isApi: boolean;
  requiresServerId?: boolean;
  requiresUserId?: boolean;
  requiresCharName?: boolean;
  requiresUrlInput?: boolean;
  urlInputLabel?: string;
  urlInputType?: string;
  stock: true;
  gift: {
    isActive: boolean;
    bannerText: string;
    costs: any[];
    features: any[];
    wageringLevels: {
      level: number;
      wagering: number;
      costIds: string[];
    }[];
  };
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
    slots?: number;
  }[];
  groupedCost?: any[];
  categories?: string[];
}) => {
  const { data: session } = useSession();
  const router = useRouter();
  const state = useProductState(game, region);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [wagering, setWagering] = useState(0);

  // Fetch gifts for this product

  const {
    userId,
    setUserId,
    zoneId,
    setZoneId,
    urlLink,
    setUrlLink,
    amountSelected,
    setAmountSelected,
    loading,
    setLoading,
    message,
    setMessage,
    errorMessage,
    setErrorMessage,
    playerAvailable,
    setPlayerAvailable,
    isAgree,
    setIsAgree,
    paymentData,
    setPaymentData,
    costCategories,
    setCostCategories,
    couponCode,
    setCouponCode,
    appliedCoupon,
    setAppliedCoupon,
    couponError,
    setCouponError,
    isCheckingCoupon,
    setIsCheckingCoupon,
    formRef,
  } = state;

  const { applyCoupon, removeCoupon: removeCouponUtil } = useCoupon(
    setIsCheckingCoupon,
    setCouponError,
    setAppliedCoupon,
  );

  const [claimedLevels, setClaimedLevels] = useState<number[]>([]);
  const [levelsLoading, setLevelLoading] = useState(true);

  const { fetchCheckRole } = useUserVerification(
    setLoading,
    setPlayerAvailable,
    setMessage,
    setErrorMessage,
  );

  const { createOrder: createOrderUtil, isLoading } = useOrder(setPaymentData);

  const handleApplyCoupon = async () => {
    await applyCoupon({ couponCode, amountSelected, _id });
  };

  const handleSubmitCheckRole = async (
    e?: React.SyntheticEvent<HTMLButtonElement>,
  ) => {
    if (e) e.preventDefault();
    await fetchCheckRole(userId, zoneId, game, region);
    if (userId) {
      localStorage.setItem(`${game}${region}-userid`, userId);
    }

    if (zoneId) {
      localStorage.setItem(`${game}${region}-zoneid`, zoneId);
    }
    if (urlLink) {
      localStorage.setItem(`${game}${region}-urllink`, urlLink);
    }
  };

  useEffect(() => {
    // Determine if the game requires a Zone ID
    const reqZoneId = requiresServerId !== undefined
      ? requiresServerId
      : (["mobilelegends", "magicchess", "genshinimpact"].includes(game) || game.startsWith("mlbb"));

    const reqUserId = requiresUserId !== undefined ? requiresUserId : true;

    // Check if required fields are filled
    const canCheck = (!reqUserId || userId) && (!reqZoneId || zoneId);

    if (canCheck && (userId || zoneId)) {
      // Auto-trigger the check after the user stops typing for 1 second
      const timer = setTimeout(() => {
        handleSubmitCheckRole();
      }, 1000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, zoneId, game, region]);

  const handleRemoveCoupon = () => {
    removeCouponUtil(setAppliedCoupon, setCouponCode, setCouponError);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentData]);

  // Fetch claimed levels when modal opens
  useEffect(() => {
    if (playerAvailable && userId) {
      fetchClaimedLevels();

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerAvailable, userId]);

  const fetchClaimedLevels = async () => {
    try {
      setLevelLoading(true);
      const response = await axios.get("/api/gifts/claimed-levels", {
        params: {
          userId,
          productId: _id,
        },
      });

      if (response.data.success) {
        setClaimedLevels(response.data.claimedLevels || []);
      }
    } catch (error) {
      console.error("Error fetching claimed levels:", error);
      setClaimedLevels([]);
    } finally {
      setLevelLoading(false);
    }
  };

  const fetchWageringData = async () => {
    try {
      if (!gift || !gift.isActive) return;
      const res = await axios.get(`/api/gifts/wagering?userId=${userId}&productId=${_id}`);
      setWagering(res.data.totalWagered);
    } catch (error) {
      console.error("Error fetching wagering data:", error);
    }
  };

  useEffect(() => {
    if (playerAvailable && userId) {
      fetchWageringData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerAvailable, userId]);

  useEffect(() => {
    if (type === "account") {
      setPlayerAvailable(true);
    } else if (type === "digital-service") {
      if (requiresUrlInput) {
        setPlayerAvailable(!!urlLink);
      } else {
        setPlayerAvailable(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, urlLink, requiresUrlInput]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPlayerAvailable(false);
    setMessage("");
    if (name === "userId") setUserId(value);
    else if (name === "zoneId") setZoneId(value);
    else if (name === "urlLink") setUrlLink(value);
  };

  const handleCreateOrder = async () => {
    if (type === "account" && !session) {
      router.push("/login");
      return;
    }

    if (requiresUrlInput && urlInputType === "url" && urlLink) {
      try {
        new URL(urlLink);
      } catch (e) {
        toast.error("Please enter a valid URL.");
        return;
      }
    }

    await createOrderUtil({
      userId,
      zoneId,
      urlLink,
      amountSelected,
      isAgree,
      stock,
      game,
      isApi,
      playerAvailable,
      name,
      _id,
      region,
      type: type as any,
      appliedCoupon,
    });
  };

  const [groupedCostState, setGroupedCostState] = useState(groupedCost || []);

  const handleOpenGiftModal = () => {
    if (!gift || !gift.isActive) return;
    if (!userId || !playerAvailable) {
      setErrorMessage("Click check name to receive reward");
      return;
    }
    setShowGiftModal(true);
  };

  const total = useMemo(
    () => calculateTotal(amountSelected, appliedCoupon),
    [amountSelected, appliedCoupon],
  );

  useEffect(() => {
    if (amountSelected.id) {
      setAppliedCoupon(null);
      setCouponError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountSelected.id]);

  useEffect(() => {
    if (categories) {
      setCostCategories(categories);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories]);

  // Fallback
  if (isDeleted) {
    return (
      <div className="w-full flex justify-center items-center">
        <h1 className="text-2xl">Product not found</h1>
      </div>
    );
  }
  const hasStep1 = (type !== "account" && type !== "digital-service") || (type === "digital-service" && requiresUrlInput);
  const stepPackage = hasStep1 ? 2 : 1;
  const stepCoupon = hasStep1 ? 3 : 2;
  const stepPayment = hasStep1 ? 4 : 3;

  const urlLabelPrefix = urlInputLabel ? urlInputLabel.replace(/^Enter\s+/i, '') : "Profile Link";
  const formattedUrlLabel = `Enter ${urlLabelPrefix}`;

  return (
    <>
      <div
        className={`grid max-w-screen-xl relative mx-auto gap-6 md:py-6 sm:px-4 px-4 items-start animate-fade-in ${slides?.length === 0 && !banner
          ? "grid-cols-1 justify-center"
          : "grid-cols-1 lg:grid-cols-3"
          }`}
      >
        {gift && gift.isActive && (
          <GiftBox
            onClick={handleOpenGiftModal}
          />
        )}
        {/* Banner Section */}

        {(slides.length > 0 || banner) && (
          <div className=" flex flex-col gap-4 md:sticky md:mt-0 mt-4 md:top-20">
            {slides.length > 0 && <SliderComponent slides={slides} />}

            {banner && (
              <div className="flex items-center gap-4 ">
                <Image
                  src={getOptimizedUrl(banner as string, 800)}
                  alt={banner as string}
                  width={400}
                  height={400}
                  priority
                  unoptimized={true}
                  className="rounded-lg w-full"
                />
              </div>
            )}
          </div>
        )}
        {/* Checkout Section */}
        <div
          className={`flex flex-col gap-4 ${slides.length === 0 && !banner
            ? "w-full max-w-3xl mx-auto md:mt-2 mt-4"
            : "lg:col-span-2"
            }`}
        >
          {/* 
          <div className="flex justify-center flex-col gap-2 items-center">
            <Image
              src={image as string}
              alt="image"
              width={100}
              height={100}
              className="rounded-full"
            />
            <p className="text-sm">{name}</p>

          </div> */}

          {type !== "account" && type !== "digital-service" && (
            <Reveal width="100%" delay={0.1}>
              <UserIdSection
                requiresServerId={requiresServerId}
                requiresUserId={requiresUserId}
                requiresCharName={requiresCharName}
                game={game}
                isApi={isApi}
                userId={userId}
                zoneId={zoneId}
                message={message}
                errorMessage={errorMessage}
                loading={loading}
                handleInputChange={handleInputChange}
                setZoneId={setZoneId}
                handleSubmitCheckRole={handleSubmitCheckRole}
              />
            </Reveal>
          )}

          {(type === "account" || type === "digital-service") && description && (
            <Reveal width="100%" delay={0.1}>
              <div
                className="p-4 rounded-2xl"
                style={{ background: "#FFFFFF", border: "1px solid rgba(255,117,151,0.15)" }}
              >
                <h2 className="text-sm font-bold mb-2" style={{ color: "#FF7597" }}>Description</h2>
                <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed break-words">
                  {description}
                </p>
              </div>
            </Reveal>
          )}

          {type === "digital-service" && requiresUrlInput && (
            <Reveal width="100%" delay={0.1}>
              <div
                className="p-4 rounded-2xl relative"
                style={{ background: "#FFFFFF", border: "1px solid rgba(255,117,151,0.15)" }}
              >
                <Label text={formattedUrlLabel} number={1} />
                <form className="flex flex-col gap-3 mt-4">
                  <input
                    type={urlInputType || "text"}
                    placeholder={formattedUrlLabel}
                    onChange={handleInputChange}
                    value={urlLink}
                    name="urlLink"
                    autoComplete="on"
                    className="rounded-xl w-full text-gray-900 placeholder:text-gray-500 focus:outline-none py-2.5 px-4 text-sm transition-all duration-200"
                    style={{
                      background: "#FDFDFD",
                      border: "1px solid rgba(255,117,151,0.2)",
                    }}
                    onFocus={(e) => {
                      e.target.style.outline = "none";
                      e.target.style.borderColor = "rgba(255,117,151,0.6)";
                      e.target.style.boxShadow = "0 0 0 3px rgba(255,117,151,0.1)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,117,151,0.2)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </form>
              </div>
            </Reveal>
          )}



          <Reveal width="100%" delay={0.2}>
            <PackageSection
              groupedCost={groupedCostState}
              amountSelected={amountSelected}
              setAmountSelected={setAmountSelected}
              stepNumber={stepPackage}
            />
          </Reveal>

          <Reveal width="100%" delay={0.3}>
            <CouponSection
              appliedCoupon={appliedCoupon}
              couponCode={couponCode}
              couponError={couponError}
              isCheckingCoupon={isCheckingCoupon}
              setCouponCode={setCouponCode}
              handleApplyCoupon={handleApplyCoupon}
              removeCoupon={handleRemoveCoupon}
              stepNumber={stepCoupon}
            />
          </Reveal>

          <Reveal width="100%" delay={0.4}>
            <PaymentSection
              total={total}
              isAgree={isAgree}
              setIsAgree={setIsAgree}
              stepNumber={stepPayment}
            />
          </Reveal>

          <PaymentSummary
            appliedCoupon={appliedCoupon}
            amountSelected={amountSelected}
            total={total}
            isAgree={isAgree}
            game={game}
            type={type}
            playerAvailable={playerAvailable}
            createOrder={handleCreateOrder}
            isLoading={isLoading}
          />
        </div>
      </div>

      <PaymentForm paymentData={paymentData} formRef={formRef} />

      {/* Gift Modal */}
      {gift && !levelsLoading && (
        <GiftModal
          open={showGiftModal}
          onClose={() => setShowGiftModal(false)}
          data={{
            bannerText: gift.bannerText || "Gift this product to a friend",
            userWagering: wagering || 0,
            wagering: gift?.wageringLevels,
            productId: _id || "",
            costs: gift?.costs,
            features: gift?.features,
            userId: userId || "",
            zoneId: zoneId || "",
            claimedLevels,
          }}
        />
      )}
    </>
  );
};
export default Product;
