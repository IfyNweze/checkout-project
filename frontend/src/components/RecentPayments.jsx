import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const RecentPayments = () => {
  const [payments, setPayments] = useState([]);
  const [selectedColumn, setSelectedColumn] = useState("status");

  const columns = [
    "event_id", 
    "event_type", 
    "amount", 
    "currency", 
    "email",
    "processed_on", 
    "response_code", 
    "response_summary", 
    "status"
  ];

  // Fetching payments every 5 seconds
  useEffect(() => {
    const fetchPayments = () => {
      fetch("https://checkout-project-production.up.railway.app/api/recent-payments") 
        .then(response => {
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          return response.json();
        })
        .then(data => {
          console.log(" Received Payments:", data);
          if (data.payments && Array.isArray(data.payments)) {
            setPayments(data.payments);
          } else {
            console.error(" API did not return an array");
          }
        })
        .catch(error => console.error(" Fetch error:", error));
    };

    fetchPayments();
    const interval = setInterval(fetchPayments, 5000); 

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
    
      <h2 className="text-2xl font-bold mb-4">Recent Payments</h2>

      {/* Display Table */}
      <div>
        <table className="min-w-full border-collapse border-4 border-[#2F6AF7]">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2 text-left">Payment ID</th>

              {/* Small & Medium Screens: Show Dropdown in the Header */}
              <th className="border p-2 text-left md:hidden">
                <select
                  className="w-full p-1 border rounded bg-white"
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                >
                  {columns.map(col => (
                    <option key={col} value={col}>{col.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </th>

              {/* Medium Screens: Event ID & Order Reference Visible */}
              <th className="border p-2 text-left hidden md:table-cell">Event ID</th>
              <th className="border p-2 text-left hidden md:table-cell">Order Reference</th>

              {/* Medium Screens: Dropdown for Selecting a Column */}
              <th className="border p-2 text-left hidden md:table-cell lg:hidden">
                <select
                  className="w-full p-1 border rounded bg-white"
                  value={selectedColumn}
                  onChange={(e) => setSelectedColumn(e.target.value)}
                >
                  {columns.map(col => (
                    <option key={col} value={col}>{col.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </th>

              {/* Large Screens: Show All Columns */}
              <th className="border p-2 text-left hidden lg:table-cell">Event Type</th>
              <th className="border p-2 text-left hidden lg:table-cell">Amount</th>
              <th className="border p-2 text-left hidden lg:table-cell">Currency</th>
              <th className="border p-2 text-left hidden lg:table-cell">Email</th>
              <th className="border p-2 text-left hidden lg:table-cell">Processed On</th>
              <th className="border p-2 text-left hidden lg:table-cell">Response Code</th>
              <th className="border p-2 text-left hidden lg:table-cell">Response Summary</th>
              <th className="border p-2 text-left hidden lg:table-cell">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="10" className="border p-4 text-center text-gray-500">
                  No recent payments found.
                </td>
              </tr>
            ) : (
              payments.map(payment => (
                <tr key={payment.event_id} className="border">
                  <td className="border p-2">{payment.payment_id}</td>

                  {/* Small & Medium Screens: Display Selected Column Data */}
                  <td className="border p-2 md:hidden">{payment[selectedColumn] || "N/A"}</td>

                  {/* Medium Screens: Show Event ID & Order Reference */}
                  <td className="border p-2 hidden md:table-cell">{payment.event_id}</td>
                  <td className="border p-2 hidden md:table-cell">{payment.order_ref || "N/A"}</td>

                  {/* Medium Screens: Show Selected Column */}
                  <td className="border p-2 hidden md:table-cell lg:hidden">{payment[selectedColumn] || "N/A"}</td>

                  {/* Large Screens: Show All Columns */}
                  <td className="border p-2 hidden lg:table-cell">{payment.event_type || "N/A"}</td>
                  <td className="border p-2 hidden lg:table-cell">{payment.amount || "N/A"}</td>
                  <td className="border p-2 hidden lg:table-cell">{payment.currency || "N/A"}</td>
                  <td className="border p-2 hidden lg:table-cell">{payment.email || "N/A"}</td>
                  <td className="border p-2 hidden lg:table-cell">{payment.processed_on || "N/A"}</td>
                  <td className="border p-2 hidden lg:table-cell">{payment.response_code || "N/A"}</td>
                  <td className="border p-2 hidden lg:table-cell">{payment.response_summary || "N/A"}</td>
                  <td className="border p-2 hidden lg:table-cell">{payment.status || "N/A"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentPayments;
