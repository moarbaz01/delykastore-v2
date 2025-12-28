import { useState, useRef } from "react";

export const useProductState = (game: string, region?: string) => {
  const [userId, setUserId] = useState(() =>
    localStorage.getItem(`${game}${region}-userid`)
  );

  const [zoneId, setZoneId] = useState(() =>
    localStorage.getItem(`${game}${region}-zoneid`)
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
  const [isAgree, setIsAgree] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const [costCategories, setCostCategories] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);
  const formRef = useRef(null);

  return {
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
  };
};
