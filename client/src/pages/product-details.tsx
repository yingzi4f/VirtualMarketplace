import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink, 
  BreadcrumbList, 
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, Share2, ShoppingCart, Star } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useCart } from "@/hooks/use-cart";
import { useFavorites } from "@/hooks/use-favorites";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Listing, Comment } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

export default function ProductDetails() {
  const [, params] = useRoute("/listing/:id");
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  
  const productId = params?.id ? parseInt(params.id) : 0;
  
  // Fetch product details
  const { data: productData, isLoading: productLoading } = useQuery<{success: boolean, data: Listing}>({
    queryKey: [`/api/listings/${productId}`],
    enabled: !!productId,
  });
  
  // Fetch product comments
  const { data: commentsData, isLoading: commentsLoading } = useQuery<{success: boolean, data: Comment[]}>({
    queryKey: [`/api/listings/${productId}/comments`],
    enabled: !!productId,
  });
  
  const product = productData?.success ? productData.data : null;
  const comments = commentsData?.success ? commentsData.data : [];
  
  // Handle adding to cart
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };
  
  // Handle sharing the product
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: language === 'en' ? product?.titleEn : product?.titleZh,
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: language === 'en' ? "Link copied to clipboard" : "链接已复制到剪贴板",
        description: language === 'en' ? "You can now share it with others." : "您现在可以与他人分享。",
      });
    }
  };
  
  // Handle toggling favorite
  const handleToggleFavorite = () => {
    if (product) {
      toggleFavorite(product.id);
    }
  };
  
  if (productLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-6 w-1/3" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <div className="flex space-x-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-40" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">
          {language === 'en' ? "Product Not Found" : "未找到产品"}
        </h1>
        <p className="text-gray-600 mb-6">
          {language === 'en' 
            ? "The product you are looking for does not exist or has been removed."
            : "您寻找的产品不存在或已被移除。"
          }
        </p>
        <Button asChild>
          <a href="/">{language === 'en' ? "Back to Home" : "返回首页"}</a>
        </Button>
      </div>
    );
  }
  
  const title = language === 'en' ? product.titleEn : product.titleZh;
  const description = language === 'en' ? product.descriptionEn : product.descriptionZh;
  
  const images = product.images && product.images.length > 0 
    ? product.images
    : ['https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80'];
  
  // Calculate average rating
  const averageRating = comments.length > 0
    ? comments.reduce((sum, comment) => sum + comment.rating, 0) / comments.length
    : 0;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">{language === 'en' ? 'Home' : '首页'}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/category/all">{language === 'en' ? 'Services' : '服务'}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/category/${product.categoryId}`}>
              {language === 'en' ? 'Category' : '分类'}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink>{title}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Product Images */}
        <div>
          <div className="rounded-lg overflow-hidden mb-4 bg-gray-100">
            <img 
              src={images[selectedImage]} 
              alt={title} 
              className="w-full h-[400px] object-cover object-center"
            />
          </div>
          
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((image, index) => (
                <div 
                  key={index}
                  className={`rounded-md overflow-hidden cursor-pointer border-2 ${selectedImage === index ? 'border-primary' : 'border-transparent'}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={image} 
                    alt={`${title} - image ${index + 1}`} 
                    className="w-full h-20 object-cover object-center"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Product Details */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{title}</h1>
          
          <div className="flex items-center mb-4">
            <div className="flex items-center text-yellow-400 mr-2">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.round(averageRating) ? 'fill-current' : ''}`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {averageRating.toFixed(1)} ({comments.length} {language === 'en' ? 'reviews' : '评价'})
            </span>
          </div>
          
          <div className="text-2xl font-bold text-primary mb-4">
            {formatCurrency(product.price)}
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium mb-2">{language === 'en' ? 'Description:' : '描述：'}</h3>
            <p className="text-gray-700">{description}</p>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="rounded-r-none"
              >
                -
              </Button>
              <div className="w-12 h-10 flex items-center justify-center border-y border-input">
                {quantity}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(quantity + 1)}
                className="rounded-l-none"
              >
                +
              </Button>
            </div>
            
            <Button onClick={handleAddToCart} className="flex-1">
              <ShoppingCart className="mr-2 h-4 w-4" />
              {language === 'en' ? 'Add to Cart' : '加入购物车'}
            </Button>
            
            <Button variant="outline" onClick={handleToggleFavorite}>
              <Heart 
                className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-primary text-primary' : ''}`} 
              />
            </Button>
            
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Delivery Information */}
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">
                {language === 'en' ? 'Delivery Information:' : '交付信息：'}
              </h3>
              <p className="text-sm text-gray-600">
                {language === 'en' 
                  ? 'This is a virtual service. After purchase, you will receive access information via email.'
                  : '这是一个虚拟服务。购买后，您将通过电子邮件收到访问信息。'
                }
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Product Details Tabs */}
      <Tabs defaultValue="details" className="mb-12">
        <TabsList className="w-full md:w-auto border-b">
          <TabsTrigger value="details">
            {language === 'en' ? 'Details' : '详情'}
          </TabsTrigger>
          <TabsTrigger value="reviews">
            {language === 'en' ? 'Reviews' : '评价'} ({comments.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="py-4">
          <div className="prose max-w-none">
            <h3>{language === 'en' ? 'Service Details' : '服务详情'}</h3>
            <p>{description}</p>
            
            {product.deliveryInstructions && (
              <>
                <h3>{language === 'en' ? 'Delivery Instructions' : '交付说明'}</h3>
                <p>{product.deliveryInstructions}</p>
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="reviews" className="py-4">
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">
              {language === 'en' ? 'Customer Reviews' : '客户评价'}
            </h3>
            
            {commentsLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <Skeleton className="h-4 w-1/4 mb-2" />
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map(comment => (
                  <div key={comment.id} className="border rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 mr-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < comment.rating ? 'fill-current' : ''}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-800">{comment.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">
                {language === 'en' 
                  ? 'No reviews yet. Be the first to review this product!'
                  : '暂无评价。成为第一个评价此产品的人！'
                }
              </p>
            )}
          </div>
          
          {user && (
            <div className="mt-8">
              <h3 className="font-medium mb-2">
                {language === 'en' ? 'Write a Review' : '写评价'}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {language === 'en' 
                  ? 'You need to purchase this product before leaving a review.'
                  : '您需要购买此产品才能留下评价。'
                }
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
