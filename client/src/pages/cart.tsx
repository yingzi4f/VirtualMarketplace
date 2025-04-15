import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2, AlertCircle } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
  const { language, t } = useLanguage();
  const { items, totalItems, totalPrice, updateQuantity, removeFromCart } = useCart();
  const { user } = useAuth();
  
  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="bg-gray-100 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="h-10 w-10 text-gray-500" />
          </div>
          <h1 className="text-2xl font-bold mb-4">{t("cartEmpty")}</h1>
          <p className="text-gray-600 mb-8">
            {language === 'en' 
              ? "Your shopping cart is empty. Add some products to proceed."
              : "您的购物车为空。添加一些产品以继续。"
            }
          </p>
          <Button asChild>
            <Link href="/">{t("continueShopping")}</Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        {language === 'en' ? 'Shopping Cart' : '购物车'}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'en' ? 'Cart Items' : '购物车商品'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.listing.id} className="flex flex-col md:flex-row gap-4 py-4 border-b last:border-0">
                    {/* Product Image */}
                    <div className="w-full md:w-1/4">
                      <div className="aspect-video rounded-md overflow-hidden bg-gray-100">
                        <img 
                          src={item.listing.images && item.listing.images.length > 0 
                            ? item.listing.images[0] 
                            : 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=300&h=200&q=80'
                          } 
                          alt={language === 'en' ? item.listing.titleEn : item.listing.titleZh} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-medium">
                        <Link href={`/listing/${item.listing.id}`} className="hover:text-primary">
                          {language === 'en' ? item.listing.titleEn : item.listing.titleZh}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {language === 'en' ? item.listing.descriptionEn : item.listing.descriptionZh}
                      </p>
                      
                      <div className="flex flex-wrap items-center justify-between mt-4">
                        <div className="font-medium text-primary">
                          {formatCurrency(item.listing.price)}
                        </div>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.listing.id, Math.max(1, item.quantity - 1))}
                              className="h-8 w-8 rounded-r-none"
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => {
                                const val = parseInt(e.target.value);
                                if (!isNaN(val) && val > 0) {
                                  updateQuantity(item.listing.id, val);
                                }
                              }}
                              className="w-12 h-8 text-center rounded-none"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => updateQuantity(item.listing.id, item.quantity + 1)}
                              className="h-8 w-8 rounded-l-none"
                            >
                              +
                            </Button>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.listing.id)}
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/">{t("continueShopping")}</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Order Summary */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>{language === 'en' ? 'Order Summary' : '订单摘要'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>{language === 'en' ? 'Items' : '商品'}</span>
                  <span>{totalItems}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>{t("total")}</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
                <Separator />
                {/* Note for demo purposes */}
                <div className="flex items-start space-x-2 text-sm bg-amber-50 p-3 rounded-md">
                  <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                  <div className="text-amber-800">
                    {language === 'en' 
                      ? "This is a demo with simulated payment. No real transactions will be processed."
                      : "这是一个模拟支付的演示。不会处理真实交易。"
                    }
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link href={user ? "/checkout" : "/auth"}>
                  {t("checkout")}
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
