import React, { useState, useRef, useEffect } from 'react';

const POSInspiredInventory = () => {
  const [currentTab, setCurrentTab] = useState('in'); // 'in', 'out', 'transfer'
  const [selectedLocation, setSelectedLocation] = useState('Location 1');
  const [targetLocation, setTargetLocation] = useState('Location 2');
  const [cartItems, setCartItems] = useState([]);
  const [barcode, setBarcode] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const barcodeInputRef = useRef(null);
  
  // Auto focus barcode input on load and tab change
  useEffect(() => {
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [currentTab]);
  
  // Sample product data
  const products = [
    { sku: 'SKU-1000', name: 'Brand 1 Standard Product 1', price: 50, stock: { 'Location 1': 20, 'Location 2': 30 } },
    { sku: 'SKU-1001', name: 'Brand 2 Premium Product 2', price: 125, stock: { 'Location 1': 98, 'Location 2': 0 } },
    { sku: 'SKU-1002', name: 'Brand 3 Standard Product 3', price: 75, stock: { 'Location 1': 20, 'Location 3': 15 } },
    { sku: 'SKU-1003', name: 'Brand 4 Premium Product 4', price: 200, stock: { 'Location 1': 32, 'Location 2': 10 } },
    { sku: 'SKU-1004', name: 'Brand 5 Standard Product 5', price: 40, stock: { 'Location 2': 48, 'Location 3': 5 } },
  ];
  
  // Search function
  const handleSearch = (query) => {
    setBarcode(query);
    
    if (query.length > 0) {
      const filtered = products.filter(
        product => 
          product.sku.toLowerCase().includes(query.toLowerCase()) || 
          product.name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearching(true);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };
  
  // Handle barcode scan/entry
  const handleBarcodeScan = (e) => {
    e.preventDefault();
    
    if (barcode.trim() === '') return;
    
    const product = products.find(
      item => item.sku.toLowerCase() === barcode.toLowerCase() || 
              item.name.toLowerCase() === barcode.toLowerCase()
    );
    
    if (product) {
      addToCart(product);
      setBarcode('');
      setIsSearching(false);
    } else {
      alert('Product not found!');
    }
    
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };
  
  // Add product to cart
  const addToCart = (product) => {
    const existingItem = cartItems.find(item => item.sku === product.sku);
    
    if (existingItem) {
      const updatedCart = cartItems.map(item => 
        item.sku === product.sku 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
      setCartItems(updatedCart);
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };
  
  // Remove item from cart
  const removeFromCart = (sku) => {
    setCartItems(cartItems.filter(item => item.sku !== sku));
  };
  
  // Update item quantity
  const updateQuantity = (sku, quantity) => {
    if (quantity < 1) return;
    
    const updatedCart = cartItems.map(item => 
      item.sku === sku ? { ...item, quantity } : item
    );
    setCartItems(updatedCart);
  };
  
  // Complete transaction
  const completeTransaction = () => {
    if (cartItems.length === 0) {
      alert('Please add items first!');
      return;
    }
    
    const transactionType = 
      currentTab === 'in' ? 'Barang Masuk' : 
      currentTab === 'out' ? 'Barang Keluar' : 'Transfer';
    
    const locationInfo = 
      currentTab === 'in' ? `to ${selectedLocation}` : 
      currentTab === 'out' ? `from ${selectedLocation}` : 
      `from ${selectedLocation} to ${targetLocation}`;
    
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    alert(`${transactionType} completed: ${totalItems} items ${locationInfo}`);
    setCartItems([]);
    
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Stock Management</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">Admin</span>
            <button className="text-gray-600 hover:text-gray-800">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Panel - Transaction Type and Location */}
            <div className="lg:w-1/3">
              <div className="bg-white shadow-sm rounded-lg p-4 mb-4">
                <h2 className="text-lg font-medium mb-4">Transaction Type</h2>
                <div className="flex mb-4">
                  <button 
                    onClick={() => setCurrentTab('in')}
                    className={`flex-1 py-3 px-4 text-center font-medium rounded-l-lg ${currentTab === 'in' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                  >
                    Barang Masuk
                  </button>
                  <button 
                    onClick={() => setCurrentTab('out')}
                    className={`flex-1 py-3 px-4 text-center font-medium ${currentTab === 'out' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                  >
                    Barang Keluar
                  </button>
                  <button 
                    onClick={() => setCurrentTab('transfer')}
                    className={`flex-1 py-3 px-4 text-center font-medium rounded-r-lg ${currentTab === 'transfer' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                  >
                    Transfer
                  </button>
                </div>
                
                <div className="space-y-4">
                  {(currentTab === 'out' || currentTab === 'transfer') && (
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Lokasi Asal</label>
                      <select 
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Location 1">Location 1</option>
                        <option value="Location 2">Location 2</option>
                        <option value="Location 3">Location 3</option>
                        <option value="Location 4">Location 4</option>
                      </select>
                    </div>
                  )}
                  
                  {(currentTab === 'in' || currentTab === 'transfer') && (
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">
                        {currentTab === 'in' ? 'Lokasi Tujuan' : 'Lokasi Tujuan'}
                      </label>
                      <select 
                        value={currentTab === 'in' ? selectedLocation : targetLocation}
                        onChange={(e) => currentTab === 'in' ? setSelectedLocation(e.target.value) : setTargetLocation(e.target.value)}
                        className="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Location 1">Location 1</option>
                        <option value="Location 2">Location 2</option>
                        <option value="Location 3">Location 3</option>
                        <option value="Location 4">Location 4</option>
                      </select>
                    </div>
                  )}
                  
                  {currentTab === 'out' && (
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Customer (Optional)</label>
                      <input 
                        type="text" 
                        className="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Customer name/ID"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-white shadow-sm rounded-lg p-4">
                <h2 className="text-lg font-medium mb-4">Product Lookup</h2>
                <form onSubmit={handleBarcodeScan} className="mb-4">
                  <div className="relative">
                    <input
                      ref={barcodeInputRef}
                      type="text"
                      value={barcode}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Scan barcode or search..."
                      className="block w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      autoFocus
                    />
                    <button 
                      type="submit"
                      className="absolute right-0 top-0 h-full px-3 bg-blue-500 text-white rounded-r-lg"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </form>
                
                {/* Search Results */}
                {isSearching && searchResults.length > 0 && (
                  <div className="border rounded-lg overflow-hidden">
                    <ul className="divide-y">
                      {searchResults.map((product) => (
                        <li key={product.sku} className="p-2 hover:bg-gray-50 cursor-pointer" onClick={() => {
                          addToCart(product);
                          setBarcode('');
                          setIsSearching(false);
                          if (barcodeInputRef.current) {
                            barcodeInputRef.current.focus();
                          }
                        }}>
                          <div className="flex justify-between">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.sku}</p>
                            </div>
                            <div className="text-sm text-gray-700">
                              Stock: {Object.values(product.stock).reduce((a, b) => a + b, 0)}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {isSearching && searchResults.length === 0 && (
                  <p className="text-gray-500 text-center py-2">No products found</p>
                )}
                
                <div className="mt-4 text-sm text-gray-500">
                  <p>Quick tip: Scan barcode or search by SKU/name</p>
                  <p className="mt-1">Try: SKU-1000, SKU-1001, etc.</p>
                </div>
              </div>
            </div>
            
            {/* Right Panel - Cart/Transaction List */}
            <div className="lg:w-2/3">
              <div className="bg-white shadow-sm rounded-lg p-4 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium">
                    {currentTab === 'in' ? 'Incoming Items' : 
                     currentTab === 'out' ? 'Outgoing Items' : 'Items to Transfer'}
                  </h2>
                  <div className="text-sm text-gray-500">
                    {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                  </div>
                </div>
                
                <div className="flex-grow overflow-auto">
                  {cartItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p>No items added yet</p>
                      <p className="text-sm mt-1">Scan products or search to add items</p>
                    </div>
                  ) : (
                    <div className="border rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {cartItems.map((item) => (
                            <tr key={item.sku}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                  <div className="text-sm text-gray-500">{item.sku}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center space-x-2">
                                  <button 
                                    onClick={() => updateQuantity(item.sku, item.quantity - 1)}
                                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                                  >
                                    -
                                  </button>
                                  <input 
                                    type="number" 
                                    min="1" 
                                    value={item.quantity} 
                                    onChange={(e) => updateQuantity(item.sku, parseInt(e.target.value) || 1)}
                                    className="w-16 text-center border border-gray-300 rounded py-1 px-2"
                                  />
                                  <button 
                                    onClick={() => updateQuantity(item.sku, item.quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button 
                                  onClick={() => removeFromCart(item.sku)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                <div className="border-t mt-6 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="font-medium">Total Items: <span className="text-lg">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span></p>
                    </div>
                    <div className="space-x-2">
                      <button 
                        onClick={() => setCartItems([])}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
                        disabled={cartItems.length === 0}
                      >
                        Clear All
                      </button>
                      <button 
                        onClick={completeTransaction}
                        className={`px-6 py-2 rounded-lg text-white font-medium ${
                          currentTab === 'in' ? 'bg-green-500 hover:bg-green-600' : 
                          currentTab === 'out' ? 'bg-red-500 hover:bg-red-600' : 
                          'bg-blue-500 hover:bg-blue-600'
                        }`}
                        disabled={cartItems.length === 0}
                      >
                        {currentTab === 'in' ? 'Complete Receive' : 
                         currentTab === 'out' ? 'Complete Dispatch' : 
                         'Complete Transfer'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default POSInspiredInventory;