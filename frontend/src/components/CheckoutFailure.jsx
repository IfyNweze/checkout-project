import { useSearchParams, Link } from "react-router-dom";

const CheckoutFailure = () => {
  const [searchParams] = useSearchParams();
  const orderRef = searchParams.get("order_ref") || "N/A";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 p-6">
      <h1 className="text-2xl font-bold text-red-700"> Payment Failed</h1>
      <p className="text-lg">Your order reference: <strong>{orderRef}</strong></p>
      <Link to="/" className="mt-4 px-4 py-2 bg-red-700 text-white rounded">
        Please contact your bank or try again
      </Link>
    </div>
  );
};

export default CheckoutFailure;
