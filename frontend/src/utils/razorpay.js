export const initializeRazorpayPayment = async (orderData, onSuccess, onError) => {
  try {
    const options = {
      key: orderData.keyId,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'Diet Buddy',
      description: 'Premium Membership',
      order_id: orderData.orderId,
      handler: function (response) {
        onSuccess(response);
      },
      prefill: {
        name: 'User Name',
        email: 'user@example.com',
        contact: '9999999999'
      },
      notes: {
        address: 'Diet Buddy Office'
      },
      theme: {
        color: '#3B82F6'
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  } catch (error) {
    onError(error);
  }
}; 