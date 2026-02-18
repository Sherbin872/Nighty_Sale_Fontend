import axiosInstance from './axiosConfig';

/* =======================
   ORDER API
======================= */
export const orderApi = {
  createOrder: async (orderData) => {
    const response = await axiosInstance.post('/orders', orderData);
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await axiosInstance.get('/orders/myorders');
    return response.data;
  },

  updateOrderToPaid: async (orderId, paymentData) => {
    const response = await axiosInstance.put(
      `/orders/${orderId}/pay`,
      paymentData
    );
    return response.data;
  },
};

/* =======================
   PAYMENT API
======================= */
export const paymentApi = {
  getRazorpayKey: async () => {
    const response = await axiosInstance.get('/payment/key');
    return response.data;
  },

  createRazorpayOrder: async (amount) => {
    const response = await axiosInstance.post('/payment/checkout', { amount });
    return response.data;
  },

  verifyPayment: async (verificationData) => {
    const response = await axiosInstance.post(
      '/payment/verification',
      verificationData
    );
    return response.data;
  },
};

/* =======================
   ORDER UTILS (FIXED)
======================= */
export const orderUtils = {
  calculateOrderTotals: (cartItems = []) => {
    const itemsPrice = cartItems.reduce((acc, item) => {
      const price = Number(item.price);
      const qty = Number(item.quantity ?? item.qty);

      if (Number.isNaN(price) || Number.isNaN(qty)) {
        console.error('Invalid cart item detected:', item);
        return acc;
      }

      return acc + price * qty;
    }, 0);

    const taxPrice = Math.round(itemsPrice * 0.18);
    const shippingPrice = itemsPrice > 1000 ? 0 : 50;
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    return {
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    };
  },

  prepareOrderData: (cartItems, shippingAddress, paymentMethod, userInfo) => {
    const totals = orderUtils.calculateOrderTotals(cartItems);

    const orderItems = cartItems.map((item) => ({
      product: item.productId,
      name: item.name,
      qty: item.quantity ?? item.qty,
      image:
        typeof item.image === 'object'
          ? item.image.thumbnail
          : item.image,
      price: item.price,
      size: item.size,
    }));

    return {
      orderItems,
      shippingAddress,
      paymentMethod,
      ...totals,
      user: userInfo?._id,
    };
  },

  validateShippingAddress: (address) => {
    const required = ['address', 'city', 'postalCode', 'country', 'phone'];
    const missing = required.filter((f) => !address[f]);

    if (missing.length) {
      return {
        isValid: false,
        message: `Please fill in: ${missing.join(', ')}`,
      };
    }

    if (!/^[0-9]{10}$/.test(address.phone)) {
      return {
        isValid: false,
        message: 'Please enter a valid 10-digit phone number',
      };
    }

    return { isValid: true };
  },

  checkStockAvailability: (cartItems) => {
    const outOfStock = cartItems.filter(
      (item) => (item.quantity ?? item.qty) > item.countInStock
    );

    if (outOfStock.length) {
      return {
        available: false,
        items: outOfStock.map((i) => i.name),
      };
    }

    return { available: true };
  },
};

/* =======================
   CHECKOUT SERVICE
======================= */
export const checkoutService = {
  getOrderSummary: (cartItems = []) => {
    const totals = orderUtils.calculateOrderTotals(cartItems);

    console.log('Cart Items:', cartItems);
    console.log('Calculated Totals:', totals);

    return {
      subtotal: totals.itemsPrice,
      tax: totals.taxPrice,
      shipping: totals.shippingPrice,
      total: totals.totalPrice,
      freeShipping: totals.shippingPrice === 0,
      freeShippingThreshold: 1000,
    };
  },

  processCheckout: async ({
    cartItems,
    shippingAddress,
    paymentMethod,
    userInfo,
    onStepChange,
    onSuccess,
    onError,
  }) => {
    try {
      onStepChange('validating');

      const addressCheck =
        orderUtils.validateShippingAddress(shippingAddress);
      if (!addressCheck.isValid) throw new Error(addressCheck.message);

      const stockCheck =
        orderUtils.checkStockAvailability(cartItems);
      if (!stockCheck.available) {
        throw new Error(
          `Out of stock: ${stockCheck.items.join(', ')}`
        );
      }

      onStepChange('creating_order');

      const orderData = orderUtils.prepareOrderData(
        cartItems,
        shippingAddress,
        paymentMethod,
        userInfo
      );

      const dbOrder = await orderApi.createOrder(orderData);

      onStepChange('processing_payment');

      await razorpayService.initializePayment({
        dbOrderId: dbOrder._id,
        amount: orderData.totalPrice,
        userInfo,
        onSuccess,
        onFailure: onError,
      });
    } catch (err) {
      console.error('Checkout error:', err);
      onError(err.message || 'Checkout failed');
      onStepChange('failed');
    }
  },
};

/* =======================
   RAZORPAY SERVICE
======================= */
export const razorpayService = {
  initializePayment: async ({
    dbOrderId,
    amount,
    userInfo,
    onSuccess,
    onFailure,
  }) => {
    const { key } = await paymentApi.getRazorpayKey();
    const { order } = await paymentApi.createRazorpayOrder(amount);

    await razorpayService.loadRazorpayScript();

   const rzp = new window.Razorpay({
  key,
  amount: order.amount,
  currency: order.currency,
  name: 'Nighty Store',
  description: `Order #${dbOrderId}`,
  order_id: order.id,

  method: {
    upi: true,
    card: true,
    wallet: true,
    netbanking: true,
  },

  handler: async (response) => {
    try {
      await paymentApi.verifyPayment({
        ...response,
        orderId: dbOrderId,
      });
      await orderApi.updateOrderToPaid(dbOrderId, response);
      onSuccess(dbOrderId);
    } catch {
      onFailure('Payment verification failed');
    }
  },

  prefill: {
    name: userInfo?.name,
    email: userInfo?.email,
    contact: userInfo?.phone,
  },
});


    rzp.open();
  },



















  // initializePayment: async ({
  //   dbOrderId,
  //   amount,
  //   userInfo,
  //   onSuccess,
  //   onFailure,
  // }) => {
    
  // /* =============================
  //    DEV MODE PAYMENT BYPASS
  // ============================== */
  // let VITE_SKIP_PAYMENT = 'true'
  // if (VITE_SKIP_PAYMENT === 'true') {
  //   console.warn('⚠️ DEV MODE: Payment bypassed');

  //   // Fake Razorpay response
  //   const fakePayment = {
  //     razorpay_order_id: 'DEV_ORDER_ID',
  //     razorpay_payment_id: 'DEV_PAYMENT_ID',
  //     razorpay_signature: 'DEV_SIGNATURE',
  //   };

  //   // Directly mark order as paid
  //   await orderApi.updateOrderToPaid(dbOrderId, fakePayment);

  //   onSuccess(dbOrderId);
  //   return;
  // }

  // /* =============================
  //    REAL RAZORPAY FLOW
  // ============================== */

  // const { key } = await paymentApi.getRazorpayKey();
  // const { order } = await paymentApi.createRazorpayOrder(amount);

  // await razorpayService.loadRazorpayScript();

  // const rzp = new window.Razorpay({
  //   key,
  //   amount: order.amount,
  //   currency: order.currency,
  //   name: 'Nighty Store',
  //   description: `Order #${dbOrderId}`,
  //   order_id: order.id,

  //   handler: async (response) => {
  //     try {
  //       await paymentApi.verifyPayment({
  //         ...response,
  //         orderId: dbOrderId,
  //       });

  //       await orderApi.updateOrderToPaid(dbOrderId, response);
  //       onSuccess(dbOrderId);
  //     } catch {
  //       onFailure('Payment verification failed');
  //     }
  //   },

  //   prefill: {
  //     name: userInfo?.name,
  //     email: userInfo?.email,
  //     contact: userInfo?.phone,
  //   },
  // });

  // rzp.open();
  // },












  loadRazorpayScript: () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve();
      const s = document.createElement('script');
      s.src = 'https://checkout.razorpay.com/v1/checkout.js';
      s.onload = resolve;
      document.body.appendChild(s);
    }),
};

export default {
  orderApi,
  paymentApi,
  orderUtils,
  razorpayService,
  checkoutService,
};
