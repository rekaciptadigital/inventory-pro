'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useInventory } from '@/lib/hooks/inventory/use-inventory';
import { InventoryProduct } from '@/types/inventory';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { CheckCircle, FileText } from 'lucide-react';

// Define the transfer status type
type TransferStatus = 'draft' | 'pending' | 'in_transit' | 'completed';

export function StockTransactionForm() {
  const { toast } = useToast();
  const { products, isLoading } = useInventory();
  
  // Transaction state
  const [currentTab, setCurrentTab] = useState('in'); // 'in', 'out', 'transfer'
  const [selectedLocation, setSelectedLocation] = useState('Location 1');
  const [targetLocation, setTargetLocation] = useState('Location 2');
  const [cartItems, setCartItems] = useState<Array<{product: InventoryProduct, quantity: number}>>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<InventoryProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [customer, setCustomer] = useState('');
  
  // New state variables for enhanced features
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showSuratJalanPreview, setShowSuratJalanPreview] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [transferStatus, setTransferStatus] = useState<TransferStatus>('draft');
  const [senderSignature, setSenderSignature] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  // Generate invoice number for outbound transactions
  useEffect(() => {
    if (currentTab === 'out') {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setInvoiceNumber(`INV-${year}${month}${day}-${random}`);
    }
  }, [currentTab]);
  
  // Auto focus search input on load and tab change
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [currentTab]);
  
  // Search function
  const handleSearch = (query: string) => {
    setSearchTerm(query);
    
    if (query.length > 0) {
      const filtered = products.filter(
        product => 
          product.sku.toLowerCase().includes(query.toLowerCase()) || 
          product.product_name.toLowerCase().includes(query.toLowerCase()) ||
          product.full_product_name.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setIsSearching(true);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  };
  
  // Handle search submit (similar to barcode scan)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (searchTerm.trim() === '') return;
    
    const product = products.find(
      item => item.sku.toLowerCase() === searchTerm.toLowerCase() || 
              item.product_name.toLowerCase() === searchTerm.toLowerCase() ||
              item.full_product_name.toLowerCase() === searchTerm.toLowerCase()
    );
    
    if (product) {
      addToCart(product);
      setSearchTerm('');
      setIsSearching(false);
    } else {
      toast({
        variant: 'destructive',
        title: 'Product not found',
        description: 'Please try a different search term or scan another barcode'
      });
    }
    
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  // Add product to cart
  const addToCart = (product: InventoryProduct) => {
    const existingItem = cartItems.find(item => item.product.id === product.id);
    
    if (existingItem) {
      const updatedCart = cartItems.map(item => 
        item.product.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
      setCartItems(updatedCart);
    } else {
      setCartItems([...cartItems, { product, quantity: 1 }]);
    }

    toast({
      title: 'Product added',
      description: `${product.full_product_name} added to transaction`
    });
  };
  
  // Remove item from cart
  const removeFromCart = (productId: number | string) => {
    setCartItems(cartItems.filter(item => item.product.id !== productId));
  };
  
  // Update item quantity
  const updateQuantity = (productId: number | string, quantity: number) => {
    if (quantity < 1) return;
    
    const updatedCart = cartItems.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    );
    setCartItems(updatedCart);
  };
  
  // Complete transaction
  const completeTransaction = () => {
    if (cartItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No items added',
        description: 'Please add items to the transaction'
      });
      return;
    }
    
    if (currentTab === 'transfer') {
      initiateTransfer();
      return;
    }
    
    // Extract nested ternary into a helper function
    const getTransactionType = () => {
      if (currentTab === 'in') {
        return 'Barang Masuk';
      } else if (currentTab === 'out') {
        return 'Barang Keluar';
      } else {
        return 'Transfer';
      }
    };
    
    const transactionType = getTransactionType();
    
    // Extract the nested ternary into a helper function
    const getLocationInfo = () => {
      if (currentTab === 'in') {
        return `to ${selectedLocation}`;
      } else if (currentTab === 'out') {
        return `from ${selectedLocation}`;
      } else {
        return `from ${selectedLocation} to ${targetLocation}`;
      }
    };
    
    const locationInfo = getLocationInfo();
    
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Here you would typically save the transaction to your backend
    const customerInfo = currentTab === 'out' && customer ? ` for customer: ${customer}` : '';
    const invoiceInfo = currentTab === 'out' ? ` (Invoice: ${invoiceNumber})` : '';
    
    toast({
      title: 'Transaction completed',
      description: `${transactionType}: ${totalItems} items ${locationInfo}${customerInfo}${invoiceInfo}`
    });
    
    // Reset the form
    setCartItems([]);
    setCustomer('');
    setNotes('');
    
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Helper function: Get current date formatted
  const getCurrentDate = () => {
    return format(new Date(), 'PPP');
  };
  
  // Extract the nested ternary into a helper function for the heading
  const getTransactionItemsHeading = () => {
    if (currentTab === 'in') {
      return 'Incoming Items';
    } else if (currentTab === 'out') {
      return 'Outgoing Items';
    } else {
      return 'Items to Transfer';
    }
  };

  // Helper function for button variant
  const getButtonVariant = () => {
    if (currentTab === 'in') {
      return 'default';
    } else if (currentTab === 'out') {
      return 'destructive';
    } else {
      return 'default';
    }
  };

  // Helper function for button text
  const getButtonText = () => {
    if (currentTab === 'in') {
      return 'Complete Receive';
    } else if (currentTab === 'out') {
      return 'Complete Dispatch';
    } else {
      return 'Request Transfer';
    }
  };

  // Helper function for status indicator color
  const getStatusColor = (status: TransferStatus) => {
    if (status === 'pending') {
      return 'bg-yellow-500';
    } else if (status === 'in_transit') {
      return 'bg-blue-500';
    } else {
      return 'bg-green-500';
    }
  };

  // Helper function for status text
  const getStatusText = (status: TransferStatus) => {
    if (status === 'pending') {
      return 'Pending Approval';
    } else if (status === 'in_transit') {
      return 'In Transit';
    } else {
      return 'Completed';
    }
  };

  // Transfer workflow functions
  const initiateTransfer = () => {
    if (cartItems.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No items added',
        description: 'Please add items to the transfer request'
      });
      return;
    }
    
    setTransferStatus('pending');
    setShowTransferModal(true);
  };
  
  const confirmTransfer = () => {
    setTransferStatus('in_transit');
    setShowTransferModal(false);
    setShowSuratJalanPreview(true);
  };
  
  const handleSuratJalanDone = () => {
    if (!senderSignature) {
      toast({
        variant: 'destructive',
        title: 'Signature required',
        description: 'Please sign the document before continuing'
      });
      return;
    }
    
    setShowSuratJalanPreview(false);
    setShowConfirmationModal(true);
  };
  
  const completeTransferConfirmation = () => {
    setTransferStatus('completed');
    setShowConfirmationModal(false);
    toast({
      title: 'Transfer completed',
      description: `${cartItems.reduce((sum, item) => sum + item.quantity, 0)} items transferred from ${selectedLocation} to ${targetLocation}`
    });
    setCartItems([]);
    setNotes('');
    setTransferStatus('draft');
  };

  // New function: render Transfer Request Modal
  const renderTransferModal = () => (
    <Dialog open={showTransferModal} onOpenChange={setShowTransferModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Request</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="mb-4">
            You are about to transfer {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items 
            from {selectedLocation} to {targetLocation}.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4 dark:bg-amber-950 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-300">
              <span className="font-bold">Transfer Process:</span><br/>
              1. Request Transfer - Create transfer request<br/>
              2. Generate Surat Jalan - Document for physical transfer<br/>
              3. In Transit - Items are being moved<br/>
              4. Confirmation - Receiver confirms receipt
            </p>
          </div>
          <Textarea 
            placeholder="Add notes about this transfer (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mb-4"
            rows={3}
          />
        </div>
        <DialogFooter className="sm:justify-end">
          <Button
            variant="outline"
            onClick={() => setShowTransferModal(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmTransfer}
          >
            Confirm & Generate Surat Jalan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // New function: render Surat Jalan Preview
  const renderSuratJalanPreview = () => (
    <Dialog open={showSuratJalanPreview} onOpenChange={setShowSuratJalanPreview}>
      <DialogContent className="sm:max-w-[90%] max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Surat Jalan Preview</DialogTitle>
        </DialogHeader>
        
        <div className="border rounded-lg p-6 mb-6 bg-white">
          {/* Header */}
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <div>
              <h2 className="text-xl font-bold">SURAT JALAN</h2>
              <p className="text-gray-600">No. SJ-{invoiceNumber || format(new Date(), 'yyyyMMdd-HHmmss')}</p>
            </div>
            <div className="text-right">
              <p className="font-bold">Tanggal: {getCurrentDate()}</p>
            </div>
          </div>
          
          {/* Info Transfer */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-bold mb-2">Lokasi Asal:</h3>
              <p>{selectedLocation}</p>
              <p>Warehouse ID: WH-{selectedLocation.replace('Location ', '')}</p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Lokasi Tujuan:</h3>
              <p>{targetLocation}</p>
              <p>Warehouse ID: WH-{targetLocation.replace('Location ', '')}</p>
            </div>
          </div>
          
          {/* Items List */}
          <div className="mb-6">
            <h3 className="font-bold mb-2">Daftar Barang:</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cartItems.map((item, index) => (
                  <TableRow key={item.product.id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{item.product.sku}</TableCell>
                    <TableCell>{item.product.full_product_name}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Notes */}
          {notes && (
            <div className="mb-6">
              <h3 className="font-bold mb-2">Notes:</h3>
              <p className="p-2 border rounded bg-gray-50">{notes}</p>
            </div>
          )}
          
          {/* Signatures */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="border rounded p-4">
              <h3 className="font-bold mb-2">Pengirim:</h3>
              <div className="h-24 border-dashed border-2 border-gray-300 mb-2 flex items-center justify-center">
                {senderSignature ? (
                  <p className="text-green-600 font-bold flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Signed Digitally
                  </p>
                ) : (
                  <Button 
                    onClick={() => setSenderSignature(true)}
                    variant="outline"
                  >
                    Sign Here
                  </Button>
                )}
              </div>
              <p className="text-center">Admin (Sender)</p>
            </div>
            <div className="border rounded p-4">
              <h3 className="font-bold mb-2">Penerima:</h3>
              <div className="h-24 border-dashed border-2 border-gray-300 mb-2 flex items-center justify-center">
                <p className="text-gray-500">Will be signed upon receipt</p>
              </div>
              <p className="text-center">Receiver</p>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button 
            variant="outline"
            onClick={() => setShowSuratJalanPreview(false)}
          >
            Edit
          </Button>
          <div className="flex space-x-2">
            <Button 
              variant="outline"
              className="flex items-center"
              onClick={() => toast({
                title: 'PDF Downloaded',
                description: 'Surat jalan has been downloaded as PDF'
              })}
            >
              <FileText className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button 
              onClick={handleSuratJalanDone}
              disabled={!senderSignature}
            >
              Continue
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  // New function: render Confirmation Modal
  const renderConfirmationModal = () => (
    <Dialog open={showConfirmationModal} onOpenChange={setShowConfirmationModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Transfer Confirmation</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="bg-green-50 border border-green-200 rounded p-4 mb-4 flex items-center dark:bg-green-950 dark:border-green-800">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-300">Surat Jalan has been generated and signed!</p>
          </div>
          
          <p className="mb-4">Items are now in transit from {selectedLocation} to {targetLocation}.</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 dark:bg-blue-950 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              <span className="font-bold">Next Steps:</span><br/>
              1. Physically transport the items to {targetLocation}<br/>
              2. The receiver will need to confirm receipt in the system
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={completeTransferConfirmation}
          >
            Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (isLoading) {
    return <div>Loading products...</div>;
  }
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Transaction Type and Location */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Transaction Type</h3>
              <div className="flex mb-4">
                <Button 
                  onClick={() => setCurrentTab('in')}
                  variant={currentTab === 'in' ? 'default' : 'outline'}
                  className={`flex-1 rounded-l-md ${currentTab === 'in' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                >
                  Barang Masuk
                </Button>
                <Button 
                  onClick={() => setCurrentTab('out')}
                  variant={currentTab === 'out' ? 'default' : 'outline'}
                  className={`flex-1 rounded-none ${currentTab === 'out' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                >
                  Barang Keluar
                </Button>
                <Button 
                  onClick={() => setCurrentTab('transfer')}
                  variant={currentTab === 'transfer' ? 'default' : 'outline'}
                  className={`flex-1 rounded-r-md ${currentTab === 'transfer' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                >
                  Transfer
                </Button>
              </div>
              
              <div className="space-y-4">
                {/* Invoice Number (only for Barang Keluar) */}
                {currentTab === 'out' && (
                  <div>
                    <label htmlFor="invoiceNumber" className="block text-sm font-medium mb-2">Invoice Number</label>
                    <Input
                      id="invoiceNumber"
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      placeholder="Invoice number"
                    />
                  </div>
                )}
                
                {(currentTab === 'out' || currentTab === 'transfer') && (
                  <div>
                    <label htmlFor="locationFrom" className="block text-sm font-medium mb-2">Lokasi Asal</label>
                    <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                      <SelectTrigger id="locationFrom">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Location 1">Location 1</SelectItem>
                        <SelectItem value="Location 2">Location 2</SelectItem>
                        <SelectItem value="Location 3">Location 3</SelectItem>
                        <SelectItem value="Location 4">Location 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {(currentTab === 'in' || currentTab === 'transfer') && (
                  <div>
                    <label htmlFor="locationTo" className="block text-sm font-medium mb-2">
                      Lokasi Tujuan
                    </label>
                    <Select 
                      value={currentTab === 'in' ? selectedLocation : targetLocation}
                      onValueChange={(value) => currentTab === 'in' ? setSelectedLocation(value) : setTargetLocation(value)}
                    >
                      <SelectTrigger id="locationTo">
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Location 1">Location 1</SelectItem>
                        <SelectItem value="Location 2">Location 2</SelectItem>
                        <SelectItem value="Location 3">Location 3</SelectItem>
                        <SelectItem value="Location 4">Location 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                {currentTab === 'out' && (
                  <div>
                    <label htmlFor="customer" className="block text-sm font-medium mb-2">Customer (Optional)</label>
                    <Input 
                      id="customer"
                      type="text" 
                      placeholder="Customer name/ID"
                      value={customer}
                      onChange={(e) => setCustomer(e.target.value)}
                    />
                  </div>
                )}

                {/* Notes field for all transaction types */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium mb-2">Notes</label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this transaction..."
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-4">Product Lookup</h3>
              <form onSubmit={handleSearchSubmit} className="mb-4">
                <div className="relative">
                  <Input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Scan barcode or search by SKU/name..."
                    className="pr-10"
                    autoFocus
                  />
                  <Button 
                    type="submit"
                    size="sm"
                    className="absolute right-0 top-0 h-full rounded-l-none"
                  >
                    Search
                  </Button>
                </div>
              </form>
              
              {/* Search Results */}
              {isSearching && searchResults.length > 0 && (
                <ScrollArea className="h-[200px] border rounded-md">
                  <div className="p-1">
                    {searchResults.map((product) => (
                      <button 
                        key={product.id} 
                        className="p-2 hover:bg-muted rounded-md cursor-pointer w-full text-left"
                        onClick={() => {
                          addToCart(product);
                          setSearchTerm('');
                          setIsSearching(false);
                          if (searchInputRef.current) {
                            searchInputRef.current.focus();
                          }
                        }}
                        aria-label={`Add ${product.full_product_name} to transaction`}
                      >
                        <div className="flex justify-between">
                          <div>
                            <p className="font-medium">{product.full_product_name}</p>
                            <p className="text-sm text-muted-foreground">{product.sku}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              )}
              
              {isSearching && searchResults.length === 0 && (
                <p className="text-muted-foreground text-center py-2">No products found</p>
              )}
              
              <div className="mt-4 text-sm text-muted-foreground">
                <p>Quick tip: Scan barcode or search by SKU/name</p>
                <p className="mt-1">Use a barcode scanner or type the product info</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Right Panel - Cart/Transaction List */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardContent className="pt-6 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {getTransactionItemsHeading()}
                </h3>
                <Badge variant="outline">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </Badge>
              </div>
              
              <div className="flex-grow overflow-auto">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <div className="h-12 w-12 mb-2 opacity-20">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <p>No items added yet</p>
                    <p className="text-sm mt-1">Scan barcode or search products to add items</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Quantity</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartItems.map((item) => (
                        <TableRow key={item.product.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.product.full_product_name}</div>
                              <div className="text-sm text-muted-foreground">{item.product.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <Button 
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                              >
                                -
                              </Button>
                              <Input 
                                type="number" 
                                min="1" 
                                value={item.quantity} 
                                onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value) || 1)}
                                className="w-16 text-center"
                              />
                              <Button 
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                variant="outline"
                                size="icon"
                                className="h-8 w-8"
                              >
                                +
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              onClick={() => removeFromCart(item.product.id)}
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}  
              </div>
              
              <div className="border-t mt-6 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Total Items: <span className="text-lg">{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span></p>
                  </div>
                  <div className="space-x-2">
                    <Button 
                      onClick={() => setCartItems([])}
                      variant="outline"
                      disabled={cartItems.length === 0}
                    >
                      Clear All
                    </Button>
                    <Button 
                      onClick={completeTransaction}
                      variant={getButtonVariant()}
                      className={currentTab === 'transfer' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                      disabled={cartItems.length === 0}
                    >
                      {getButtonText()}
                    </Button>
                  </div>
                </div>
                
                {/* Transfer Status Indicator */}
                {currentTab === 'transfer' && transferStatus !== 'draft' && (
                  <div className="border rounded-lg p-3 bg-blue-50 mt-4 dark:bg-blue-950 dark:border-blue-900">
                    <div className="flex items-center mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="font-medium text-blue-800 dark:text-blue-300">Transfer Status</h3>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-block w-3 h-3 rounded-full ${getStatusColor(transferStatus)}`}></span>
                        <span className="text-sm font-medium">
                          {getStatusText(transferStatus)}
                        </span>
                      </div>
                      
                      {transferStatus === 'in_transit' && (
                        <Button 
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSuratJalanPreview(true)}
                          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          View Surat Jalan
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Render Modals */}
      {renderTransferModal()}
      {renderSuratJalanPreview()}
      {renderConfirmationModal()}
    </div>
  );
}