"use client";
import { useEffect, useMemo } from "react";
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
import {
  fetchCategories,
  groupCostByCategory,
  calculateTotal,
} from "./utils/productUtils";

declare const AbaPayway: any;

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
  const state = useProductState(game, region);
  const {
    userId,
    setUserId,
    zoneId,
    setZoneId,
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
    setAppliedCoupon
  );

  const { fetchCheckRole } = useUserVerification(
    setLoading,
    setPlayerAvailable,
    setMessage,
    setErrorMessage
  );

  const { createOrder: createOrderUtil } = useOrder(setPaymentData);

  const handleApplyCoupon = async () => {
    await applyCoupon({ couponCode, amountSelected, _id });
  };

  const handleSubmitCheckRole = async (
    e: React.SyntheticEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();
    await fetchCheckRole(userId, zoneId, game, region);
  };

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
  }, [paymentData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPlayerAvailable(false);
    setMessage("");
    if (name === "userId") setUserId(value);
    else if (name === "zoneId") setZoneId(value);
  };

  const handleCreateOrder = async () => {
    await createOrderUtil({
      userId,
      zoneId,
      amountSelected,
      isAgree,
      stock,
      game,
      isApi,
      playerAvailable,
      name,
      _id,
      region,
      appliedCoupon,
    });
  };

  const groupedCost = useMemo(
    () => groupCostByCategory(costCategories, cost),
    [cost, costCategories]
  );

  const total = useMemo(
    () => calculateTotal(amountSelected, appliedCoupon),
    [amountSelected, appliedCoupon]
  );

  useEffect(() => {
    if (amountSelected.id) {
      setAppliedCoupon(null);
      setCouponError("");
    }
  }, [amountSelected]);

  useEffect(() => {
    fetchCategories(setCostCategories);
  }, []);

  // Fallback
  if (isDeleted) {
    return (
      <div className="w-full flex justify-center items-center">
        <h1 className="text-2xl">រកមិនឃើញផលិតផល</h1>
      </div>
    );
  }
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 max-w-screen-xl mx-auto gap-6 py-6 sm:px-6 px-4">
        {/* Banner Section */}
        <div className="-mt-6">
          {slides.length > 0 && <SliderComponent slides={slides} />}
          {banner && (
            <div className="flex items-center gap-4 mt-4">
              <Image
                src={banner as string}
                alt={banner as string}
                width={400}
                height={400}
                className="rounded-lg w-full"
              />
            </div>
          )}
        </div>

        {/* Checkout Section */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <UserIdSection
            game={game}
            userId={userId}
            zoneId={zoneId}
            message={message}
            errorMessage={errorMessage}
            loading={loading}
            handleInputChange={handleInputChange}
            setZoneId={setZoneId}
            handleSubmitCheckRole={handleSubmitCheckRole}
          />

          <PackageSection
            groupedCost={groupedCost}
            amountSelected={amountSelected}
            setAmountSelected={setAmountSelected}
          />

          <CouponSection
            appliedCoupon={appliedCoupon}
            couponCode={couponCode}
            couponError={couponError}
            isCheckingCoupon={isCheckingCoupon}
            setCouponCode={setCouponCode}
            handleApplyCoupon={handleApplyCoupon}
            removeCoupon={handleRemoveCoupon}
          />

          <PaymentSection
            total={total}
            isAgree={isAgree}
            setIsAgree={setIsAgree}
          />

          <PaymentSummary
            appliedCoupon={appliedCoupon}
            amountSelected={amountSelected}
            total={total}
            isAgree={isAgree}
            game={game}
            playerAvailable={playerAvailable}
            createOrder={handleCreateOrder}
          />
        </div>
      </div>

      <PaymentForm paymentData={paymentData} formRef={formRef} />
    </>
  );
};
export default Product;
