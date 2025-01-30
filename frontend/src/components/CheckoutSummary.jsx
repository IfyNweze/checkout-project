const CheckoutSummary = ({ products, formatPrice }) => {
    const totalPrice = products.reduce(
      (sum, product) => sum + product.price * product.units,
      0
    );
  
    return (
      <div>
        <h2 className="text-xl font-bold mb-4  dark:text-white">Checkout Summary</h2>
        <ul className="mb-4 dark:text-white">
          {products
            .filter((product) => product.units > 0)
            .map((product) => (
              <li
                key={product.id}
                className="flex justify-between border-b py-2"
              >
                <span>
                  {product.name} x {product.units}
                </span>
                <span>{formatPrice(product.price * product.units)}</span>
              </li>
            ))}
        </ul>
        <div className="font-bold text-lg  dark:text-white">Total: {formatPrice(totalPrice)}</div>
      </div>
    );
  };
  
  export default CheckoutSummary;
  