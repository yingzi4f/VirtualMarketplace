import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Link } from "wouter";
import { Listing } from "@shared/schema";
import { useLanguage } from "@/hooks/use-language";
import { useFavorites } from "@/hooks/use-favorites";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";

interface ProductCardProps {
  product: Listing;
  featured?: boolean;
  bestseller?: boolean;
  isNew?: boolean;
}

export function ProductCard({ product, featured, bestseller, isNew }: ProductCardProps) {
  const { language, t } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart } = useCart();
  const [isHovering, setIsHovering] = useState(false);
  
  const title = language === 'en' ? product.titleEn : product.titleZh;
  const description = language === 'en' ? product.descriptionEn : product.descriptionZh;
  
  // Use the first image from the images array or a placeholder
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80';
    
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product details
    e.stopPropagation();
    addToCart(product);
  };
  
  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product details
    e.stopPropagation();
    toggleFavorite(product.id);
  };
  
  // TODO: Replace with real category and rating once backend provides them
  const category = language === 'en' ? 'Business Services' : '商业服务';
  const rating = 4.8;
  const reviewCount = 256;
  
  return (
    <Link href={`/listing/${product.id}`}>
      <Card 
        className="h-full overflow-hidden transition-all hover:shadow-md group cursor-pointer"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative">
          <div className="w-full h-48 overflow-hidden">
            <img 
              src={imageUrl} 
              alt={title} 
              className={`w-full h-full object-cover ${isHovering ? 'scale-110' : 'scale-100'} transition-transform duration-300`}
            />
          </div>
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded-full bg-white shadow-sm hover:bg-gray-100"
              onClick={handleToggleFavorite}
            >
              <Heart 
                className={`h-4 w-4 ${isFavorite(product.id) ? 'fill-primary text-primary' : 'text-gray-400'}`} 
              />
            </Button>
          </div>
          
          {bestseller && (
            <div className="absolute bottom-2 left-2 z-10">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary text-white">
                {t('bestseller')}
              </span>
            </div>
          )}
          
          {isNew && (
            <div className="absolute bottom-2 left-2 z-10">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500 text-white">
                {t('new')}
              </span>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500">
              {category}
            </span>
            <div className="flex items-center">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-medium ml-1">{rating} ({reviewCount})</span>
            </div>
          </div>
          
          <h3 className="font-medium mb-2 text-gray-900 line-clamp-2">
            {title}
          </h3>
          
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {description}
          </p>
        </CardContent>
        
        <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between">
          <div className="font-semibold text-gray-900">
            {formatCurrency(product.price)}
          </div>
          <Button 
            size="sm" 
            className="inline-flex items-center"
            onClick={handleAddToCart}
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            {t('add')}
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}
