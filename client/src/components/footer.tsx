import { Link } from "wouter";
import { useLanguage } from "@/hooks/use-language";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin
} from "lucide-react";

export function Footer() {
  const { language, t } = useLanguage();
  
  const footerLinks = {
    quickLinks: [
      { key: 'aboutUs', href: '/about' },
      { key: 'services', href: '/services' },
      { key: 'vendors', href: '/vendors' },
      { key: 'blog', href: '/blog' },
      { key: 'contactUs', href: '/contact' }
    ],
    categories: [
      { key: 'accountServices', href: '/category/accounting-services' },
      { key: 'consultingServices', href: '/category/consulting-services' },
      { key: 'taxServices', href: '/category/tax-services' },
      { key: 'businessServices', href: '/category/business-services' },
      { key: 'techServices', href: '/category/tech-services' }
    ],
    support: [
      { key: 'help', href: '/help', label: { en: 'Help Center', zh: '帮助中心' } },
      { key: 'termsOfService', href: '/terms' },
      { key: 'privacyPolicy', href: '/privacy' },
      { key: 'faq', href: '/faq', label: { en: 'FAQ', zh: '常见问题' } }
    ]
  };
  
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Cimplico</h3>
            <p className="text-gray-400 mb-4">
              {language === 'en' 
                ? 'Your trusted marketplace for professional services and business solutions.'
                : '您值得信赖的专业服务和商业解决方案市场。'
              }
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {language === 'en' ? 'Quick Links' : '快速链接'}
            </h3>
            <ul className="space-y-2">
              {footerLinks.quickLinks.map(link => (
                <li key={link.key}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Categories */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {t('categories')}
            </h3>
            <ul className="space-y-2">
              {footerLinks.categories.map(link => (
                <li key={link.key}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Support */}
          <div>
            <h3 className="text-lg font-bold mb-4">
              {language === 'en' ? 'Support' : '支持'}
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map(link => (
                <li key={link.key}>
                  <Link href={link.href} className="text-gray-400 hover:text-white transition-colors">
                    {link.label ? link.label[language] : t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-4 space-y-2">
              <div className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                <span>support@cimplico.com</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="h-4 w-4 mr-2" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-10 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>{t('copyrightText')}</p>
        </div>
      </div>
    </footer>
  );
}
