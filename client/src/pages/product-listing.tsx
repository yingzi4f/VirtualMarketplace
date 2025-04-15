import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { ProductCard } from "@/components/ui/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchBar } from "@/components/search-bar";
import { useLanguage } from "@/hooks/use-language";
import { Listing, Category } from "@shared/schema";

export default function ProductListing() {
  const [, params] = useRoute("/category/:slug");
  const [, searchParams] = useRoute("/search");
  const [location] = useLocation();
  const { language, t } = useLanguage();
  
  // Parse search query from URL if present
  const queryParams = new URLSearchParams(window.location.search);
  const searchQuery = queryParams.get("q") || "";
  
  // State for filtering and pagination
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const itemsPerPage = 12;
  
  // Determine if we're showing search results, category, or special listing
  const isSearch = location.includes("/search");
  const categorySlug = params?.slug || "";
  
  // Fetch category if browsing by category
  const { data: categoryData, isLoading: categoryLoading } = useQuery<{success: boolean, data: Category}>({
    queryKey: [`/api/categories/${categorySlug}`],
    enabled: !!categorySlug && categorySlug !== "all" && !isSearch,
  });
  
  // Fetch all categories for the filter sidebar
  const { data: categoriesData } = useQuery<{success: boolean, data: Category[]}>({
    queryKey: ["/api/categories"],
  });
  
  // Fetch listings based on the current view
  const { data: listingsData, isLoading: listingsLoading } = useQuery<{success: boolean, data: Listing[]}>({
    queryKey: isSearch 
      ? [`/api/listings/search?q=${searchQuery}`]
      : categorySlug === "featured"
        ? ["/api/listings/featured"]
        : categorySlug === "top-rated"
          ? ["/api/listings/top-rated"]
          : categorySlug === "all"
            ? ["/api/listings"]
            : [`/api/listings/category/${categoryData?.data?.id}`],
    enabled: isSearch || !categorySlug || (categorySlug === "all") || 
             (categorySlug === "featured") || (categorySlug === "top-rated") || 
             !!categoryData?.data?.id,
  });
  
  const category = categoryData?.success ? categoryData.data : null;
  const categories = categoriesData?.success ? categoriesData.data : [];
  const listings = listingsData?.success ? listingsData.data : [];
  
  // Apply client-side sorting
  const sortedListings = [...(listings || [])].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "price-low") {
      return a.price - b.price;
    } else if (sortBy === "price-high") {
      return b.price - a.price;
    }
    return 0;
  });
  
  // Paginate the results
  const paginatedListings = sortedListings.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  const totalPages = Math.ceil(sortedListings.length / itemsPerPage);
  
  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [categorySlug, searchQuery, sortBy]);
  
  // Get the title for the current view
  const getPageTitle = () => {
    if (isSearch) {
      return language === 'en' 
        ? `Search Results for "${searchQuery}"` 
        : `"${searchQuery}"的搜索结果`;
    } else if (categorySlug === "all") {
      return language === 'en' ? "All Services" : "所有服务";
    } else if (categorySlug === "featured") {
      return t("featured");
    } else if (categorySlug === "top-rated") {
      return t("topRated");
    } else if (category) {
      return language === 'en' ? category.nameEn : category.nameZh;
    }
    return language === 'en' ? "Products" : "产品";
  };
  
  // Loading skeleton
  if ((categoryLoading && categorySlug !== "all" && !isSearch) || 
      (listingsLoading && (!isSearch || (isSearch && searchQuery)))) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Skeleton className="h-10 w-1/4" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-1/2 mb-2" />
                <Skeleton className="h-6 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-8 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-4">{getPageTitle()}</h1>
        
        {isSearch && (
          <div className="mb-6 max-w-xl">
            <SearchBar initialQuery={searchQuery} />
          </div>
        )}
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <p className="text-gray-600 mb-4 md:mb-0">
            {language === 'en' 
              ? `${sortedListings.length} results found`
              : `找到 ${sortedListings.length} 个结果`
            }
          </p>
          
          <div className="flex items-center space-x-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={language === 'en' ? "Sort by" : "排序方式"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  {language === 'en' ? "Newest" : "最新"}
                </SelectItem>
                <SelectItem value="price-low">
                  {language === 'en' ? "Price: Low to High" : "价格: 从低到高"}
                </SelectItem>
                <SelectItem value="price-high">
                  {language === 'en' ? "Price: High to Low" : "价格: 从高到低"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedListings.length > 0 ? (
          paginatedListings.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <h3 className="text-xl font-medium mb-2">
              {language === 'en' ? "No results found" : "没有找到结果"}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === 'en' 
                ? "Try adjusting your search or filter to find what you're looking for."
                : "尝试调整您的搜索或过滤条件以找到您要查找的内容。"
              }
            </p>
            <Button asChild>
              <a href="/">{language === 'en' ? "Back to Home" : "返回首页"}</a>
            </Button>
          </div>
        )}
      </div>
      
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(page - 1);
                }}
                className={page === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (page <= 3) {
                pageNumber = i + 1;
              } else if (page >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = page - 2 + i;
              }
              
              return (
                <PaginationItem key={i}>
                  <PaginationLink 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(pageNumber);
                    }}
                    isActive={page === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            {totalPages > 5 && page < totalPages - 2 && (
              <>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink 
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(totalPages);
                    }}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}
            
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) setPage(page + 1);
                }}
                className={page === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
