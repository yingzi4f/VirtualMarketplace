import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { apiRequest } from "@/lib/queryClient";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

// Form validation schema
const checkoutSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  company: z.string().optional(),
  paymentMethod: z.enum(["credit_card", "paypal", "bank_transfer"]),
  // Include any additional fields you need for the checkout
});

export default function CheckoutPage() {
  const [, navigate] = useLocation();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form with user data if available
  const form = useForm<z.infer<typeof checkoutSchema>>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      email: user?.email || "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      company: "",
      paymentMethod: "credit_card",
    },
  });
  
  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (formData: z.infer<typeof checkoutSchema>) => {
      // First create the order
      const orderData = {
        userId: user?.id,
        totalAmount: totalPrice,
        currency: "USD",
        deliveryDetails: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          company: formData.company,
        },
        items: items.map(item => ({
          listingId: item.listing.id,
          quantity: item.quantity,
          unitPrice: item.listing.price
        }))
      };
      
      const orderRes = await apiRequest("POST", "/api/orders", orderData);
      const orderResult = await orderRes.json();
      
      if (!orderResult.success) {
        throw new Error(orderResult.error?.message || "Failed to create order");
      }
      
      // Then process payment
      const paymentData = {
        orderId: orderResult.data.id,
        paymentMethod: formData.paymentMethod
      };
      
      const paymentRes = await apiRequest("POST", "/api/payments", paymentData);
      const paymentResult = await paymentRes.json();
      
      if (!paymentResult.success) {
        throw new Error(paymentResult.error?.message || "Failed to process payment");
      }
      
      return { order: orderResult.data, payment: paymentResult.data };
    },
    onSuccess: (data) => {
      // Clear the cart after successful checkout
      clearCart();
      
      // Show success message
      toast({
        title: language === 'en' ? "Order completed successfully!" : "订单已成功完成！",
        description: language === 'en' 
          ? "You will receive an email with your order details." 
          : "您将收到一封包含订单详情的电子邮件。",
        variant: "default",
      });
      
      // Redirect to success page or user's orders
      navigate("/profile");
    },
    onError: (error: Error) => {
      toast({
        title: language === 'en' ? "Checkout failed" : "结账失败",
        description: error.message,
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  });
  
  // Handle form submission
  function onSubmit(values: z.infer<typeof checkoutSchema>) {
    setIsSubmitting(true);
    createOrderMutation.mutate(values);
  }
  
  // If there are no items in cart, redirect to cart page
  if (items.length === 0) {
    navigate("/cart");
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">
        {language === 'en' ? 'Checkout' : '结账'}
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Checkout Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'en' ? 'Your Information' : '您的信息'}</CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Please provide your contact information for order delivery.'
                  : '请提供您的联系信息以便交付订单。'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("email")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("firstName")}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("lastName")}</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === 'en' ? "Company (Optional)" : "公司（可选）"}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {language === 'en' ? 'Payment Method' : '支付方式'}
                    </h3>
                    
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="space-y-3"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="credit_card" id="credit_card" />
                                <Label htmlFor="credit_card" className="flex-1 flex items-center cursor-pointer">
                                  <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M2 10H22" stroke="currentColor" strokeWidth="2"/>
                                    <path d="M6 15H10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                  </svg>
                                  {language === 'en' ? 'Credit / Debit Card' : '信用卡 / 借记卡'}
                                </Label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="paypal" id="paypal" />
                                <Label htmlFor="paypal" className="flex-1 flex items-center cursor-pointer">
                                  <svg className="w-8 h-8 mr-2 text-blue-500" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20.067 8.478c.492.315.738.857.738 1.604 0 1.802-1.339 3.842-3.741 3.842h-2.909l-.788 4.371h-2.79l.2-1.053h-.024l1.838-10.557h4.163c1.572 0 2.813.477 3.313 1.793zm-4.932-.473h-1.42l-1.131 6.304h1.126c1.301 0 2.169-1.1 2.169-2.284 0-1.373-.764-1.721-1.613-1.721h-.924l.4-2.299h1.393z"/>
                                    <path d="M10.165 8.005l-1.921 10.557h-2.761l1.935-10.938.148-.099c1.395-.917 3.205-1.473 5.152-1.473 2.201 0 3.803.783 3.756 2.926-.038 1.718-1.227 2.92-2.675 3.015l-.29.003c-.581.013-1.148-.017-1.7-.093-.53-.074-1.026-.195-1.483-.371l.236-1.31c.399.202.837.352 1.253.44.421.09.831.133 1.229.133 1.198 0 1.713-.427 1.713-1.446 0-.756-.659-1.17-1.437-1.17-.862 0-1.868.407-2.742.99l-1.227.836z"/>
                                  </svg>
                                  PayPal
                                </Label>
                              </div>
                              
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                                <Label htmlFor="bank_transfer" className="flex-1 flex items-center cursor-pointer">
                                  <svg className="w-8 h-8 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M3 7H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M12 3L21 7L12 11L3 7L12 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M5 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M9 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M15 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M19 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                  </svg>
                                  {language === 'en' ? 'Bank Transfer' : '银行转账'}
                                </Label>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="mt-4 text-sm text-gray-600 bg-gray-50 p-4 rounded-md">
                      <p>
                        {language === 'en' 
                          ? "This is a mock payment system for demonstration purposes. No actual payment will be processed."
                          : "这是一个用于演示目的的模拟支付系统。不会处理实际付款。"
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 lg:hidden">
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting 
                        ? (language === 'en' ? "Processing..." : "处理中...") 
                        : (language === 'en' ? "Complete Order" : "完成订单")
                      }
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
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
                {/* Order Items */}
                {items.map(item => (
                  <div key={item.listing.id} className="flex justify-between text-sm">
                    <div>
                      <span className="font-medium">
                        {language === 'en' ? item.listing.titleEn : item.listing.titleZh}
                      </span>
                      <span className="text-gray-600 ml-1">× {item.quantity}</span>
                    </div>
                    <span>{formatCurrency(item.listing.price * item.quantity)}</span>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between font-medium">
                  <span>{t("total")}</span>
                  <span>{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={form.handleSubmit(onSubmit)}
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? (language === 'en' ? "Processing..." : "处理中...") 
                  : (language === 'en' ? "Complete Order" : "完成订单")
                }
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
