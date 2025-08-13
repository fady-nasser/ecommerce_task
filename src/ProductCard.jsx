import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ id, title, rating, description, price, category, productImage }) => {
    const [isInCart, setIsInCart] = useState(false);
    const navigate = useNavigate();

    // Check if item is already in cart when component loads
    useEffect(() => {
        const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
        setIsInCart(savedCart.includes(id));
    }, [id]);

    const toggleCartItem = () => {
        const currentCart = JSON.parse(localStorage.getItem("cart")) || [];
        let newCart;
        
        if (isInCart) {
            // Remove item from cart
            newCart = currentCart.filter((itemId) => itemId !== id);
        } else {
            // Add item to cart
            newCart = [...currentCart, id];
        }
        
        localStorage.setItem("cart", JSON.stringify(newCart));
        setIsInCart(!isInCart);
        
        // Notify other components that cart changed
        window.dispatchEvent(new Event('cartUpdated'));
    };

    const goToProductDetails = () => {
        navigate(`/product/${id}`);
    };

    const renderStarRating = () => {
        return Array.from({ length: 5 }).map((_, i) => (
            <svg
                key={i}
                xmlns="http://www.w3.org/2000/svg"
                fill={i < Math.round(rating?.rate) ? "#f97316" : "lightgray"}
                viewBox="0 0 24 24"
                stroke="none"
                className="w-5 h-5"
            >
                <path d="M12 .587l3.668 7.431 8.2 1.179-5.934 5.782 1.402 8.181L12 18.896l-7.336 3.864 1.402-8.181L.132 9.197l8.2-1.179z" />
            </svg>
        ));
    };

    return (
        <div
            className="group card bg-white rounded-[25px] shadow-lg mb-8 border-4 border-transparent hover:border-orange-400 transition transform hover:-translate-y-2 hover:scale-105 hover:cursor-pointer"
            onClick={goToProductDetails}
        >
            <div className="card-content p-6 flex flex-col items-start gap-1 w-full h-full justify-between">
                
                {/* Product Image */}
                <div className="card-image flex items-center justify-center w-full mb-2">
                    <img
                        src={productImage}
                        alt={title}
                        className="object-cover rounded-t-lg max-h-24 transition-transform duration-500 group-hover:-translate-y-8 group-hover:scale-110"
                    />
                </div>

                {/* Category Tag */}
                <p className="card-category text-xs text-gray-400 uppercase font-medium bg-gray-100 px-2 py-1 rounded mb-1">
                    {category}
                </p>

                {/* Product Title */}
                <h2 className="card-title text-lg font-semibold text-gray-800 mb-2">
                    {title}
                </h2>

                {/* Rating Section */}
                <div className="flex items-center mb-4">
                    {renderStarRating()}
                    <span className="ml-2 text-sm text-gray-600">
                        {rating?.rate} ({rating?.count} reviews)
                    </span>
                </div>

                {/* Product Description */}
                <p className="card-desc w-full text-sm text-gray-600 mb-2 line-clamp-4">
                    {description}
                </p>

                {/* Price */}
                <p className="card-price text-lg font-bold text-orange-500 mb-3">
                    ${price}
                </p>

                {/* Add to Cart Button */}
                <button
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        toggleCartItem(); 
                    }}
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
    );
};

export default ProductCard;