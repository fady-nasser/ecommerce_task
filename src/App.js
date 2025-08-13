import React, { useState, useEffect } from 'react';
import './App.css';
import Card from './ProductCard.jsx';
import { Routes, Route } from 'react-router-dom';
import ProductDetails from './ProductDetails';

// Keep track of available categories
let availableCategories = [];

const ProductGrid = ({ searchTerm, price }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState("explore");
  const [cartCount, setCartCount] = useState(0);

  // Fetch products on component mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch("https://fakestoreapi.com/products");
        const productData = await response.json();
        setProducts(productData);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to load products:", error);
        setIsLoading(false);
      }
    };
    
    loadProducts();
  }, []);

  // Update cart count whenever component renders
  useEffect(() => {
    const updateCartCount = () => {
      const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
      setCartCount(cartItems.length - 1);
    };

    updateCartCount();
    
    // Listen for storage changes (when items are added/removed from cart)
    window.addEventListener('storage', updateCartCount);
    
    // Also listen for custom cart update events
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, [products]);

  // Filter products based on search and price
  const searchQuery = searchTerm ? searchTerm.toLowerCase().trim() : "";
  let displayProducts = products.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery) ||
                         item.description.toLowerCase().includes(searchQuery) ||
                         item.category.toLowerCase().includes(searchQuery);
    const matchesPrice = item.price <= price;
    
    return matchesSearch && matchesPrice;
  });

  if (isLoading) return <div className="p-10 text-center">Loading products...</div>;

  // Store unique categories for filter buttons
  availableCategories = [...new Set(products.map(product => product.category))];

  // Show cart items if in cart view
  if (currentView === "cart") {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    displayProducts = displayProducts.filter(product => cartItems.includes(product.id));
  }

  return (
    <>
      {/* View toggle buttons */}
      <div className="cards-header">
        <div className="view-toggle z-[100] flex mt-5 px-5 py-2 bg-gray-100 rounded-full shadow absolute z-10 w-[90px] justify-between items-center right-2">
          <button
            onClick={() => setCurrentView("explore")}
            className={currentView === "explore" ? "text-orange-400" : "text-gray-400"}
          >
            <i className="fa-solid fa-compass cursor-pointer"></i>
          </button>
          <button
            onClick={() => setCurrentView("cart")}
            className={`relative ${currentView === "cart" ? "text-orange-400" : "text-gray-400"}`}
          >
            <i className="fa-solid fa-cart-shopping cursor-pointer"></i>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-400 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Product grid */}
      <div className="cards grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 w-full p-10 rounded-t-[50px] border-t-8 border-orange-400 bg-gradient-to-b from-gray-100 to-white">
        {displayProducts.length > 0 ? (
          displayProducts.map(product => {
            const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
            
            return (
              <Card
                key={product.id}
                id={product.id}
                title={product.title}
                rating={product.rating}
                description={product.description}
                price={product.price}
                category={product.category}
                productImage={product.image}
              />
            );
          })
        ) : (
          <div className="col-span-full text-center text-gray-500">
            No products found.
          </div>
        )}
      </div>
    </>
  );
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [price, setPrice] = useState(parseInt(Number.MAX_SAFE_INTEGER/1000000000));
  const [showFilters, setShowFilters] = useState(false);

  const openFilters = () => {
    setShowFilters(true);
  };

  const selectCategory = (categoryName) => {
    setSearchTerm(categoryName);
    setShowFilters(true);
  };

  const updatePriceFilter = (event) => {
    setPrice(Number(event.target.value));
  };

  // Close filters when clicking outside the search area
  const handleOutsideClick = (event) => {
    if (!event.target.closest('.search-section')) {
      setShowFilters(false);
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      <Routes>
        <Route path="/" element={
          <>
            {/* Header with search */}
            <div className="nav-bar fixed top-0 left-0 right-0 h-fit py-4 bg-transparent z-20 w-full flex flex-col items-center justify-center">
              <div className="search-section w-full max-w-4xl px-4">
                
                {/* Main search bar */}
                <div className="search-bar-container flex items-center justify-center w-full bg-gray-50 rounded-full p-2 border-2 border-gray-200 focus-within:border-orange-400 focus-within:border-4">
                  <div className="search flex-1 mx-4">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onFocus={openFilters}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-3 rounded-full bg-transparent border-none outline-none text-gray-800"
                    />
                  </div>
                </div>

                {/* Filter panel */}
                <div 
                  className={`filters transition-all duration-300 bg-white shadow-lg mt-2 p-6 rounded-2xl w-full ${
                    showFilters 
                      ? 'opacity-100 max-h-96 visible' 
                      : 'opacity-0 max-h-0 invisible overflow-hidden'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  
                  {/* Category buttons */}
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold mb-3 text-gray-700">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {availableCategories.map((category, idx) => (
                        <button 
                          key={idx}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                            searchTerm === category
                              ? 'bg-orange-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-600'
                          }`}
                          onClick={() => selectCategory(category)}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Price slider */}
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold text-gray-700">
                      Price:
                    </label>
                    <div className="flex-1 relative">
                      <input 
                        type="range"
                        min="0"
                        max="1000"
                        step="10"
                        value={price}
                        onChange={updatePriceFilter}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                    </div>
                    <span className="text-sm font-medium min-w-[60px] text-gray-700">
                      ${price}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Space for fixed header */}
            <div className="h-24"></div>

            {/* Main content */}
            <ProductGrid searchTerm={searchTerm} price={price} />
          </>
        } />
        <Route path="/product/:id" element={<ProductDetails />} />
      </Routes>
    </div>
  );
};

export default App;