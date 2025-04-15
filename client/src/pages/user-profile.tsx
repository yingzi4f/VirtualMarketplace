import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ProductCard } from "@/components/ui/product-card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { Package, User as UserIcon } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useFavorites } from "@/hooks/use-favorites";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";

// Form validation schema
const profileSchema = z.object({
  firstName: z.string().min(1, {
    message: "First name is required",
  }),
  lastName: z.string().min(1, {
    message: "Last name is required",
  }),
  email: z.string().email({
    message: "Please enter a valid email",
  }),
  phone: z.string().optional(),
});

export default function UserProfile() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Fetch user orders
  const { data: ordersData, isLoading: ordersLoading } = useQuery<{success: boolean, data: any[]}>({
    queryKey: ["/api/orders"],
    enabled: !!user,
  });
  
  const orders = ordersData?.success ? ordersData.data : [];
  
  // Initialize profile form with user data
  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof profileSchema>) => {
    try {
      const res = await apiRequest("PUT", `/api/users/${user?.id}`, values);
      const data = await res.json();
      
      if (data.success) {
        toast({
          title: language === 'en' ? "Profile updated" : "个人资料已更新",
          description: language === 'en' 
            ? "Your profile has been updated successfully." 
            : "您的个人资料已成功更新。",
        });
      } else {
        throw new Error(data.error?.message || "Failed to update profile");
      }
    } catch (error) {
      toast({
        title: language === 'en' ? "Error" : "错误",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  const getOrderStatusBadge = (status: string) => {
    let variant = "default";
    
    switch(status) {
      case "PAID":
        variant = "secondary";
        break;
      case "PROCESSING":
        variant = "warning";
        break;
      case "COMPLETED":
        variant = "success";
        break;
      case "CANCELLED":
        variant = "destructive";
        break;
      default:
        variant = "default";
    }
    
    return (
      <Badge variant={variant as any}>
        {language === 'en' ? status : translateOrderStatus(status)}
      </Badge>
    );
  };
  
  const translateOrderStatus = (status: string) => {
    switch(status) {
      case "CREATED": return "已创建";
      case "PAID": return "已支付";
      case "PROCESSING": return "处理中";
      case "COMPLETED": return "已完成";
      case "CANCELLED": return "已取消";
      case "REFUNDED": return "已退款";
      default: return status;
    }
  };
  
  if (!user) {
    return null; // Protected route should handle redirect
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-1/4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20 mb-4">
                  {user.avatar ? (
                    <AvatarImage src={user.avatar} alt={user.firstName || user.email} />
                  ) : (
                    <AvatarFallback>
                      {user.firstName ? user.firstName[0] : user.email[0]}
                    </AvatarFallback>
                  )}
                </Avatar>
                <h2 className="text-xl font-bold mb-1">
                  {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
                </h2>
                <p className="text-gray-600 text-sm">{user.email}</p>
              </div>
              
              <div className="mt-8 space-y-2">
                <Button 
                  variant={activeTab === "profile" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("profile")}
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  {t("myProfile")}
                </Button>
                <Button 
                  variant={activeTab === "orders" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("orders")}
                >
                  <Package className="mr-2 h-4 w-4" />
                  {t("myOrders")}
                </Button>
                <Button 
                  variant={activeTab === "favorites" ? "default" : "ghost"} 
                  className="w-full justify-start"
                  onClick={() => setActiveTab("favorites")}
                >
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
                  </svg>
                  {t("myFavorites")}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("myProfile")}</CardTitle>
                <CardDescription>
                  {language === 'en' 
                    ? "Manage your personal information and account settings"
                    : "管理您的个人信息和账户设置"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{language === 'en' ? "Phone (Optional)" : "电话 (可选)"}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button type="submit">
                      {language === 'en' ? "Save Changes" : "保存更改"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
          
          {/* Orders Tab */}
          {activeTab === "orders" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("myOrders")}</CardTitle>
                <CardDescription>
                  {language === 'en' 
                    ? "View and manage your order history"
                    : "查看和管理您的订单历史"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Card key={i}>
                        <CardContent className="p-4">
                          <div className="flex justify-between mb-4">
                            <Skeleton className="h-5 w-1/4" />
                            <Skeleton className="h-5 w-1/4" />
                          </div>
                          <Skeleton className="h-4 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <Card key={order.id}>
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row justify-between mb-4">
                            <div>
                              <h3 className="font-medium">
                                {language === 'en' ? "Order" : "订单"} #{order.id}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="mt-2 md:mt-0">
                              {getOrderStatusBadge(order.status)}
                              <span className="ml-2 font-medium">
                                {formatCurrency(order.totalAmount)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {order.items?.map((item: any) => (
                              <div key={item.id} className="text-sm">
                                <span>{item.quantity}× </span>
                                <Link
                                  href={`/listing/${item.listingId}`}
                                  className="text-primary hover:underline"
                                >
                                  {language === 'en' ? item.listing?.titleEn : item.listing?.titleZh}
                                </Link>
                              </div>
                            ))}
                          </div>
                          
                          {/* Optional order details button */}
                          <div className="mt-4">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/order/${order.id}`}>
                                {language === 'en' ? "View Details" : "查看详情"}
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {language === 'en' ? "No orders yet" : "暂无订单"}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {language === 'en' 
                        ? "Your orders will appear here once you make a purchase."
                        : "一旦您进行购买，您的订单将显示在这里。"
                      }
                    </p>
                    <Button asChild>
                      <Link href="/">{t("continueShopping")}</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Favorites Tab */}
          {activeTab === "favorites" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("myFavorites")}</CardTitle>
                <CardDescription>
                  {language === 'en' 
                    ? "Your favorite services and products"
                    : "您收藏的服务和产品"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {favorites.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favorites.map(fav => (
                      <ProductCard key={fav.id} product={fav.listing} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="h-12 w-12 mx-auto text-gray-400 mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h3 className="text-lg font-medium mb-2">
                      {language === 'en' ? "No favorites yet" : "暂无收藏"}
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {language === 'en' 
                        ? "Save your favorite items by clicking the heart icon on products."
                        : "通过点击产品上的心形图标来保存您喜欢的商品。"
                      }
                    </p>
                    <Button asChild>
                      <Link href="/">{t("continueShopping")}</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
