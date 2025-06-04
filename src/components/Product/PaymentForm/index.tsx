interface PaymentFormProps {
  paymentData: any;
  formRef: any;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ paymentData, formRef }) => {
  return (
    <div id="aba_main_modal" className="aba-modal">
      <div className="aba-modal-content">
        {paymentData && (
          <form
            ref={formRef}
            method="POST"
            target="aba_webservice"
            action={process.env.NEXT_PUBLIC_PAYWAY_URL!}
            id="aba_merchant_request"
          >
            <input
              type="hidden"
              name="hash"
              value={paymentData.hash}
              id="hash"
            />
            <input
              type="hidden"
              name="tran_id"
              value={paymentData.tran_id}
              id="tran_id"
            />
            <input
              type="hidden"
              name="amount"
              value={paymentData.amount}
              id="amount"
            />

            {paymentData.items && (
              <input type="hidden" name="items" value={paymentData.items} />
            )}
            {paymentData.shipping && (
              <input
                type="hidden"
                name="shipping"
                value={paymentData.shipping}
              />
            )}
            {paymentData.type && (
              <input type="hidden" name="type" value={paymentData.type} />
            )}
            {paymentData.payment_option && (
              <input
                type="hidden"
                name="payment_option"
                value={paymentData.payment_option}
              />
            )}
            {paymentData.return_url && (
              <input
                type="hidden"
                name="return_url"
                value={paymentData.return_url}
              />
            )}
            {paymentData.cancel_url && (
              <input
                type="hidden"
                name="cancel_url"
                value={paymentData.cancel_url}
              />
            )}
            {paymentData.continue_success_url && (
              <input
                type="hidden"
                name="continue_success_url"
                value={paymentData.continue_success_url}
              />
            )}
            {paymentData.return_deeplink && (
              <input
                type="hidden"
                name="return_deeplink"
                value={paymentData.return_deeplink}
              />
            )}
            {paymentData.currency && (
              <input
                type="hidden"
                name="currency"
                value={paymentData.currency}
              />
            )}
            {paymentData.custom_fields && (
              <input
                type="hidden"
                name="custom_fields"
                value={paymentData.custom_fields}
              />
            )}
            {paymentData.return_params && (
              <input
                type="hidden"
                name="return_params"
                value={paymentData.return_params}
              />
            )}

            <input
              type="hidden"
              name="merchant_id"
              value={paymentData.merchant_id}
            />
            <input type="hidden" name="req_time" value={paymentData.req_time} />
          </form>
        )}
      </div>
    </div>
  );
};

export default PaymentForm;
