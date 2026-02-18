import axios from 'axios';

const placeOrderHandler = async () => {
    try {
        // 1. Save Order to Database first (Status: Not Paid)
        // This ensures we have an Order ID to track even if payment fails
        const { data: dbOrder } = await axios.post('/api/orders', {
            orderItems: cart.items,
            shippingAddress: cart.shippingAddress,
            paymentMethod: 'Razorpay',
            itemsPrice: cart.itemsPrice,
            taxPrice: cart.taxPrice,
            shippingPrice: cart.shippingPrice,
            totalPrice: cart.totalPrice,
        }, config); // config contains Bearer token

        // 2. Get Razorpay Key
        const { data: { key } } = await axios.get('/api/payment/key');

        // 3. Create Razorpay Order (Backend call)
        const { data: { order: rzpOrder } } = await axios.post('/api/payment/checkout', {
            amount: cart.totalPrice 
        }, config);

        // 4. Configure Options for the Pop-up
        const options = {
            key: key, 
            amount: rzpOrder.amount,
            currency: "INR",
            name: "Nighty Store",
            description: "Transaction for Order #" + dbOrder._id,
            image: "https://your-logo-url.com/logo.png",
            order_id: rzpOrder.id, // This is the ID we just got from backend
            
            // 5. The Handler: What happens when user pays successfully
            handler: async function (response) {
                try {
                    const verifyData = {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        orderId: dbOrder._id // Pass the DB ID so we can update it
                    };

                    const { data } = await axios.post('/api/payment/verification', verifyData, config);

                    if (data.success) {
                        alert("Payment Successful! Order Placed.");
                        navigate(`/order/${dbOrder._id}`);
                    }
                } catch (error) {
                    alert("Payment Verification Failed");
                }
            },
            prefill: {
                name: user.name,
                email: user.email,
                contact: user.phone
            },
            notes: {
                address: "Razorpay Corporate Office"
            },
            theme: {
                color: "#121212"
            }
        };

        // 6. Open the Razorpay Widget
        const rzp1 = new window.Razorpay(options);
        rzp1.open();

    } catch (error) {
        console.error(error);
        alert("Something went wrong processing the order.");
    }
};