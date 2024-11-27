"use client";

export default function PaymentButton() {
  const handlePayment = () => {
    // Redirect to PayPal.me link
    window.open('https://paypal.me/mrbuddhu1', '_blank');
  };

  return (
    <button
      onClick={handlePayment}
      className="fixed bottom-4 right-4 bg-blue-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
    >
      Support This Project
    </button>
  );
}
