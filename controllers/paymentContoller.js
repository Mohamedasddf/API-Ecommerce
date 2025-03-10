require('dotenv').config(); // تحميل إعدادات البيئة من ملف .env
const paypal = require('paypal-rest-sdk');
const { sendMail } = require("../config/sendMaile");
const Order = require("../models/order");

// دالة لإنشاء الدفع
const createPayment = async (req, res) => {
  const { orderId } = req.params;
  
  try {
    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      return res.status(404).send('Order not found');
    }

    const totalAmount = order.totalAmount;

    const paymentJson = {
      intent: 'sale',
      payer: {
        payment_method: 'paypal',
      },
      redirect_urls: {
        return_url: `http://localhost:3000/api/payment/execute-payment?orderId=${orderId}`,
        cancel_url: 'http://localhost:3000/api/payment/cancel',
      },
      transactions: [{
        amount: {
          total: totalAmount.toFixed(2),
          currency: 'USD',
        },
        description: 'Payment for order',
      }],
    };

    paypal.payment.create(paymentJson, function (error, payment) {
      if (error) {
        console.log(error);
        return res.status(500).send('Error creating payment');
      } else {
        for (let i = 0; i < payment.links.length; i++) {
          if (payment.links[i].rel === 'approval_url') {
            return res.json({ paymentUrl: payment.links[i].href });
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching order amount:', error);
    return res.status(500).send('Error fetching order amount');
  }
};

// دالة لتنفيذ الدفع بعد العودة من PayPal
const executePayment = async (req, res) => {
  const { paymentId, PayerID, orderId } = req.query;

  const payerId = { payer_id: PayerID };

  paypal.payment.execute(paymentId, payerId, async function (error, payment) {
    if (error) {
      console.log(error);
      return res.status(500).send('Error executing payment');
    } else {
      console.log('Payment success:', payment);

      try {
        // تحديث حالة الطلب في قاعدة البيانات
        const order = await Order.findById(orderId);
        order.status = 'completed';
        await order.save();

        // إرسال رسالة تأكيد عبر البريد الإلكتروني للمستخدم
        await sendMail({
          email: order.user.email,
          subject: 'Payment Success',
          html: `<h1>Payment Successful</h1><p>Your payment for order ${orderId} has been successfully processed.</p>`,
        });

        return res.send('Payment successful!');
      } catch (err) {
        console.log('Error updating order status:', err);
        return res.status(500).send('Error updating order status');
      }
    }
  });
};

// دالة لإلغاء الدفع
const cancelPayment = (req, res) => {
  res.send('Payment cancelled');
};




module.exports = { cancelPayment, executePayment, createPayment };
