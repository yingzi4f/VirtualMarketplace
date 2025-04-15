import { useEffect } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ui/product-card";
import { CategoryCard } from "@/components/ui/category-card";
import { useLanguage } from "@/hooks/use-language";
import { Category, Listing } from "@shared/schema";

export default function HomePage() {
  const { language, t } = useLanguage();
  
  // Fetch categories
  const { data: categoriesData } = useQuery<{success: boolean, data: Category[]}>({
    queryKey: ["/api/categories"],
  });
  
  // Fetch featured listings
  const { data: featuredData } = useQuery<{success: boolean, data: Listing[]}>({
    queryKey: ["/api/listings/featured"],
  });
  
  // Fetch top rated listings
  const { data: topRatedData } = useQuery<{success: boolean, data: Listing[]}>({
    queryKey: ["/api/listings/top-rated"],
  });
  
  const categories = categoriesData?.success ? categoriesData.data : [];
  const featuredListings = featuredData?.success ? featuredData.data : [];
  const topRatedListings = topRatedData?.success ? topRatedData.data : [];
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-indigo-800 text-white py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">{t("welcome")}</h1>
          <p className="text-xl opacity-90 mb-8">{t("tagline")}</p>
          <div className="flex justify-center space-x-4">
            <Link href="/category/all">
              <Button size="lg" variant="default" className="bg-white text-primary hover:bg-gray-100">
                {t("exploreServices")}
              </Button>
            </Link>
            <Link href="/vendor/register">
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                {t("becomeVendor")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* Service Categories */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex justify-between items-center">
            <h2 className="text-2xl font-bold">
              {t("browseCategories")}
            </h2>
            <Link href="/categories">
              <Button variant="link" className="text-primary hover:underline">
                {t("viewAll")}
                <i className="fas fa-arrow-right ml-1"></i>
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                count={Math.floor(Math.random() * 50) + 10} // Random count for demo
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Featured Products */}
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex justify-between items-center">
            <h2 className="text-2xl font-bold">{t("featured")}</h2>
            <Link href="/category/featured">
              <Button variant="link" className="text-primary hover:underline">
                {t("seeAll")}
                <i className="fas fa-arrow-right ml-1"></i>
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredListings.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                featured={true}
                bestseller={product.id % 3 === 0} // Just for demo variety
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Top Rated */}
      <div className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8 flex justify-between items-center">
            <h2 className="text-2xl font-bold">{t("topRated")}</h2>
            <Link href="/category/top-rated">
              <Button variant="link" className="text-primary hover:underline">
                {t("seeAll")}
                <i className="fas fa-arrow-right ml-1"></i>
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {topRatedListings.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                isNew={product.id % 4 === 0} // Just for demo variety
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Testimonials */}
      <div className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">
              {language === 'en' ? 'What Our Customers Say' : '客户评价'}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              {language === 'en' 
                ? 'Discover why businesses trust our marketplace for their professional service needs'
                : '了解企业为何信任我们的市场来满足他们的专业服务需求'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                {language === 'en' 
                  ? '"The financial analysis service was exactly what our startup needed. The insights provided helped us secure additional funding and optimize our burn rate."'
                  : '"财务分析服务正是我们初创公司所需要的。提供的见解帮助我们获得了额外的资金并优化了我们的消耗率。"'
                }
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <span className="text-gray-700 font-medium">JM</span>
                </div>
                <div>
                  <div className="font-medium">
                    {language === 'en' ? 'James Morrison' : '詹姆斯·莫里森'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {language === 'en' ? 'CEO, TechStart Inc.' : '首席执行官，科技启动有限公司'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                {language === 'en' 
                  ? '"The tax consultation service was comprehensive and saved us thousands in potential tax liabilities. The consultant was knowledgeable and responsive."'
                  : '"税务咨询服务非常全面，为我们节省了数千美元的潜在税务负债。顾问知识渊博且反应迅速。"'
                }
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <span className="text-gray-700 font-medium">SL</span>
                </div>
                <div>
                  <div className="font-medium">
                    {language === 'en' ? 'Sarah Lin' : '林莎拉'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {language === 'en' ? 'CFO, Global Ventures' : '首席财务官，全球创投'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg key={star} className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                {language === 'en' 
                  ? '"The HR consulting services transformed our hiring process and employee onboarding. We\'ve seen a 30% increase in employee retention since implementation."'
                  : '"人力资源咨询服务改变了我们的招聘流程和员工入职。自实施以来，我们的员工保留率提高了30%。"'
                }
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                  <span className="text-gray-700 font-medium">RL</span>
                </div>
                <div>
                  <div className="font-medium">
                    {language === 'en' ? 'Robert Lee' : '李罗伯特'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {language === 'en' ? 'HR Director, Innovate Corp' : '人力资源总监，创新企业'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Vendor CTA */}
      <div className="py-12 bg-gradient-to-r from-primary to-indigo-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {language === 'en' ? 'Are You a Professional Service Provider?' : '您是专业服务提供商吗？'}
            </h2>
            <p className="text-lg opacity-90 mb-8 mx-auto max-w-3xl">
              {language === 'en' 
                ? 'Join our growing marketplace of professional service providers and connect with businesses looking for your expertise.'
                : '加入我们不断增长的专业服务提供商市场，与寻找您专业知识的企业建立联系。'
              }
            </p>
            <Link href="/vendor/register">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100">
                {language === 'en' ? 'Become a Vendor Today' : '立即成为商家'}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
