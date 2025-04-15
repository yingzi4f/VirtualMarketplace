import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { CreditCard, ShoppingCart, CheckCircle2, Loader2 } from "lucide-react";

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error("Missing Stripe public key environment variable");
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

// Form validation schema
const checkoutFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  phone: z.string().optional()
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

// Component for the payment form
function PaymentForm({ clientSecret, onSuccess }: { clientSecret: string, onSuccess: () => void }) {
  const { language } = useLanguage();
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/order-complete",
        },
        redirect: 'if_required'
      });
      
      if (error) {
        toast({
          title: language === 'en' ? "Payment Failed" : "支付失败",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: language === 'en' ? "Payment Successful" : "支付成功",
          description: language === 'en' 
            ? "Your payment has been processed successfully" 
            : "您的付款已成功处理",
        });
        onSuccess();
      }
    } catch (error: any) {
      toast({
        title: language === 'en' ? "Payment Error" : "支付错误",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <PaymentElement />
      </div>
      
      <Button 
        type="submit" 
        className="w-full" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {language === 'en' ? "Processing..." : "处理中..."}
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            {language === 'en' ? "Complete Payment" : "完成支付"}
          </>
        )}
      </Button>
    </form>
  );
}

export default function Checkout() {
  const [, navigate] = useLocation();
  const { language } = useLanguage();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // If the cart is empty, redirect to home
  useEffect(() => {
    if (cart.items.length === 0 && !paymentComplete) {
      navigate("/");
    }
  }, [cart.items, navigate, paymentComplete]);
  
  // Calculate total price
  const total = cart.items.reduce(
    (sum, item) => sum + (item.price * item.quantity),
    0
  );
  
  // Pre-fill form with user data if available
  const defaultValues: Partial<CheckoutFormValues> = {
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || ""
  };
  
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues
  });
  
  // Create payment intent when form is submitted
  const createPaymentIntent = useMutation({
    mutationFn: async (formData: CheckoutFormValues) => {
      setIsLoading(true);
      const res = await apiRequest("POST", "/api/create-payment-intent", {
        amount: total,
        customerInfo: formData,
        items: cart.items.map(item => ({
          id: item.id,
          quantity: item.quantity
        }))
      });
      return await res.json();
    },
    onSuccess: (data) => {
      if (data.success && data.clientSecret) {
        setClientSecret(data.clientSecret);
      } else {
        toast({
          title: language === 'en' ? "Error" : "错误",
          description: data.error?.message || (language === 'en' ? "Unable to process payment" : "无法处理付款"),
          variant: "destructive",
        });
      }
      setIsLoading(false);
    },
    onError: (error: Error) => {
      toast({
        title: language === 'en' ? "Error" : "错误",
        description: error.message,
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });
  
  const onSubmit = (values: CheckoutFormValues) => {
    createPaymentIntent.mutate(values);
  };
  
  const handlePaymentSuccess = () => {
    setPaymentComplete(true);
    clearCart();
    
    // Wait a moment then redirect to order history
    setTimeout(() => {
      navigate("/order-complete");
    }, 2000);
  };
  
  if (paymentComplete) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-md mx-auto">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {language === 'en' ? "Payment Successful!" : "支付成功！"}
          </h1>
          <p className="text-gray-600 mb-6">
            {language === 'en'
              ? "Your order has been processed successfully. Redirecting you to order details..."
              : "您的订单已成功处理。正在将您重定向到订单详情..."}
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          {language === 'en' ? "Checkout" : "结账"}
        </h1>
        <p className="text-gray-600">
          {language === 'en' 
            ? "Complete your purchase" 
            : "完成您的购买"
          }
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Summary */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <Card>
            <CardHeader>
              <CardTitle>
                {language === 'en' ? "Order Summary" : "订单摘要"}
              </CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? `${cart.items.length} item(s) in your cart`
                  : `您的购物车中有 ${cart.items.length} 个商品`
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between py-2">
                  <div className="flex-1">
                    <p className="font-medium">
                      {language === 'en' ? item.titleEn : item.titleZh}
                    </p>
                    <p className="text-sm text-gray-500">
                      {language === 'en' ? "Qty:" : "数量:"} {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between font-bold">
                <p>{language === 'en' ? "Total" : "总计"}</p>
                <p>${total.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Checkout Form */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {clientSecret 
                  ? (language === 'en' ? "Payment Information" : "支付信息") 
                  : (language === 'en' ? "Customer Information" : "客户信息")
                }
              </CardTitle>
              <CardDescription>
                {clientSecret 
                  ? (language === 'en' ? "Enter your payment details to complete your purchase" : "输入您的支付详细信息以完成购买") 
                  : (language === 'en' ? "Please enter your details below" : "请在下方输入您的详细信息")
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!clientSecret ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{language === 'en' ? "First Name" : "名"}</FormLabel>
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
                            <FormLabel>{language === 'en' ? "Last Name" : "姓"}</FormLabel>
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === 'en' ? "Email" : "电子邮件"}</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === 'en' ? "Phone Number (Optional)" : "电话号码（可选）"}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {language === 'en' ? "Processing..." : "处理中..."}
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          {language === 'en' ? "Proceed to Payment" : "继续支付"}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <PaymentForm 
                    clientSecret={clientSecret} 
                    onSuccess={handlePaymentSuccess} 
                  />
                </Elements>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}