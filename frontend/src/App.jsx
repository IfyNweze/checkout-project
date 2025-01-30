import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import Navbar from "./components/Navbar";
import AddressForm from "./components/AddressForm";
import ProductCards from "./components/ProductCards";
import CheckoutSummary from "./components/CheckoutSummary";
import CheckoutCardForm from "./components/CheckoutCardForm";
import CheckoutSuccess from "./components/CheckoutSuccess";
import CheckoutFailure from "./components/CheckoutFailure"
import RecentPayments from "./components/RecentPayments";

const CheckoutPage = () => {
  const [products, setProducts] = useState([
    { id: 1, name: "Present A", price: 10, units: 0, image: "/Present_A.jpg" },
    { id: 2, name: "Present B", price: 20, units: 0, image: "/Present_B.jpg" },
    // { id: 3, name: "Present C", price: 30, units: 0, image: "/Present_C.jpg" },
    // { id: 4, name: "Present D", price: 40, units: 0, image: "/Present_D.jpg" },
  ]);

  const [address, setAddress] = useState({});

  const [resetTrigger, setResetTrigger] = useState(false);

  const currency = "GBP";
  const formatPrice = (price) => new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(price);

  const totalPrice = products.reduce((sum, product) => sum + product.price * product.units, 0);

  return (
    <div className="min-h-screen dark:bg-black">
      <div className="max-w-[90%] mx-auto p-6 rounded-3xl mt-6  dark:bg-black">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6  dark:bg-black">
          <div className="bg-white p-4 rounded-lg border-4 border-[#2F6AF7]  dark:bg-black">
            <div className="">
              <ProductCards products={products} setProducts={setProducts} formatPrice={formatPrice} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg border-4 border-[#2F6AF7]  dark:bg-black">
            <AddressForm setAddress={setAddress} resetTrigger={resetTrigger} />
          </div>
          <div className="bg-white p-4 rounded-lg min-h-[550px] border-4 border-[#2F6AF7]  dark:bg-black">
            <CheckoutSummary products={products} formatPrice={formatPrice} />
          </div>
          <div className="bg-white p-4 flex flex-col rounded-lg min-h-[650px] border-4 border-[#2F6AF7]  dark:bg-black h-full">
            <CheckoutCardForm 
              totalPrice={totalPrice} 
              address={address} 
              products={products} 
              setResetTrigger={setResetTrigger} 
              formatPrice={formatPrice} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const location = useLocation();

  const getNavbarLinks = () => {
    if (location.pathname === "/recent-payments") {
      return [{ path: "/", label: "Home" }];
    } else if (location.pathname === "/checkout-success" || location.pathname === "/checkout-failure") {
      return [
        { path: "/", label: "Home" },
        { path: "/recent-payments", label: "💰 Recent Payments" },
      ];
    } else {
      return [{ path: "/recent-payments", label: "💰 Recent Payments" }];
    }
  };
  
  return (
    <div className="min-h-screen">
      <Navbar links={getNavbarLinks()} />

      <Routes>
        <Route path="/" element={<CheckoutPage />} />
        <Route path="/checkout-success" element={<CheckoutSuccess />} />
        <Route path="/checkout-failure" element={<CheckoutFailure />} />
        <Route path="/recent-payments" element={<RecentPayments />} />
      </Routes>
    </div>
  );
};

const RootApp = () => (
  <Router>
    <App />
  </Router>
);

export default RootApp;
