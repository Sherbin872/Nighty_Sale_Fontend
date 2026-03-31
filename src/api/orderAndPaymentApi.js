import axiosInstance from "./axiosConfig";

/* =======================
   ORDER API
======================= */
export const orderApi = {
  createOrder: async (orderData) => {
    const response = await axiosInstance.post("/orders", orderData);
    return response.data;
  },

  getOrderById: async (orderId) => {
    const response = await axiosInstance.get(`/orders/${orderId}`);
    return response.data;
  },

  getMyOrders: async () => {
    const response = await axiosInstance.get("/orders/myorders");
    return response.data;
  },

  updateOrderToPaid: async (orderId, paymentData) => {
    const response = await axiosInstance.put(
      `/orders/${orderId}/pay`,
      paymentData,
    );
    return response.data;
  },

  // NEW: Add deleteOrder to remove unpaid ghost orders
  deleteOrder: async (orderId) => {
    const response = await axiosInstance.delete(`/orders/${orderId}`);
    return response.data;
  },
};

/* =======================
   PAYMENT API
======================= */
export const paymentApi = {
  getRazorpayKey: async () => {
    const response = await axiosInstance.get("/payment/key");
    return response.data;
  },

  createRazorpayOrder: async (amount) => {
    const response = await axiosInstance.post("/payment/checkout", { amount });
    return response.data;
  },

  verifyPayment: async (verificationData) => {
    const response = await axiosInstance.post(
      "/payment/verification",
      verificationData,
    );
    return response.data;
  },
};

/* =======================
   ORDER UTILS (UPDATED)
======================= */
export const orderUtils = {
  // CHANGED: Accept postalCode instead of user
  calculateOrderTotals: (cartItems = [], postalCode = '') => {
    console.log("Calculating order totals with PIN:", postalCode);
    const itemsPrice = cartItems.reduce((acc, item) => {
      const price = Number(item.price);
      const qty = Number(item.quantity ?? item.qty);

      if (Number.isNaN(price) || Number.isNaN(qty)) {
        console.error("Invalid cart item detected:", item);
        return acc;
      }

      return acc + price * qty;
    }, 0);

    const totalQuantity = cartItems.reduce((acc, item) => {
      const qty = Number(item.quantity ?? item.qty);
      return acc + (Number.isNaN(qty) ? 0 : qty);
    }, 0);

    const taxPrice = 0;
    
    // ==========================================
    // DYNAMIC SHIPPING LOGIC (VIA PIN CODE)
    // ==========================================
    let shippingPrice = 0;
    
    if (totalQuantity < 3) {
      // Tamil Nadu PIN codes start with 60, 61, 62, 63, or 64 and are 6 digits long.
      const isTamilNadu = /^(60|61|62|63|64)\d{4}$/.test(postalCode || '');
      
      if (isTamilNadu) {
        shippingPrice = 50;  // Inside TN
      } else {
        shippingPrice = 100; // Outside TN (only charge 100 if they've typed a full pin code)
      } 
    }
    // ==========================================
    
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    return {
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    };
  },

  prepareOrderData: (cartItems, shippingAddress, paymentMethod, user) => {
    console.log("Preparing order data");
    // NEW: Pass the postalCode from shippingAddress here!
    const totals = orderUtils.calculateOrderTotals(cartItems, shippingAddress.postalCode);

    const orderItems = cartItems.map((item) => ({
      product: item.productId,
      name: item.name,
      qty: item.quantity ?? item.qty,
      image: typeof item.image === "object" ? item.image.thumbnail : item.image,
      price: item.price,
      size: item.size,
    }));

    return {
      orderItems,
      shippingAddress,
      paymentMethod,
      ...totals,
      user: user?._id,
    };
  },

  validateShippingAddress: (address) => {
    const required = ["address", "city", "postalCode", "country", "phone"];
    const missing = required.filter((f) => !address[f]);

    if (missing.length) {
      return {
        isValid: false,
        message: `Please fill in: ${missing.join(", ")}`,
      };
    }

    if (!/^[0-9]{10}$/.test(address.phone)) {
      return {
        isValid: false,
        message: "Please enter a valid 10-digit phone number",
      };
    }

    return { isValid: true };
  },

  checkStockAvailability: (cartItems) => {
    const outOfStock = cartItems.filter(
      (item) => (item.quantity ?? item.qty) > item.countInStock,
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
   CHECKOUT SERVICE (UPDATED)
======================= */
export const checkoutService = {
  // CHANGED: Accept postalCode instead of user
  getOrderSummary: (cartItems = [], postalCode = '') => {
    console.log("Getting order summary with PIN:", postalCode);
    const totals = orderUtils.calculateOrderTotals(cartItems, postalCode);

    return {
      subtotal: totals.itemsPrice,
      tax: totals.taxPrice,
      shipping: totals.shippingPrice,
      total: totals.totalPrice,
      freeShipping: totals.shippingPrice === 0,
      freeShippingThreshold: 3, 
    };
  },
// ... leave processCheckout exactly as it 
  processCheckout: async ({
    cartItems,
    shippingAddress,
    paymentMethod,
    user,
    onStepChange,
    onSuccess,
    onError,
  }) => {
    try {
      onStepChange("validating");

      const addressCheck = orderUtils.validateShippingAddress(shippingAddress);
      if (!addressCheck.isValid) throw new Error(addressCheck.message);

      const stockCheck = orderUtils.checkStockAvailability(cartItems);
      if (!stockCheck.available) {
        throw new Error(`Out of stock: ${stockCheck.items.join(", ")}`);
      }

      onStepChange("creating_order");

      const orderData = orderUtils.prepareOrderData(
        cartItems,
        shippingAddress,
        paymentMethod,
        user,
      );

      const dbOrder = await orderApi.createOrder(orderData);

      onStepChange("processing_payment");

      await razorpayService.initializePayment({
        dbOrderId: dbOrder._id,
        amount: orderData.totalPrice,
        user,
        onSuccess,
        onFailure: onError,
      });
    } catch (err) {
      console.error("Checkout error:", err);
      onError(err.message || "Checkout failed");
      onStepChange("failed");
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
    user,
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
      name: "Manavaatti Store",
      description: `Order #${dbOrderId}`,
      order_id: order.id,

      method: {
        upi: true,
        card: true,
        wallet: true,
        netbanking: true,
      },

      // Cleanup ONLY happens if the user completely closes the modal window
      modal: {
        ondismiss: async function () {
          try {
            console.log('User completely closed payment modal. Deleting unpaid order...');
            await orderApi.deleteOrder(dbOrderId);
            onFailure('Payment cancelled by user');
          } catch (err) {
            console.error('Failed to clean up cancelled order:', err);
            onFailure('Payment cancelled');
          }
        }
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
          await orderApi.deleteOrder(dbOrderId).catch(console.error);
          onFailure("Payment verification failed. Order removed.");
        }
      },

      prefill: {
        name: user?.name,
        email: user?.email,
        contact: user?.phone,
      },
    });

    // THE FIX: Do NOT delete the order here! Just log it.
    // Razorpay keeps the modal open so the user can retry.
    rzp.on('payment.failed', function (response) {
      console.log('Payment attempt failed. Waiting for user to retry...', response.error.description);
      // We purposefully do not call onFailure() here because that would stop the frontend loading spinner, 
      // even though the Razorpay modal is still open for a retry.
    });

    rzp.open();
  },

  loadRazorpayScript: () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve();
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
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
