const ProductCards = ({ products, setProducts, formatPrice }) => {
  const updateQuantity = (id, increment) => {
    setProducts((prevProducts) =>
      prevProducts.map((product) =>
        product.id === id
          ? { ...product, units: Math.max(0, product.units + increment) }
          : product
      )
    );
  };

  return (
    <div className=" gap-1 auto-rows-fr">
      {products.map((product) => (
        <div key={product.id} className="bg-white p-4 rounded  flex flex-col">
          <img
            src={product.image}
            alt={product.name}
            className="w-48 h-48 object-cover mb-2"
          />
          <h3 className="text-lg font-bold">{product.name}</h3>
          <p className="text-gray-600">{formatPrice(product.price)}</p>
          <div className="flex items-center justify-between mt-auto">
            <button
              onClick={() => updateQuantity(product.id, -1)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              -
            </button>
            <span>{product.units}</span>
            <button
              onClick={() => updateQuantity(product.id, 1)}
              className="bg-green-500 text-white px-2 py-1 rounded"
            >
              +
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductCards;
