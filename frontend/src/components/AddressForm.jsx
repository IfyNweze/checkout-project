import { useState } from "react";

export default function AddressForm({ setAddress, resetTrigger }) {
  const initialAddressState = {
    fullName: "",
    street: "",
    city: "",
    postcode: "",
    country: "UK",
    phone: "",
    email: "",
  };

  const [address, setLocalAddress] = useState(initialAddressState);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalAddress((prev) => ({ ...prev, [name]: value }));
    setAddress((prev) => ({ ...prev, [name]: value })); // Update in parent component
  };

  // Reset the form when `resetTrigger` changes (i.e., after successful payment)
  useState(() => {
    setLocalAddress(initialAddressState);
  }, [resetTrigger]);

  return (
    <div className="p-4 bg-white rounded-md">
      <h2 className="text-lg font-semibold mb-4">Shipping Address</h2>
      <div className="space-y-3">
        <input type="text" name="fullName" placeholder="Full Name" value={address.fullName} onChange={handleChange} className="w-full border rounded p-2" />
        <input type="text" name="street" placeholder="Street Address" value={address.street} onChange={handleChange} className="w-full border rounded p-2" />
        <input type="text" name="city" placeholder="City" value={address.city} onChange={handleChange} className="w-full border rounded p-2" />
        <input type="text" name="postcode" placeholder="Postcode" value={address.postcode} onChange={handleChange} className="w-full border rounded p-2" />
        <select name="country" value={address.country} onChange={handleChange} className="w-full border rounded p-2">
          <option value="UK">United Kingdom</option>
          <option value="US">United States</option>
        </select>
        <input type="text" name="phone" placeholder="Phone Number" value={address.phone} onChange={handleChange} className="w-full border rounded p-2" />
        <input type="email" name="email" placeholder="Email Address" value={address.email} onChange={handleChange} className="w-full border rounded p-2" />
      </div>
    </div>
  );
}
