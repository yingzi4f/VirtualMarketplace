import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { Listing } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";

interface CartItem {
  listing: Listing;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addToCart: (listing: Listing, quantity?: number) => void;
  removeFromCart: (listingId: number) => void;
  updateQuantity: (listingId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'cimplico_cart';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [items]);
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const totalPrice = items.reduce(
    (sum, item) => sum + item.listing.price * item.quantity,
    0
  );
  
  const addToCart = (listing: Listing, quantity = 1) => {
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.listing.id === listing.id
      );
      
      if (existingItemIndex >= 0) {
        // Item already in cart, update quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        
        toast({
          title: t('addedToCart'),
          description: language === 'en' 
            ? `Updated quantity for "${listing.titleEn}"`
            : `已更新"${listing.titleZh}"的数量`,
        });
        
        return updatedItems;
      } else {
        // Add new item to cart
        toast({
          title: t('addedToCart'),
          description: language === 'en' 
            ? `Added "${listing.titleEn}" to your cart`
            : `已将"${listing.titleZh}"添加到购物车`,
        });
        
        return [...prevItems, { listing, quantity }];
      }
    });
  };
  
  const removeFromCart = (listingId: number) => {
    setItems(prevItems => {
      const itemToRemove = prevItems.find(item => item.listing.id === listingId);
      
      if (itemToRemove) {
        toast({
          title: t('removedFromCart'),
          description: language === 'en' 
            ? `Removed "${itemToRemove.listing.titleEn}" from your cart`
            : `已从购物车中移除"${itemToRemove.listing.titleZh}"`,
        });
      }
      
      return prevItems.filter(item => item.listing.id !== listingId);
    });
  };
  
  const updateQuantity = (listingId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(listingId);
      return;
    }
    
    setItems(prevItems => 
      prevItems.map(item => 
        item.listing.id === listingId
          ? { ...item, quantity }
          : item
      )
    );
  };
  
  const clearCart = () => {
    setItems([]);
    toast({
      title: t('cartCleared'),
      description: t('cartClearedDescription'),
    });
  };
  
  const value = {
    items,
    totalItems,
    totalPrice,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
