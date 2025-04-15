import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Shield, ListChecks, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const [, navigate] = useLocation();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("vendors");
  const [reviewVendorDialog, setReviewVendorDialog] = useState<{ open: boolean, vendor: any | null }>({ 
    open: false, 
    vendor: null 
  });
  const [reviewListingDialog, setReviewListingDialog] = useState<{ open: boolean, listing: any | null }>({ 
    open: false, 
    listing: null 
  });
  const [rejectionReason, setRejectionReason] = useState("");
  
  // Fetch pending vendors for approval
  const { 
    data: pendingVendorsData, 
    isLoading: vendorsLoading,
    refetch: refetchVendors
  } = useQuery<{success: boolean, data: any[]}>({
    queryKey: ["/api/admin/vendors/pending"],
    enabled: !!user && user.role === "ADMIN",
  });
  
  const pendingVendors = pendingVendorsData?.success ? pendingVendorsData.data : [];
  
  // Fetch pending listings for approval
  const { 
    data: pendingListingsData, 
    isLoading: listingsLoading,
    refetch: refetchListings
  } = useQuery<{success: boolean, data: any[]}>({
    queryKey: ["/api/admin/listings/pending"],
    enabled: !!user && user.role === "ADMIN",
  });
  
  const pendingListings = pendingListingsData?.success ? pendingListingsData.data : [];
  
  // Vendor approval/rejection mutation
  const approveVendorMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: number, status: string, reason?: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/vendors/${id}`, {
        verificationStatus: status,
        rejectionReason: reason
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors/pending"] });
      setReviewVendorDialog({ open: false, vendor: null });
      setRejectionReason("");
      
      toast({
        title: language === 'en' ? "Success" : "成功",
        description: language === 'en' 
          ? "Vendor status updated successfully" 
          : "供应商状态已成功更新",
      });
    },
    onError: (error: Error) => {
      toast({
        title: language === 'en' ? "Error" : "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Listing approval/rejection mutation
  const approveListingMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: number, status: string, reason?: string }) => {
      const res = await apiRequest("PATCH", `/api/admin/listings/${id}`, {
        status,
        rejectionReason: reason
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/listings/pending"] });
      setReviewListingDialog({ open: false, listing: null });
      setRejectionReason("");
      
      toast({
        title: language === 'en' ? "Success" : "成功",
        description: language === 'en' 
          ? "Listing status updated successfully" 
          : "商品状态已成功更新",
      });
    },
    onError: (error: Error) => {
      toast({
        title: language === 'en' ? "Error" : "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle vendor approval
  const handleVendorApproval = (approve: boolean) => {
    if (!reviewVendorDialog.vendor) return;
    
    // If rejecting, require a reason
    if (!approve && !rejectionReason.trim()) {
      toast({
        title: language === 'en' ? "Rejection reason required" : "需要拒绝理由",
        description: language === 'en' 
          ? "Please provide a reason for rejecting this vendor" 
          : "请提供拒绝此供应商的理由",
        variant: "destructive",
      });
      return;
    }
    
    approveVendorMutation.mutate({
      id: reviewVendorDialog.vendor.id,
      status: approve ? "APPROVED" : "REJECTED",
      reason: approve ? undefined : rejectionReason
    });
  };
  
  // Handle listing approval
  const handleListingApproval = (approve: boolean) => {
    if (!reviewListingDialog.listing) return;
    
    // If rejecting, require a reason
    if (!approve && !rejectionReason.trim()) {
      toast({
        title: language === 'en' ? "Rejection reason required" : "需要拒绝理由",
        description: language === 'en' 
          ? "Please provide a reason for rejecting this listing" 
          : "请提供拒绝此商品的理由",
        variant: "destructive",
      });
      return;
    }
    
    approveListingMutation.mutate({
      id: reviewListingDialog.listing.id,
      status: approve ? "APPROVED" : "REJECTED",
      reason: approve ? undefined : rejectionReason
    });
  };
  
  // Redirect if user is not an admin
  if (user && user.role !== "ADMIN") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">
              {language === 'en' ? "Access Denied" : "访问被拒绝"}
            </CardTitle>
            <CardDescription className="text-center">
              {language === 'en' 
                ? "You don't have permission to access this page" 
                : "您没有权限访问此页面"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-amber-50 p-4 rounded-md flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-amber-800">
                  {language === 'en' ? "Admin Access Required" : "需要管理员访问权限"}
                </h3>
                <p className="text-amber-700 text-sm mt-1">
                  {language === 'en'
                    ? "This dashboard is only accessible to administrators." 
                    : "此仪表板仅供管理员访问。"
                  }
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => navigate("/")}>
              {language === 'en' ? "Return to Home" : "返回首页"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Loading state
  if (!user || vendorsLoading || listingsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col mb-8">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center">
          <Shield className="mr-2 h-6 w-6" />
          {language === 'en' ? "Admin Dashboard" : "管理员仪表板"}
        </h1>
        <p className="text-gray-600">
          {language === 'en' 
            ? `Welcome, ${user.firstName} ${user.lastName}` 
            : `欢迎，${user.firstName} ${user.lastName}`
          }
        </p>
      </div>
      
      <Tabs defaultValue="vendors" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="vendors">
            {language === 'en' ? "Pending Vendors" : "待审核商家"}
          </TabsTrigger>
          <TabsTrigger value="listings">
            {language === 'en' ? "Pending Listings" : "待审核商品"}
          </TabsTrigger>
        </TabsList>
        
        {/* Vendors Tab */}
        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'en' ? "Pending Vendor Applications" : "待审核商家申请"}</CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? "Review and approve vendor registration requests" 
                  : "审核和批准商家注册请求"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingVendors.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">{language === 'en' ? "ID" : "ID"}</TableHead>
                        <TableHead>{language === 'en' ? "Company" : "公司"}</TableHead>
                        <TableHead>{language === 'en' ? "Date Applied" : "申请日期"}</TableHead>
                        <TableHead>{language === 'en' ? "Actions" : "操作"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingVendors.map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">{vendor.id}</TableCell>
                          <TableCell>{vendor.companyName}</TableCell>
                          <TableCell>
                            {new Date(vendor.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button 
                              onClick={() => setReviewVendorDialog({ open: true, vendor })}
                              size="sm"
                            >
                              {language === 'en' ? "Review" : "审核"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ListChecks className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {language === 'en' ? "No pending vendors" : "没有待审核的商家"}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {language === 'en'
                      ? "There are no vendor applications waiting for review."
                      : "目前没有等待审核的商家申请。"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Listings Tab */}
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'en' ? "Pending Listings" : "待审核商品"}</CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? "Review and approve product and service listings" 
                  : "审核和批准产品和服务列表"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingListings.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]">{language === 'en' ? "ID" : "ID"}</TableHead>
                        <TableHead>{language === 'en' ? "Title" : "标题"}</TableHead>
                        <TableHead>{language === 'en' ? "Vendor" : "商家"}</TableHead>
                        <TableHead>{language === 'en' ? "Price" : "价格"}</TableHead>
                        <TableHead>{language === 'en' ? "Actions" : "操作"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingListings.map((listing) => (
                        <TableRow key={listing.id}>
                          <TableCell className="font-medium">{listing.id}</TableCell>
                          <TableCell>
                            {language === 'en' ? listing.titleEn : listing.titleZh}
                          </TableCell>
                          <TableCell>{listing.vendorId}</TableCell>
                          <TableCell>${listing.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button 
                              onClick={() => setReviewListingDialog({ open: true, listing })}
                              size="sm"
                            >
                              {language === 'en' ? "Review" : "审核"}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <ListChecks className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {language === 'en' ? "No pending listings" : "没有待审核的商品"}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {language === 'en'
                      ? "There are no listings waiting for review."
                      : "目前没有等待审核的商品。"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Vendor Review Dialog */}
      <Dialog open={reviewVendorDialog.open} onOpenChange={(open) => {
        setReviewVendorDialog({ ...reviewVendorDialog, open });
        if (!open) setRejectionReason("");
      }}>
        <DialogContent className="max-w-3xl">
          {reviewVendorDialog.vendor && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {language === 'en' ? "Review Vendor Application" : "审核商家申请"}
                </DialogTitle>
                <DialogDescription>
                  {language === 'en'
                    ? "Review the vendor details and approve or reject the application"
                    : "查看商家详情并批准或拒绝申请"
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {language === 'en' ? "Vendor Details" : "商家详情"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          {language === 'en' ? "Company Name:" : "公司名称:"}
                        </span>
                        <span className="font-medium">{reviewVendorDialog.vendor.companyName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">
                          {language === 'en' ? "Applied On:" : "申请日期:"}
                        </span>
                        <span>
                          {new Date(reviewVendorDialog.vendor.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {reviewVendorDialog.vendor.businessNumber && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            {language === 'en' ? "Business Number:" : "营业执照号:"}
                          </span>
                          <span>{reviewVendorDialog.vendor.businessNumber}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {reviewVendorDialog.vendor.website && (
                        <div className="flex justify-between">
                          <span className="text-gray-500">
                            {language === 'en' ? "Website:" : "网站:"}
                          </span>
                          <a 
                            href={reviewVendorDialog.vendor.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {reviewVendorDialog.vendor.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <h4 className="font-medium mb-2">
                      {language === 'en' ? "Description:" : "描述:"}
                    </h4>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                      {reviewVendorDialog.vendor.description}
                    </p>
                  </div>
                </div>
                
                {/* Rejection reason textarea (only shown when rejecting) */}
                <div className="space-y-2">
                  <h4 className="font-medium">
                    {language === 'en' ? "Rejection Reason:" : "拒绝理由:"}
                  </h4>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    placeholder={language === 'en' 
                      ? "If rejecting, please provide a reason..." 
                      : "如果拒绝，请提供原因..."
                    }
                  />
                  <p className="text-xs text-gray-500">
                    {language === 'en'
                      ? "This will be shared with the vendor if you reject their application."
                      : "如果您拒绝他们的申请，这将与商家共享。"
                    }
                  </p>
                </div>
              </div>
              
              <DialogFooter className="flex justify-between space-x-4">
                <div className="space-x-2">
                  <Button
                    onClick={() => handleVendorApproval(false)}
                    variant="destructive"
                    disabled={approveVendorMutation.isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {language === 'en' ? "Reject" : "拒绝"}
                  </Button>
                </div>
                
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setReviewVendorDialog({ open: false, vendor: null })}
                    disabled={approveVendorMutation.isPending}
                  >
                    {language === 'en' ? "Cancel" : "取消"}
                  </Button>
                  <Button
                    onClick={() => handleVendorApproval(true)}
                    disabled={approveVendorMutation.isPending}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {language === 'en' ? "Approve" : "批准"}
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Listing Review Dialog */}
      <Dialog open={reviewListingDialog.open} onOpenChange={(open) => {
        setReviewListingDialog({ ...reviewListingDialog, open });
        if (!open) setRejectionReason("");
      }}>
        <DialogContent className="max-w-3xl">
          {reviewListingDialog.listing && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {language === 'en' ? "Review Listing" : "审核商品"}
                </DialogTitle>
                <DialogDescription>
                  {language === 'en'
                    ? "Review the listing details and approve or reject it"
                    : "查看商品详情并批准或拒绝"
                  }
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    {language === 'en' ? "Listing Details" : "商品详情"}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-500">
                          {language === 'en' ? "Title (English):" : "标题（英文）:"}
                        </h4>
                        <p>{reviewListingDialog.listing.titleEn}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-500">
                          {language === 'en' ? "Title (Chinese):" : "标题（中文）:"}
                        </h4>
                        <p>{reviewListingDialog.listing.titleZh}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="font-medium text-gray-500">
                          {language === 'en' ? "Price:" : "价格:"}
                        </h4>
                        <p>${reviewListingDialog.listing.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-500">
                          {language === 'en' ? "Type:" : "类型:"}
                        </h4>
                        <p>{reviewListingDialog.listing.type}</p>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-500">
                          {language === 'en' ? "Vendor ID:" : "商家ID:"}
                        </h4>
                        <p>{reviewListingDialog.listing.vendorId}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h4 className="font-medium text-gray-500">
                        {language === 'en' ? "Description (English):" : "描述（英文）:"}
                      </h4>
                      <p className="bg-gray-50 p-3 rounded-md">
                        {reviewListingDialog.listing.descriptionEn}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-500">
                        {language === 'en' ? "Description (Chinese):" : "描述（中文）:"}
                      </h4>
                      <p className="bg-gray-50 p-3 rounded-md">
                        {reviewListingDialog.listing.descriptionZh}
                      </p>
                    </div>
                    
                    {reviewListingDialog.listing.deliveryInstructions && (
                      <div>
                        <h4 className="font-medium text-gray-500">
                          {language === 'en' ? "Delivery Instructions:" : "交付说明:"}
                        </h4>
                        <p className="bg-gray-50 p-3 rounded-md">
                          {reviewListingDialog.listing.deliveryInstructions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Rejection reason textarea (only shown when rejecting) */}
                <div className="space-y-2">
                  <h4 className="font-medium">
                    {language === 'en' ? "Rejection Reason:" : "拒绝理由:"}
                  </h4>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    placeholder={language === 'en' 
                      ? "If rejecting, please provide a reason..." 
                      : "如果拒绝，请提供原因..."
                    }
                  />
                  <p className="text-xs text-gray-500">
                    {language === 'en'
                      ? "This will be shared with the vendor if you reject their listing."
                      : "如果您拒绝他们的商品，这将与商家共享。"
                    }
                  </p>
                </div>
              </div>
              
              <DialogFooter className="flex justify-between space-x-4">
                <div className="space-x-2">
                  <Button
                    onClick={() => handleListingApproval(false)}
                    variant="destructive"
                    disabled={approveListingMutation.isPending}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    {language === 'en' ? "Reject" : "拒绝"}
                  </Button>
                </div>
                
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setReviewListingDialog({ open: false, listing: null })}
                    disabled={approveListingMutation.isPending}
                  >
                    {language === 'en' ? "Cancel" : "取消"}
                  </Button>
                  <Button
                    onClick={() => handleListingApproval(true)}
                    disabled={approveListingMutation.isPending}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    {language === 'en' ? "Approve" : "批准"}
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}