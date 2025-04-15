// Simplified i18n implementation for the marketplace
export type Language = 'en' | 'zh';

export interface TranslationsType {
  [key: string]: {
    en: string;
    zh: string;
  };
}

export const translations: TranslationsType = {
  // Navbar and common elements
  search: {
    en: 'Search for services...',
    zh: '搜索服务...'
  },
  categories: {
    en: 'Categories',
    zh: '分类'
  },
  popular: {
    en: 'Popular',
    zh: '热门'
  },
  new: {
    en: 'New',
    zh: '最新'
  },
  trending: {
    en: 'Trending',
    zh: '趋势'
  },
  featured: {
    en: 'Featured Services',
    zh: '特色服务'
  },
  login: {
    en: 'Login',
    zh: '登录'
  },
  register: {
    en: 'Register',
    zh: '注册'
  },
  cart: {
    en: 'Cart',
    zh: '购物车'
  },
  vendors: {
    en: 'Vendors',
    zh: '商家'
  },
  blog: {
    en: 'Blog',
    zh: '博客'
  },
  accountServices: {
    en: 'Accounting Services',
    zh: '会计服务'
  },
  consultingServices: {
    en: 'Consulting Services',
    zh: '咨询服务'
  },
  taxServices: {
    en: 'Tax Services',
    zh: '税务服务'
  },
  businessServices: {
    en: 'Business Services',
    zh: '商业服务'
  },
  techServices: {
    en: 'Tech Services',
    zh: '技术服务'
  },
  
  // Home page
  viewAll: {
    en: 'View All',
    zh: '查看全部'
  },
  welcome: {
    en: 'Welcome to Cimplico Marketplace',
    zh: '欢迎来到Cimplico商城'
  },
  tagline: {
    en: 'Professional services at your fingertips',
    zh: '专业服务触手可及'
  },
  topRated: {
    en: 'Top Rated',
    zh: '最高评分'
  },
  recommendedForYou: {
    en: 'Recommended For You',
    zh: '为您推荐'
  },
  seeAll: {
    en: 'See All',
    zh: '查看全部'
  },
  exploreServices: {
    en: 'Explore Services',
    zh: '浏览服务'
  },
  becomeVendor: {
    en: 'Become a Vendor',
    zh: '成为商家'
  },
  browseCategories: {
    en: 'Browse Categories',
    zh: '浏览分类'
  },
  
  // Product related
  services: {
    en: 'services',
    zh: '个服务'
  },
  bestseller: {
    en: 'Bestseller',
    zh: '畅销'
  },
  add: {
    en: 'Add',
    zh: '添加'
  },
  
  // Authentication
  signIn: {
    en: 'Sign In',
    zh: '登录'
  },
  signUp: {
    en: 'Sign Up',
    zh: '注册'
  },
  email: {
    en: 'Email',
    zh: '电子邮箱'
  },
  password: {
    en: 'Password',
    zh: '密码'
  },
  confirmPassword: {
    en: 'Confirm Password',
    zh: '确认密码'
  },
  firstName: {
    en: 'First Name',
    zh: '名字'
  },
  lastName: {
    en: 'Last Name',
    zh: '姓氏'
  },
  forgotPassword: {
    en: 'Forgot password?',
    zh: '忘记密码？'
  },
  dontHaveAccount: {
    en: "Don't have an account?",
    zh: '没有账户？'
  },
  alreadyHaveAccount: {
    en: 'Already have an account?',
    zh: '已有账户？'
  },
  createAccount: {
    en: 'Create account',
    zh: '创建账户'
  },
  
  // Vendor registration
  vendorRegisterTitle: {
    en: 'Register as a Vendor',
    zh: '注册成为商家'
  },
  companyName: {
    en: 'Company Name',
    zh: '公司名称'
  },
  businessNumber: {
    en: 'Business Number',
    zh: '营业执照号'
  },
  website: {
    en: 'Website',
    zh: '网站'
  },
  description: {
    en: 'Description',
    zh: '描述'
  },
  submitApplication: {
    en: 'Submit Application',
    zh: '提交申请'
  },
  
  // Cart and Checkout
  cartEmpty: {
    en: 'Your cart is empty',
    zh: '购物车为空'
  },
  continueShopping: {
    en: 'Continue Shopping',
    zh: '继续购物'
  },
  checkout: {
    en: 'Checkout',
    zh: '结算'
  },
  total: {
    en: 'Total',
    zh: '总计'
  },
  remove: {
    en: 'Remove',
    zh: '移除'
  },
  quantity: {
    en: 'Quantity',
    zh: '数量'
  },
  addedToCart: {
    en: 'Added to Cart',
    zh: '已添加到购物车'
  },
  removedFromCart: {
    en: 'Removed from Cart',
    zh: '已从购物车移除'
  },
  cartCleared: {
    en: 'Cart Cleared',
    zh: '购物车已清空'
  },
  cartClearedDescription: {
    en: 'Your cart has been cleared',
    zh: '您的购物车已被清空'
  },
  
  // Footer
  aboutUs: {
    en: 'About Us',
    zh: '关于我们'
  },
  contactUs: {
    en: 'Contact Us',
    zh: '联系我们'
  },
  termsOfService: {
    en: 'Terms of Service',
    zh: '服务条款'
  },
  privacyPolicy: {
    en: 'Privacy Policy',
    zh: '隐私政策'
  },
  copyrightText: {
    en: '© 2023 Cimplico Marketplace. All rights reserved.',
    zh: '© 2023 Cimplico商城。保留所有权利。'
  },
  
  // User profile
  myProfile: {
    en: 'My Profile',
    zh: '我的资料'
  },
  myOrders: {
    en: 'My Orders',
    zh: '我的订单'
  },
  myFavorites: {
    en: 'My Favorites',
    zh: '我的收藏'
  },
  logout: {
    en: 'Logout',
    zh: '退出登录'
  },
  
  // Vendor dashboard
  vendorDashboard: {
    en: 'Vendor Dashboard',
    zh: '商家后台'
  },
  myListings: {
    en: 'My Listings',
    zh: '我的商品'
  },
  newListing: {
    en: 'New Listing',
    zh: '新增商品'
  },
  pendingApproval: {
    en: 'Pending Approval',
    zh: '等待审核'
  },
  
  // Admin dashboard
  adminDashboard: {
    en: 'Admin Dashboard',
    zh: '管理员后台'
  },
  pendingVendors: {
    en: 'Pending Vendors',
    zh: '待审核商家'
  },
  pendingListings: {
    en: 'Pending Listings',
    zh: '待审核商品'
  },
  approve: {
    en: 'Approve',
    zh: '批准'
  },
  reject: {
    en: 'Reject',
    zh: '拒绝'
  },
  rejectionReason: {
    en: 'Rejection Reason',
    zh: '拒绝原因'
  },
};

export const translate = (key: string, language: Language): string => {
  if (!translations[key]) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
  
  return translations[key][language];
};
