import React, { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [isInCart, setIsInCart] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load product details
  useEffect(() => {
    const loadProductDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://fakestoreapi.com/products/${id}`);
        const productData = await response.json();
        setProduct(productData);
      } catch (error) {
        console.error("Failed to load product:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadProductDetails();
  }, [id]);

  // Check if product is in cart
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    const productId = parseInt(id);
    setIsInCart(savedCart.includes(productId));
  }, [id]);

  const toggleCartItem = () => {
    const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
    const productId = parseInt(id);
    let updatedCart;

    if (isInCart) {
      // Remove from cart
      updatedCart = currentCart.filter((itemId) => itemId !== productId);
    } else {
      // Add to cart
      updatedCart = [...currentCart, productId];
    }

    localStorage.setItem("cart", JSON.stringify(updatedCart));
    setIsInCart(!isInCart);
    
    // Notify cart counter to update
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const renderStarRating = () => {
    if (!product?.rating?.rate) return null;
    
    return Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        xmlns="http://www.w3.org/2000/svg"
        fill={i < Math.round(product.rating.rate) ? "#f97316" : "lightgray"}
        viewBox="0 0 24 24"
        stroke="none"
        className="w-5 h-5"
      >
        <path d="M12 .587l3.668 7.431 8.2 1.179-5.934 5.782 1.402 8.181L12 18.896l-7.336 3.864 1.402-8.181L.132 9.197l8.2-1.179z" />
      </svg>
    ));
  };

  if (isLoading) {
    return <div className="p-10 text-center">Loading product details...</div>;
  }

  if (!product) {
    return <div className="p-10 text-center">Product not found</div>;
  }

  return (
    <div className="max-w-5xl mx-auto mt-10 bg-white p-8 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Product Image Section */}
        <div className="flex justify-center items-start">
          <img
            src={product.image}
            alt={product.title}
            className="max-h-[500px] max-w-[50vw] object-contain rounded-lg"
          />
        </div>

        {/* Product Information Section */}
        <div className="flex flex-col">
          
          {/* Product Title */}
          <h1 className="text-3xl font-bold mb-3 text-gray-800">
            {product.title}
          </h1>

          {/* Category Badge */}
          <span className="text-xs text-gray-400 uppercase font-medium bg-gray-100 px-3 py-1 rounded-full mb-4 w-fit">
            {product.category}
          </span>

          {/* Rating Section */}
          {product.rating && (
            <div className="flex items-center mb-6">
              <div className="flex">
                {renderStarRating()}
              </div>
              <span className="ml-3 text-sm text-gray-600">
                {product.rating.rate} out of 5 ({product.rating.count} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="mb-6">
            <span className="text-4xl font-bold text-orange-500">
              ${product.price}
            </span>
          </div>

          {/* Product Description */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={toggleCartItem}
            className={`w-full py-4 px-6 rounded-full font-semibold text-lg transition-all duration-200 ${
              isInCart 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {isInCart ? 'Remove from Cart' : 'Add to Cart'}
          </button>

        </div>
      </div>
    </div>
  );
};

export default ProductDetails;