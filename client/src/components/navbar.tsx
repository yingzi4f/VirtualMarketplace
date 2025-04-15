import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { SearchBar } from "@/components/search-bar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { 
  Search, 
  Menu, 
  Heart, 
  ShoppingCart, 
  User, 
  ChevronDown, 
  LogOut,
  Package,
  Settings,
  Store
} from "lucide-react";

export function Navbar() {
  const [location] = useLocation();
  const { language, t } = useLanguage();
  const { user, logoutMutation } = useAuth();
  const { totalItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  
  // Handle scroll to style the navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const categories = [
    { key: 'popular', href: '/popular' },
    { key: 'new', href: '/new' },
    { key: 'trending', href: '/trending' },
    { key: 'accountServices', href: '/category/accounting-services' },
    { key: 'consultingServices', href: '/category/consulting-services' },
    { key: 'taxServices', href: '/category/tax-services' },
    { key: 'businessServices', href: '/category/business-services' }
  ];
  
  const navLinkClasses = (href: string) => 
    `flex items-center py-3 px-2 text-gray-600 hover:text-gray-900 font-medium border-b-2 
    ${location === href 
      ? 'border-primary text-primary' 
      : 'border-transparent hover:border-gray-300'}`;
  
  return (
    <header className={`bg-white sticky top-0 z-30 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      {/* Top Bar */}
      <div className="bg-primary text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <LanguageSwitcher />
          
          <div className="flex items-center space-x-4 text-sm">
            {!user ? (
              <>
                <Link href="/auth" className="hover:underline">{t('login')}</Link>
                <Link href="/auth" className="hover:underline">{t('register')}</Link>
              </>
            ) : (
              <span className="hover:underline">
                {language === 'en' ? 'Welcome' : '欢迎'}, {user.firstName || user.email}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="text-primary font-bold text-2xl">Cimplico</div>
            </Link>
          </div>
          
          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 mx-10">
            <SearchBar />
          </div>
          
          {/* Right Menu */}
          <div className="flex items-center space-x-4">
            <Link href="/favorites" className="hidden md:flex items-center hover:text-primary">
              <Heart className="h-5 w-5" />
              <span className="ml-1 text-sm hidden lg:inline-block">
                {language === 'en' ? 'Favorites' : '收藏'}
              </span>
            </Link>
            
            <Link href="/cart" className="flex items-center hover:text-primary">
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="ml-1 text-sm hidden lg:inline-block">{t('cart')}</span>
            </Link>
            
            {/* User Menu - Desktop */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex">
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-1">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.firstName || 'User'} 
                          className="w-full h-full rounded-full object-cover" 
                        />
                      ) : (
                        <User className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                    <span className="hidden lg:inline-block">
                      {language === 'en' ? 'Account' : '账户'}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-1 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer w-full">
                      <User className="h-4 w-4 mr-2" />
                      <span>{language === 'en' ? 'Profile' : '个人资料'}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer w-full">
                      <Package className="h-4 w-4 mr-2" />
                      <span>{language === 'en' ? 'Orders' : '订单'}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer w-full">
                      <Settings className="h-4 w-4 mr-2" />
                      <span>{language === 'en' ? 'Settings' : '设置'}</span>
                    </Link>
                  </DropdownMenuItem>
                  
                  {/* Show vendor dashboard link if user is a vendor */}
                  {user.role === 'VENDOR' && (
                    <DropdownMenuItem asChild>
                      <Link href="/vendor" className="cursor-pointer w-full">
                        <Store className="h-4 w-4 mr-2" />
                        <span>{language === 'en' ? 'Vendor Dashboard' : '商家后台'}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  {/* Show admin dashboard link if user is an admin */}
                  {user.role === 'ADMIN' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer w-full">
                        <Store className="h-4 w-4 mr-2" />
                        <span>{language === 'en' ? 'Admin Dashboard' : '管理员后台'}</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>{language === 'en' ? 'Logout' : '退出登录'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth" className="hidden md:flex items-center">
                <Button variant="secondary">
                  {t('login')}
                </Button>
              </Link>
            )}
            
            {/* Mobile Menu Trigger and Search */}
            <div className="flex md:hidden items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setMobileSearchVisible(!mobileSearchVisible)}
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>
                      {language === 'en' ? 'Menu' : '菜单'}
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="py-4">
                    <div className="space-y-1">
                      <SheetClose asChild>
                        <Link href="/" className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 bg-gray-100">
                          {language === 'en' ? 'Home' : '首页'}
                        </Link>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Link href="/categories" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                          {t('categories')}
                        </Link>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Link href="/favorites" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                          {language === 'en' ? 'Favorites' : '收藏'}
                        </Link>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Link href="/orders" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                          {language === 'en' ? 'Orders' : '订单'}
                        </Link>
                      </SheetClose>
                      
                      <SheetClose asChild>
                        <Link href="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                          {language === 'en' ? 'Account' : '账户'}
                        </Link>
                      </SheetClose>
                      
                      {user && user.role === 'VENDOR' && (
                        <SheetClose asChild>
                          <Link href="/vendor" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                            {language === 'en' ? 'Vendor Dashboard' : '商家后台'}
                          </Link>
                        </SheetClose>
                      )}
                      
                      {user && user.role === 'ADMIN' && (
                        <SheetClose asChild>
                          <Link href="/admin" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900">
                            {language === 'en' ? 'Admin Dashboard' : '管理员后台'}
                          </Link>
                        </SheetClose>
                      )}
                      
                      {!user ? (
                        <SheetClose asChild>
                          <Link href="/auth" className="block px-3 py-2 rounded-md text-base font-medium text-primary hover:bg-gray-100">
                            {language === 'en' ? 'Login / Register' : '登录 / 注册'}
                          </Link>
                        </SheetClose>
                      ) : (
                        <div 
                          onClick={handleLogout}
                          className="block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-gray-100 cursor-pointer"
                        >
                          {language === 'en' ? 'Logout' : '退出登录'}
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        {t('categories')}
                      </div>
                      {categories.map(category => (
                        <SheetClose key={category.key} asChild>
                          <Link 
                            href={category.href}
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                          >
                            {t(category.key)}
                          </Link>
                        </SheetClose>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
        
        {/* Mobile Search Bar */}
        {mobileSearchVisible && (
          <div className="md:hidden mt-4">
            <SearchBar onSearch={() => setMobileSearchVisible(false)} />
          </div>
        )}
      </div>
      
      {/* Categories Menu */}
      <div className="border-t border-gray-200 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8 overflow-x-auto">
            {categories.map(category => (
              <Link 
                key={category.key}
                href={category.href}
                className={navLinkClasses(category.href)}
              >
                <span>{t(category.key)}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
