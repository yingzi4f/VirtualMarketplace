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
import { Textarea } from "@/components/ui/textarea";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { UserRole } from "@shared/schema";
import { Shield, Package, Users, CheckCircle, XCircle } from "lucide-react";

export default function AdminDashboard() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("vendors");
  const [vendorDialogOpen, setVendorDialogOpen] = useState(false);
  const [listingDialogOpen, setListingDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "reject";
    itemType: "vendor" | "listing";
    id: number;
  } | null>(null);
  
  // Fetch pending vendors
  const { data: vendorsData, isLoading: vendorsLoading } = useQuery<{success: boolean, data: any[]}>({
    queryKey: ["/api/admin/vendors/pending"],
    enabled: !!user && user.role === UserRole.ADMIN,
  });
  
  const pendingVendors = vendorsData?.success ? vendorsData.data : [];
  
  // Fetch pending listings
  const { data: listingsData, isLoading: listingsLoading } = useQuery<{success: boolean, data: any[]}>({
    queryKey: ["/api/admin/listings/pending"],
    enabled: !!user && user.role === UserRole.ADMIN,
  });
  
  const pendingListings = listingsData?.success ? listingsData.data : [];
  
  // Approve vendor mutation
  const approveVendorMutation = useMutation({
    mutationFn: async (vendorId: number) => {
      const res = await apiRequest("PATCH", `/api/admin/vendors/${vendorId}`, { 
        verificationStatus: "APPROVED" 
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'en' ? "Vendor approved" : "商家已批准",
        description: language === 'en' 
          ? "The vendor has been approved successfully." 
          : "商家已成功获得批准。",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors/pending"] });
      setVendorDialogOpen(false);
      setConfirmDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: language === 'en' ? "Error" : "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Reject vendor mutation
  const rejectVendorMutation = useMutation({
    mutationFn: async (vendorId: number) => {
      const res = await apiRequest("PATCH", `/api/admin/vendors/${vendorId}`, { 
        verificationStatus: "REJECTED",
        rejectionReason
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'en' ? "Vendor rejected" : "商家已拒绝",
        description: language === 'en' 
          ? "The vendor has been rejected." 
          : "商家已被拒绝。",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors/pending"] });
      setVendorDialogOpen(false);
      setRejectionReason("");
      setConfirmDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: language === 'en' ? "Error" : "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Approve listing mutation
  const approveListingMutation = useMutation({
    mutationFn: async (listingId: number) => {
      const res = await apiRequest("PATCH", `/api/admin/listings/${listingId}`, { 
        status: "APPROVED" 
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'en' ? "Listing approved" : "商品已批准",
        description: language === 'en' 
          ? "The listing has been approved successfully." 
          : "商品已成功获得批准。",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/listings/pending"] });
      setListingDialogOpen(false);
      setConfirmDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: language === 'en' ? "Error" : "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Reject listing mutation
  const rejectListingMutation = useMutation({
    mutationFn: async (listingId: number) => {
      const res = await apiRequest("PATCH", `/api/admin/listings/${listingId}`, { 
        status: "REJECTED",
        rejectionReason
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: language === 'en' ? "Listing rejected" : "商品已拒绝",
        description: language === 'en' 
          ? "The listing has been rejected." 
          : "商品已被拒绝。",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/listings/pending"] });
      setListingDialogOpen(false);
      setRejectionReason("");
      setConfirmDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: language === 'en' ? "Error" : "错误",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Handle review actions
  const handleReviewVendor = (vendor: any) => {
    setSelectedVendor(vendor);
    setVendorDialogOpen(true);
  };
  
  const handleReviewListing = (listing: any) => {
    setSelectedListing(listing);
    setListingDialogOpen(true);
  };
  
  const handleApproveVendor = () => {
    if (!selectedVendor) return;
    
    setConfirmAction({
      type: "approve",
      itemType: "vendor",
      id: selectedVendor.id
    });
    setConfirmDialogOpen(true);
  };
  
  const handleRejectVendor = () => {
    if (!selectedVendor || !rejectionReason.trim()) {
      toast({
        title: language === 'en' ? "Rejection reason required" : "拒绝原因必填",
        description: language === 'en' 
          ? "Please provide a reason for rejection." 
          : "请提供拒绝原因。",
        variant: "destructive",
      });
      return;
    }
    
    setConfirmAction({
      type: "reject",
      itemType: "vendor",
      id: selectedVendor.id
    });
    setConfirmDialogOpen(true);
  };
  
  const handleApproveListing = () => {
    if (!selectedListing) return;
    
    setConfirmAction({
      type: "approve",
      itemType: "listing",
      id: selectedListing.id
    });
    setConfirmDialogOpen(true);
  };
  
  const handleRejectListing = () => {
    if (!selectedListing || !rejectionReason.trim()) {
      toast({
        title: language === 'en' ? "Rejection reason required" : "拒绝原因必填",
        description: language === 'en' 
          ? "Please provide a reason for rejection." 
          : "请提供拒绝原因。",
        variant: "destructive",
      });
      return;
    }
    
    setConfirmAction({
      type: "reject",
      itemType: "listing",
      id: selectedListing.id
    });
    setConfirmDialogOpen(true);
  };
  
  const confirmActionHandler = () => {
    if (!confirmAction) return;
    
    const { type, itemType, id } = confirmAction;
    
    if (itemType === "vendor") {
      if (type === "approve") {
        approveVendorMutation.mutate(id);
      } else {
        rejectVendorMutation.mutate(id);
      }
    } else {
      if (type === "approve") {
        approveListingMutation.mutate(id);
      } else {
        rejectListingMutation.mutate(id);
      }
    }
  };
  
  // Check if user is admin
  if (!user || user.role !== UserRole.ADMIN) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center text-red-600">
              {language === 'en' ? "Access Denied" : "访问被拒绝"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <Shield className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <p className="mb-4">
              {language === 'en' 
                ? "You don't have permission to access the admin dashboard."
                : "您没有权限访问管理员仪表板。"
              }
            </p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button variant="default" asChild>
              <a href="/">{language === 'en' ? "Return to Home" : "返回首页"}</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">{t("adminDashboard")}</h1>
        <p className="text-gray-600">
          {language === 'en' 
            ? "Manage vendors, listings, and platform settings" 
            : "管理商家、商品和平台设置"
          }
        </p>
      </div>
      
      <Tabs defaultValue="vendors" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="vendors">
            <Users className="h-4 w-4 mr-2" />
            {t("pendingVendors")}
            {pendingVendors.length > 0 && (
              <Badge className="ml-2" variant="secondary">{pendingVendors.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="listings">
            <Package className="h-4 w-4 mr-2" />
            {t("pendingListings")}
            {pendingListings.length > 0 && (
              <Badge className="ml-2" variant="secondary">{pendingListings.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        {/* Pending Vendors Tab */}
        <TabsContent value="vendors">
          <Card>
            <CardHeader>
              <CardTitle>{t("pendingVendors")}</CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? "Review and approve vendor applications" 
                  : "审核和批准商家申请"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {vendorsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : pendingVendors.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">
                          {language === 'en' ? "Company Name" : "公司名称"}
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          {language === 'en' ? "Business Number" : "营业执照号"}
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          {language === 'en' ? "Application Date" : "申请日期"}
                        </TableHead>
                        <TableHead>{language === 'en' ? "Actions" : "操作"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingVendors.map((vendor) => (
                        <TableRow key={vendor.id}>
                          <TableCell className="font-medium">{vendor.companyName}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {vendor.businessNumber || "-"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(vendor.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => handleReviewVendor(vendor)}>
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
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {language === 'en' ? "No pending vendors" : "没有待审核的商家"}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {language === 'en' 
                      ? "There are no vendor applications waiting for review at this time."
                      : "目前没有等待审核的商家申请。"
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Pending Listings Tab */}
        <TabsContent value="listings">
          <Card>
            <CardHeader>
              <CardTitle>{t("pendingListings")}</CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? "Review and approve product listings" 
                  : "审核和批准产品列表"
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {listingsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : pendingListings.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[300px]">
                          {language === 'en' ? "Title" : "标题"}
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          {language === 'en' ? "Vendor" : "商家"}
                        </TableHead>
                        <TableHead>
                          {language === 'en' ? "Price" : "价格"}
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          {language === 'en' ? "Submission Date" : "提交日期"}
                        </TableHead>
                        <TableHead>{language === 'en' ? "Actions" : "操作"}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingListings.map((listing) => (
                        <TableRow key={listing.id}>
                          <TableCell className="font-medium">
                            {language === 'en' ? listing.titleEn : listing.titleZh}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {/* TODO: Replace with real vendor name when available */}
                            {listing.vendorId}
                          </TableCell>
                          <TableCell>
                            ${listing.price.toFixed(2)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {new Date(listing.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => handleReviewListing(listing)}>
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
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {language === 'en' ? "No pending listings" : "没有待审核的商品"}
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {language === 'en' 
                      ? "There are no listings waiting for review at this time."
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
      <Dialog open={vendorDialogOpen} onOpenChange={setVendorDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? "Review Vendor Application" : "审核商家申请"}
            </DialogTitle>
            <DialogDescription>
              {language === 'en'
                ? "Review the vendor's information and approve or reject their application."
                : "审核商家的信息并批准或拒绝其申请。"
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedVendor && (
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">
                  {language === 'en' ? "Company Information" : "公司信息"}
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>{language === 'en' ? "Company Name" : "公司名称"}</Label>
                      <div className="p-2 bg-gray-50 rounded mt-1">
                        {selectedVendor.companyName}
                      </div>
                    </div>
                    <div>
                      <Label>{language === 'en' ? "Business Number" : "营业执照号"}</Label>
                      <div className="p-2 bg-gray-50 rounded mt-1">
                        {selectedVendor.businessNumber || "-"}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>{language === 'en' ? "Website" : "网站"}</Label>
                    <div className="p-2 bg-gray-50 rounded mt-1">
                      {selectedVendor.website || "-"}
                    </div>
                  </div>
                  
                  <div>
                    <Label>{language === 'en' ? "Description" : "描述"}</Label>
                    <div className="p-2 bg-gray-50 rounded mt-1 whitespace-pre-wrap">
                      {selectedVendor.description}
                    </div>
                  </div>
                  
                  <div>
                    <Label>{language === 'en' ? "Application Date" : "申请日期"}</Label>
                    <div className="p-2 bg-gray-50 rounded mt-1">
                      {new Date(selectedVendor.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="rejectionReason">
                  {language === 'en' ? "Rejection Reason (required if rejecting)" : "拒绝原因（如果拒绝，则为必填）"}
                </Label>
                <Textarea
                  id="rejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={language === 'en' 
                    ? "Provide detailed reason for rejection..." 
                    : "提供详细的拒绝原因..."
                  }
                  rows={3}
                  className="mt-1"
                />
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setVendorDialogOpen(false)}>
                  {language === 'en' ? "Cancel" : "取消"}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleRejectVendor} 
                  disabled={!rejectionReason.trim()}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {t("reject")}
                </Button>
                <Button variant="default" onClick={handleApproveVendor}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t("approve")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Listing Review Dialog */}
      <Dialog open={listingDialogOpen} onOpenChange={setListingDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? "Review Listing" : "审核商品"}
            </DialogTitle>
            <DialogDescription>
              {language === 'en'
                ? "Review the product listing and approve or reject it."
                : "审核产品列表并批准或拒绝它。"
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedListing && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {selectedListing.images && selectedListing.images.length > 0 ? (
                    <div className="rounded-md overflow-hidden bg-gray-100 h-48">
                      <img 
                        src={selectedListing.images[0]} 
                        alt={language === 'en' ? selectedListing.titleEn : selectedListing.titleZh}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="rounded-md bg-gray-100 h-48 flex items-center justify-center">
                      <p className="text-gray-500">
                        {language === 'en' ? "No image available" : "没有可用的图片"}
                      </p>
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="space-y-4">
                    <div>
                      <Label>{language === 'en' ? "Title (English)" : "标题（英文）"}</Label>
                      <div className="p-2 bg-gray-50 rounded mt-1">
                        {selectedListing.titleEn}
                      </div>
                    </div>
                    
                    <div>
                      <Label>{language === 'en' ? "Title (Chinese)" : "标题（中文）"}</Label>
                      <div className="p-2 bg-gray-50 rounded mt-1">
                        {selectedListing.titleZh}
                      </div>
                    </div>
                    
                    <div>
                      <Label>{language === 'en' ? "Price" : "价格"}</Label>
                      <div className="p-2 bg-gray-50 rounded mt-1">
                        ${selectedListing.price.toFixed(2)}
                      </div>
                    </div>
                    
                    <div>
                      <Label>{language === 'en' ? "Type" : "类型"}</Label>
                      <div className="p-2 bg-gray-50 rounded mt-1">
                        {selectedListing.type === "SERVICE" 
                          ? (language === 'en' ? "Service" : "服务") 
                          : (language === 'en' ? "Digital Product" : "数字产品")
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label>{language === 'en' ? "Description (English)" : "描述（英文）"}</Label>
                  <div className="p-2 bg-gray-50 rounded mt-1 whitespace-pre-wrap">
                    {selectedListing.descriptionEn}
                  </div>
                </div>
                
                <div>
                  <Label>{language === 'en' ? "Description (Chinese)" : "描述（中文）"}</Label>
                  <div className="p-2 bg-gray-50 rounded mt-1 whitespace-pre-wrap">
                    {selectedListing.descriptionZh}
                  </div>
                </div>
                
                {selectedListing.deliveryInstructions && (
                  <div>
                    <Label>{language === 'en' ? "Delivery Instructions" : "交付说明"}</Label>
                    <div className="p-2 bg-gray-50 rounded mt-1 whitespace-pre-wrap">
                      {selectedListing.deliveryInstructions}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="listingRejectionReason">
                  {language === 'en' ? "Rejection Reason (required if rejecting)" : "拒绝原因（如果拒绝，则为必填）"}
                </Label>
                <Textarea
                  id="listingRejectionReason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={language === 'en' 
                    ? "Provide detailed reason for rejection..." 
                    : "提供详细的拒绝原因..."
                  }
                  rows={3}
                  className="mt-1"
                />
              </div>
              
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" onClick={() => setListingDialogOpen(false)}>
                  {language === 'en' ? "Cancel" : "取消"}
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleRejectListing} 
                  disabled={!rejectionReason.trim()}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {t("reject")}
                </Button>
                <Button variant="default" onClick={handleApproveListing}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t("approve")}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === "approve" 
                ? (language === 'en' ? "Confirm Approval" : "确认批准") 
                : (language === 'en' ? "Confirm Rejection" : "确认拒绝")
              }
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "approve" 
                ? (language === 'en' 
                    ? `Are you sure you want to approve this ${confirmAction?.itemType}?` 
                    : `您确定要批准这个${confirmAction?.itemType === "vendor" ? "商家" : "商品"}吗？`
                  ) 
                : (language === 'en' 
                    ? `Are you sure you want to reject this ${confirmAction?.itemType}?` 
                    : `您确定要拒绝这个${confirmAction?.itemType === "vendor" ? "商家" : "商品"}吗？`
                  )
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'en' ? "Cancel" : "取消"}
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmActionHandler}>
              {language === 'en' ? "Confirm" : "确认"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
