import { useState, useEffect, useRef } from "react";

const backendUrl = import.meta.env.VITE_BACKEND_URL;


export default function CheckoutCardForm({ totalPrice, address, products, setResetTrigger }) {
  const [checkoutInstance, setCheckoutInstance] = useState(null);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [previousTotal, setPreviousTotal] = useState(totalPrice);
  const flowContainerRef = useRef(null);
  const hasInitialised = useRef(false);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains("dark"));

  //reinitialises checkout 
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const newDarkMode = document.documentElement.classList.contains("dark");
      if (newDarkMode !== isDarkMode) {
        setIsDarkMode(newDarkMode);
        resetCheckout(); 
      }
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, [isDarkMode]);

  // dark mode for the checkout form
  const appearance = {
    colorAction: "#2F6AF7",
    colorBackground: isDarkMode ? "#0A0A0C" : "#FFFFFF",
    colorBorder: isDarkMode ? "#68686C" : "#DDDDDD",
    colorFormBackground: isDarkMode ? "#1F1F1F" : "#FFFFFF",
    colorFormBorder: isDarkMode ? "#1F1F1F" : "#DDDDDD",
    colorInverse: isDarkMode ? "#F9F9FB" : "#000000",
  };

  // Handle cart updates & reset checkout
  useEffect(() => {
    if (totalPrice === 0 || products.length === 0) {
      resetCheckout();
      return;
    }

    if (checkoutVisible && totalPrice !== previousTotal) {
      resetCheckout();
    }

    setPreviousTotal(totalPrice);
  }, [totalPrice, products]);

  
  useEffect(() => {
    if (checkoutVisible && !checkoutInstance) {
      initialiseCheckout();
    }
  }, [checkoutVisible, isDarkMode]); 

  //  Start Checkout when button is clicked
  const startCheckout = async () => {
    setCheckoutVisible(true);
  };

  // Initialise Checkout
  const initialiseCheckout = async () => {
    try {
      const paymentSession = await fetchPaymentSession(totalPrice);
      if (!paymentSession) return;

      const checkout = await createCheckoutInstance(paymentSession);
      if (!checkout) return;

      if (flowContainerRef.current && checkout) {
        mountCheckout(checkout);
      }

      hasInitialised.current = true;
    } catch (error) {
      console.error(" Checkout initialisation failed:", error);
    }
  };

  // 🌍 Fetch payment session from backend
  const fetchPaymentSession = async (amount) => {
    try {
      const response = await fetch(`${backendUrl}/api/create-payment-session`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount * 100,
          currency: "GBP",
          address,
          items: products.filter((p) => p.units > 0).map((p) => ({
            name: p.name,
            units: p.units,
            price: p.price,
          })),
        }),
      });

      const paymentSession = await response.json();
      return response.ok ? paymentSession : null;
    } catch (error) {
      console.error(" Failed to fetch payment session:", error);
      return null;
    }
  };

  // 🔧 Create Checkout instance
  const createCheckoutInstance = async (paymentSession) => {
    try {
      if (!window.CheckoutWebComponents) {
        await new Promise((resolve) => {
          const checkScript = setInterval(() => {
            if (window.CheckoutWebComponents) {
              clearInterval(checkScript);
              resolve();
            }
          }, 100);
        });
      }

      return await window.CheckoutWebComponents({
        publicKey: "pk_sbox_dwuoyq5tj2pxyvl6dyimp5ffxib",
        environment: "sandbox",
        appearance, 
        locale: "en-GB",
        paymentSession,
        onReady: () => console.log("Checkout is ready"),
        onPaymentCompleted: (_component, paymentResponse) => {
          fetch(`${backendUrl}/api/get-order-ref?payment_id=${paymentResponse.id}`)
            .then((response) => response.json())
            .then((data) => {
              if (data.order_ref) {
                window.location.href = `/checkout-success?order_ref=${data.order_ref}`;
              }
            })
            .catch(() => {
              window.location.href = "/checkout-failure";
            });

          hasInitialised.current = false;
          setCheckoutVisible(false);
          setResetTrigger((prev) => !prev);
        },
      });
    } catch (error) {
      console.error(" Error creating checkout instance:", error);
      return null;
    }
  };

  // Mount the Checkout UI
  const mountCheckout = (checkout) => {
    const flowComponent = checkout.create("flow");
    if (flowContainerRef.current) {
      flowComponent.mount(flowContainerRef.current);
      setCheckoutInstance(checkout);
    }
  };

  // Reset Checkout when cart updates
  const resetCheckout = () => {
    if (checkoutInstance && typeof checkoutInstance.unmount === "function") {
      checkoutInstance.unmount();
    }
    setCheckoutInstance(null);
    setCheckoutVisible(false);
    hasInitialised.current = false;
  };

  return (
    <>
      <div className="checkout-container">
        {!checkoutVisible ? (
          <button
            className={`checkout-btn border border-gray-400 dark:border-gray-600 ${totalPrice === 0 ? "disabled" : ""}`}
            onClick={startCheckout}
            disabled={totalPrice === 0}
          >
            To Proceed to Checkout (Flow Displayed Here)
          </button>
        ) : (
          <div
            ref={flowContainerRef}
            id="flow-container"
            className="flow-container"
            style={{ width: "100%", height: "400px" }}
          />
        )}
      </div>

      <style jsx>{`
      .checkout-container {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        text-align: center;
        background-color: white;
        color: black;
      }

      [data-theme="dark"] .checkout-container {
        background-color: #0A0A0C;
        color: #F9F9FB;
      }

      .checkout-btn {
        padding: 15px 25px;
        background-color: #0070f3;
        color: white;
        font-size: 16px;
        border: 1px solid #666; 
        cursor: pointer;
        border-radius: 5px;
        transition: background 0.3s, border 0.3s;
      }

      .checkout-btn:hover {
        border-color: #333; /
      }

      .disabled {
        background-color: #ccc;
        border-color: #999;
        cursor: not-allowed;
      }

      [data-theme="dark"] .checkout-btn {
        background-color: #5E48FC;
        border: 1px solid #888; /
      }

      [data-theme="dark"] .checkout-btn:hover {
        border-color: #BBB;
      }
`}</style>

    </>
  );
}
