import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatCurrency } from "@/lib/utils";
import { Store, Plus, Package, AlertTriangle, BarChart2 } from "lucide-react";

const listingSchema = z.object({
  titleEn: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  titleZh: z.string().min(3, {
    message: "Chinese title must be at least 3 characters.",
  }),
  descriptionEn: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  descriptionZh: z.string().min(10, {
    message: "Chinese description must be at least 10 characters.",
  }),
  price: z.coerce.number().positive({
    message: "Price must be a positive number.",
  }),
  type: z.string().default("SERVICE"),
  categoryId: z.coerce.number().int({
    message: "Please select a category",
  }),
  images: z.array(z.string()).optional(),
  deliveryInstructions: z.string().optional(),
});

export default function VendorDashboard() {
  const [, navigate] = useLocation();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("listings");
  const [newListingDialogOpen, setNewListingDialogOpen] = useState(false);
  
  // Get the vendor profile
  const { data: vendorData, isLoading: vendorLoading } = useQuery<{success: boolean, data: any}>({
    queryKey: ["/api/vendors/profile"],
    enabled: !!user,
  });
  
  const vendorProfile = vendorData?.success ? vendorData.data : null;
  
  // Fetch vendor's listings
  const { data: listingsData, isLoading: listingsLoading } = useQuery<{success: boolean, data: any[]}>({
    queryKey: ["/api/vendors/listings"],
    enabled: !!vendorProfile,
  });
  
  const listings = listingsData?.success ? listingsData.data : [];
  
  // Fetch categories for new listing form
  const { data: categoriesData } = useQuery<{success: boolean, data: any[]}>({
    queryKey: ["/api/categories"],
  });
  
  const categories = categoriesData?.success ? categoriesData.data : [];
  
  // New listing form
  const form = useForm<z.infer<typeof listingSchema>>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      titleEn: "",
      titleZh: "",
      descriptionEn: "",
      descriptionZh: "",
      price: 0,
      type: "SERVICE",
      images: [],
      deliveryInstructions: "",
    },
  });
  
  // Create a new listing mutation
  const createListingMutation = useMutation({
    mutationFn: async (data: z.infer<typeof listingSchema>) => {
      const res = await apiRequest("POST", "/api/vendors/listings", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'en' ? "Listing created" : "商品已创建",
        description: language === 'en' 
          ? "Your listing has been submitted for review." 
          : "您的商品已提交审核。",
      });
      setNewListingDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/vendors/listings"] });
    },
    onError: (error: Error) => {
      toast({
        title: language === 'en' ? "Error" : "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof listingSchema>) => {
    if (!vendorProfile) {
      toast({
        title: language === 'en' ? "Error" : "错误",
        description: language === 'en' 
          ? "Vendor profile not found" 
          : "未找到商家资料",
        variant: "destructive",
      });
      return;
    }
    
    // Ensure images is an array
    const formattedValues = {
      ...values,
      images: values.images || [], // Ensure it's an array even if empty
    };
    
    createListingMutation.mutate(formattedValues);
  };
  
  const getStatusBadge = (status: string) => {
    let variant: "default" | "secondary" | "outline" | "destructive" = "default";
    
    switch(status) {
      case "ACTIVE":
        variant = "default";
        break;
      case "PENDING":
        variant = "secondary";
        break;
      case "REJECTED":
        variant = "destructive";
        break;
      case "DRAFT":
        variant = "outline";
        break;
      default:
        variant = "default";
    }
    
    return (
      <Badge variant={variant}>
        {language === 'en' ? status : translateStatus(status)}
      </Badge>
    );
  };
  
  const translateStatus = (status: string) => {
    switch(status) {
      case "ACTIVE": return "已上线";
      case "PENDING": return "待审核";
      case "REJECTED": return "已拒绝";
      case "DRAFT": return "草稿";
      case "INACTIVE": return "已下线";
      default: return status;
    }
  };
  
  // Redirect if user not approved as vendor
  if (vendorProfile && vendorProfile.verificationStatus !== "APPROVED") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>
              {language === 'en' ? "Vendor Account Pending" : "商家账户待审核"}
            </CardTitle>
            <CardDescription>
              {language === 'en' 
                ? "Your vendor application is currently under review." 
                : "您的商家申请正在审核中。"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-md flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800">
                  {language === 'en' ? "Application Status" : "申请状态"}
                </h3>
                <p className="text-amber-700 text-sm mt-1">
                  {language === 'en'
                    ? "Your application status is: " 
                    : "您的申请状态为: "
                  }
                  <span className="font-medium">
                    {language === 'en' 
                      ? vendorProfile.verificationStatus 
                      : vendorProfile.verificationStatus === "PENDING" 
                        ? "待审核" 
                        : vendorProfile.verificationStatus === "REJECTED" 
                          ? "已拒绝" 
                          : vendorProfile.verificationStatus
                    }
                  </span>
                </p>
                
                {vendorProfile.verificationStatus === "REJECTED" && (
                  <div className="mt-2 text-sm">
                    <p className="font-medium text-red-600">
                      {language === 'en' ? "Rejection Reason:" : "拒绝原因:"}
                    </p>
                    <p className="text-red-600">
                      {vendorProfile.rejectionReason || (language === 'en' ? "Not specified" : "未指定")}
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">
                {language === 'en' ? "Application Details:" : "申请详情:"}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">
                    {language === 'en' ? "Company Name:" : "公司名称:"}
                  </span>
                  <span className="font-medium">{vendorProfile.companyName}</span>
                </div>
                {vendorProfile.businessNumber && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">
                      {language === 'en' ? "Business Number:" : "营业执照号:"}
                    </span>
                    <span className="font-medium">{vendorProfile.businessNumber}</span>
                  </div>
                )}
                {vendorProfile.website && (
                  <div className="flex justify-between border-b pb-2">
                    <span className="text-gray-600">
                      {language === 'en' ? "Website:" : "网站:"}
                    </span>
                    <span className="font-medium">{vendorProfile.website}</span>
                  </div>
                )}
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">
                    {language === 'en' ? "Submitted On:" : "提交日期:"}
                  </span>
                  <span className="font-medium">
                    {new Date(vendorProfile.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/")}>
              {language === 'en' ? "Return to Home" : "返回首页"}
            </Button>
            
            {vendorProfile.verificationStatus === "REJECTED" && (
              <Button onClick={() => navigate("/vendor/register")}>
                {language === 'en' ? "Submit New Application" : "提交新申请"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  if (vendorLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  if (!vendorProfile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>
              {language === 'en' ? "Become a Vendor" : "成为商家"}
            </CardTitle>
            <CardDescription>
              {language === 'en' 
                ? "You need to register as a vendor to access this page." 
                : "您需要注册成为商家才能访问此页面。"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center py-4">
              {language === 'en' 
                ? "Register as a vendor to start selling your services on our platform." 
                : "注册成为商家，开始在我们的平台上销售您的服务。"
              }
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate("/vendor/register")}>
              {language === 'en' ? "Register as Vendor" : "注册成为商家"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{t("vendorDashboard")}</h1>
          <p className="text-gray-600">
            {language === 'en' 
              ? `Welcome back, ${vendorProfile.companyName}` 
              : `欢迎回来，${vendorProfile.companyName}`
            }
          </p>
        </div>
        
        <Button onClick={() => setNewListingDialogOpen(true)} className="mt-4 md:mt-0">
          <Plus className="mr-2 h-4 w-4" />
          {t("newListing")}
        </Button>
      </div>
      
      <Tabs defaultValue="listings" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="listings">
            <Store className="h-4 w-4 mr-2" />
            {language === 'en' ? "My Listings" : "我的商品"}
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Package className="h-4 w-4 mr-2" />
            {language === 'en' ? "Orders" : "订单"}
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart2 className="h-4 w-4 mr-2" />
            {language === 'en' ? "Analytics" : "数据分析"}
          </TabsTrigger>
        </TabsList>
        
        {/* Listings Tab */}
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>{t("myListings")}</CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? "Manage your product and service listings" 
                  : "管理您的产品和服务列表"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {listingsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : listings.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{language === 'en' ? "Title" : "标题"}</TableHead>
                        <TableHead className="hidden md:table-cell">
                          {language === 'en' ? "Category" : "分类"}
                        </TableHead>
                        <TableHead>{language === 'en' ? "Price" : "价格"}</TableHead>
                        <TableHead>{language === 'en' ? "Status" : "状态"}</TableHead>
                        <TableHead>{language === 'en' ? "Actions" : "操作"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listings.map((listing) => (
                        <TableRow key={listing.id}>
                          <TableCell className="font-medium">
                            {language === 'en' ? listing.titleEn : listing.titleZh}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {/* TODO: Replace with real category name when available */}
                            {listing.categoryId || "N/A"}
                          </TableCell>
                          <TableCell>{formatCurrency(listing.price)}</TableCell>
                          <TableCell>{getStatusBadge(listing.status)}</TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <a href={`/listing/${listing.id}`} target="_blank" rel="noopener noreferrer">
                                  {language === 'en' ? "View" : "查看"}
                                </a>
                              </Button>
                              <Button variant="outline" size="sm">
                                {language === 'en' ? "Edit" : "编辑"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Store className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {language === 'en' ? "No listings yet" : "暂无商品"}
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    {language === 'en' 
                      ? "You haven't created any listings yet. Create your first listing to start selling on our platform."
                      : "您尚未创建任何商品。创建您的第一个商品，开始在我们的平台上销售。"
                    }
                  </p>
                  <Button onClick={() => setNewListingDialogOpen(true)}>
                    {language === 'en' ? "Create your first listing" : "创建您的第一个商品"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'en' ? "Orders" : "订单"}</CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? "View and manage orders for your products" 
                  : "查看和管理您的产品订单"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {language === 'en' ? "No orders yet" : "暂无订单"}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {language === 'en'
                    ? "When customers purchase your products, their orders will appear here."
                    : "当客户购买您的产品时，他们的订单将显示在这里。"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'en' ? "Analytics" : "数据分析"}</CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? "Track the performance of your listings and sales" 
                  : "跟踪您的商品和销售业绩"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {language === 'en' ? "No data available yet" : "暂无可用数据"}
                </h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {language === 'en'
                    ? "Once you start selling, you'll see analytics and performance data here."
                    : "一旦您开始销售，您将在此处看到分析和性能数据。"
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* New Listing Dialog */}
      <Dialog open={newListingDialogOpen} onOpenChange={setNewListingDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{language === 'en' ? "Create New Listing" : "创建新商品"}</DialogTitle>
            <DialogDescription>
              {language === 'en'
                ? "Fill in the details below to create a new product or service listing."
                : "填写以下详细信息以创建新的产品或服务列表。"
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <FormField
                  control={form.control}
                  name="titleEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'en' ? "Title (English)" : "标题（英文）"}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="titleZh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'en' ? "Title (Chinese)" : "标题（中文）"}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'en' ? "Price" : "价格"}</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'en' ? "Category" : "分类"}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={language === 'en' ? "Select a category" : "选择分类"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {language === 'en' ? category.nameEn : category.nameZh}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'en' ? "Type" : "类型"}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={language === 'en' ? "Select type" : "选择类型"} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SERVICE">
                            {language === 'en' ? "Service" : "服务"}
                          </SelectItem>
                          <SelectItem value="DIGITAL">
                            {language === 'en' ? "Digital Product" : "数字产品"}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="descriptionEn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'en' ? "Description (English)" : "描述（英文）"}</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="descriptionZh"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'en' ? "Description (Chinese)" : "描述（中文）"}</FormLabel>
                      <FormControl>
                        <Textarea rows={4} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="deliveryInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {language === 'en' ? "Delivery Instructions" : "交付说明"}
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={3} 
                          {...field} 
                          placeholder={language === 'en' 
                            ? "Explain how customers will receive your service/product after purchase"
                            : "说明客户购买后如何接收您的服务/产品"
                          } 
                        />
                      </FormControl>
                      <FormDescription>
                        {language === 'en' 
                          ? "Provide clear instructions on how your virtual service will be delivered."
                          : "提供关于您的虚拟服务将如何交付的清晰说明。"
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{language === 'en' ? "Images (URLs)" : "图片（URL）"}</FormLabel>
                      <FormControl>
                        <Textarea 
                          rows={2} 
                          {...field}
                          value={field.value?.join("\n") || ""}
                          onChange={(e) => {
                            const urls = e.target.value.split("\n").filter(url => !!url.trim());
                            field.onChange(urls);
                          }}
                          placeholder={language === 'en' 
                            ? "Enter image URLs (one per line)"
                            : "输入图片URL（每行一个）"
                          } 
                        />
                      </FormControl>
                      <FormDescription>
                        {language === 'en' 
                          ? "Enter one image URL per line. These will be displayed on your listing."
                          : "每行输入一个图片URL。这些将显示在您的商品页面上。"
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setNewListingDialogOpen(false)}
                >
                  {language === 'en' ? "Cancel" : "取消"}
                </Button>
                <Button 
                  type="submit" 
                  disabled={createListingMutation.isPending}
                >
                  {createListingMutation.isPending 
                    ? (language === 'en' ? "Creating..." : "创建中...") 
                    : (language === 'en' ? "Create Listing" : "创建商品")
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
