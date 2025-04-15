import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { Category } from "@shared/schema";

interface CategoryCardProps {
  category: Category;
  count?: number;
}

export function CategoryCard({ category, count = 0 }: CategoryCardProps) {
  const { language, t } = useLanguage();
  const name = language === 'en' ? category.nameEn : category.nameZh;
  
  return (
    <Link href={`/category/${category.slug}`}>
      <Card className="relative rounded-lg overflow-hidden group cursor-pointer h-40">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-black/0 z-10"></div>
        <img 
          src={category.image || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&h=300&q=80'} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
          alt={name} 
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <h3 className="text-white font-medium">{name}</h3>
          <p className="text-white/80 text-sm">
            {count} {t('services')}
          </p>
        </div>
      </Card>
    </Link>
  );
}
