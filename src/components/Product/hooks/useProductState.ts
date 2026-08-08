import { useState, useRef } from "react";

export const useProductState = (game: string, region?: string) => {
  const [userId, setUserId] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(`${game}${region}-userid`) : null
  );

  const [zoneId, setZoneId] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(`${game}${region}-zoneid`) : null
  );

  const [urlLink, setUrlLink] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(`${game}${region}-urllink`) || "" : ""
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
  const [message, setMessage] = useState(() => 
    typeof window !== "undefined" ? localStorage.getItem(`${game}${region}-username`) || "" : ""
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [playerAvailable, setPlayerAvailable] = useState(() => 
    typeof window !== "undefined" ? !!localStorage.getItem(`${game}${region}-username`) : false
  );
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
  };
};
