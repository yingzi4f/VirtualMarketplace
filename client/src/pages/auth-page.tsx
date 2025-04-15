import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>("login");
  
  // If user is already logged in, redirect to home page
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  // Login form validation schema
  const loginSchema = z.object({
    email: z.string().email({
      message: language === 'en' ? "Please enter a valid email address." : "请输入有效的电子邮件地址。"
    }),
    password: z.string().min(6, {
      message: language === 'en' 
        ? "Password must be at least 6 characters." 
        : "密码必须至少6个字符。"
    })
  });
  
  // Registration form validation schema
  const registerSchema = z.object({
    email: z.string().email({
      message: language === 'en' ? "Please enter a valid email address." : "请输入有效的电子邮件地址。"
    }),
    password: z.string().min(6, {
      message: language === 'en' 
        ? "Password must be at least 6 characters." 
        : "密码必须至少6个字符。"
    }),
    confirmPassword: z.string(),
    firstName: z.string().min(1, {
      message: language === 'en' ? "First name is required." : "名字是必需的。"
    }),
    lastName: z.string().min(1, {
      message: language === 'en' ? "Last name is required." : "姓氏是必需的。"
    })
  }).refine((data) => data.password === data.confirmPassword, {
    message: language === 'en' ? "Passwords don't match." : "密码不匹配。",
    path: ["confirmPassword"],
  });
  
  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: ""
    }
  });
  
  // Registration form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: ""
    }
  });
  
  // Handle login form submission
  function onLoginSubmit(values: z.infer<typeof loginSchema>) {
    loginMutation.mutate(values);
  }
  
  // Handle registration form submission
  function onRegisterSubmit(values: z.infer<typeof registerSchema>) {
    // Omit confirmPassword as it's not needed for the API
    const { confirmPassword, ...registrationData } = values;
    registerMutation.mutate(registrationData);
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row max-w-6xl mx-auto bg-white rounded-lg overflow-hidden shadow-lg">
          {/* Form Section */}
          <div className="w-full md:w-1/2 p-6 md:p-10">
            <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8">
                <TabsTrigger value="login">{t("login")}</TabsTrigger>
                <TabsTrigger value="register">{t("register")}</TabsTrigger>
              </TabsList>
              
              {/* Login Tab */}
              <TabsContent value="login">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold mb-1">{t("signIn")}</h2>
                  <p className="text-gray-600">{t("welcome")}</p>
                </div>
                
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("email")}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={language === 'en' ? "Enter your email" : "输入您的电子邮箱"} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("password")}</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder={language === 'en' ? "Enter your password" : "输入您的密码"} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending 
                        ? (language === 'en' ? "Signing in..." : "登录中...") 
                        : t("signIn")
                      }
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    {t("dontHaveAccount")} {" "}
                    <Button variant="link" className="p-0" onClick={() => setActiveTab("register")}>
                      {t("createAccount")}
                    </Button>
                  </p>
                </div>
              </TabsContent>
              
              {/* Register Tab */}
              <TabsContent value="register">
                <div className="mb-6 text-center">
                  <h2 className="text-2xl font-bold mb-1">{t("createAccount")}</h2>
                  <p className="text-gray-600">{t("welcome")}</p>
                </div>
                
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={registerForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("firstName")}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={language === 'en' ? "First name" : "名字"} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("lastName")}</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder={language === 'en' ? "Last name" : "姓氏"} 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("email")}</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder={language === 'en' ? "Enter your email" : "输入您的电子邮箱"} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("password")}</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder={language === 'en' ? "Create a password" : "创建密码"} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={registerForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("confirmPassword")}</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder={language === 'en' ? "Confirm your password" : "确认密码"} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending 
                        ? (language === 'en' ? "Creating account..." : "创建账户中...") 
                        : t("createAccount")
                      }
                    </Button>
                  </form>
                </Form>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    {t("alreadyHaveAccount")} {" "}
                    <Button variant="link" className="p-0" onClick={() => setActiveTab("login")}>
                      {t("signIn")}
                    </Button>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Hero Section */}
          <div className="w-full md:w-1/2 bg-gradient-to-r from-primary to-indigo-800 text-white p-6 md:p-10 flex items-center">
            <div className="max-w-md mx-auto">
              <h1 className="text-3xl font-bold mb-6">
                {language === 'en' 
                  ? "Discover Professional Services at Your Fingertips" 
                  : "触手可得的专业服务"
                }
              </h1>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    {language === 'en' 
                      ? "Access to top-rated professional services" 
                      : "获取顶级专业服务"
                    }
                  </span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    {language === 'en' 
                      ? "Secure and convenient online purchasing" 
                      : "安全便捷的在线购买"
                    }
                  </span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    {language === 'en' 
                      ? "Verified vendors and quality service guarantee" 
                      : "经过验证的供应商和优质服务保证"
                    }
                  </span>
                </li>
                <li className="flex items-start">
                  <svg className="w-6 h-6 mr-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    {language === 'en' 
                      ? "Specialized services for your business needs" 
                      : "满足您业务需求的专业服务"
                    }
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
