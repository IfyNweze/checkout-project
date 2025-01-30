import { useSearchParams, Link } from "react-router-dom";

const CheckoutSuccess = () => {
  const [searchParams] = useSearchParams();
  const orderRef = searchParams.get("order_ref") || "N/A";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-100 p-6">
      <h1 className="text-2xl font-bold text-green-700"> Payment Successful! </h1>
      <p className="text-lg">Your order reference: <strong>{orderRef}</strong></p>
      <Link to="/" className="mt-4 px-4 py-2 bg-green-700 text-black rounded inline-block">
        Order some more! 
      </Link>
    </div>
  );
};

export default CheckoutSuccess;
