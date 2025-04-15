import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Validation schema
const vendorSchema = z.object({
  companyName: z.string().min(2, {
    message: "Company name must be at least 2 characters.",
  }),
  businessNumber: z.string().optional(),
  website: z.string().url({
    message: "Please enter a valid URL.",
  }).optional().or(z.literal('')),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
});

export default function VendorRegister() {
  const [, navigate] = useLocation();
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize form
  const form = useForm<z.infer<typeof vendorSchema>>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      companyName: "",
      businessNumber: "",
      website: "",
      description: "",
    },
  });
  
  // Vendor registration mutation
  const registerVendorMutation = useMutation({
    mutationFn: async (data: z.infer<typeof vendorSchema>) => {
      const res = await apiRequest("POST", "/api/vendors", data);
      return await res.json();
    },
    onSuccess: (data) => {
      toast({
        title: language === 'en' ? "Application submitted" : "申请已提交",
        description: language === 'en' 
          ? "Your vendor application has been submitted for review." 
          : "您的商家申请已提交审核。",
      });
      navigate("/vendor");
    },
    onError: (error: Error) => {
      setIsSubmitting(false);
      toast({
        title: language === 'en' ? "Application failed" : "申请失败",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  function onSubmit(values: z.infer<typeof vendorSchema>) {
    if (!user) {
      toast({
        title: language === 'en' ? "Authentication required" : "需要认证",
        description: language === 'en' 
          ? "Please log in to register as a vendor." 
          : "请登录以注册成为商家。",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    setIsSubmitting(true);
    registerVendorMutation.mutate(values);
  }
  
  if (!user) {
    navigate("/auth");
    return null;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t("vendorRegisterTitle")}</CardTitle>
            <CardDescription>
              {language === 'en' 
                ? "Fill out the form below to register as a vendor on our platform."
                : "填写以下表格以在我们的平台上注册成为商家。"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 bg-blue-50 p-4 rounded-md">
              <h3 className="font-medium text-blue-700 mb-2">
                {language === 'en' ? "Become a Vendor" : "成为商家"}
              </h3>
              <p className="text-blue-600 text-sm">
                {language === 'en' 
                  ? "Joining as a vendor allows you to sell your professional services on our platform. Your application will be reviewed by our team before approval."
                  : "作为商家加入允许您在我们的平台上销售您的专业服务。您的申请将在批准前由我们的团队审核。"
                }
              </p>
            </div>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("companyName")}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={language === 'en' ? "Your company name" : "您的公司名称"} />
                      </FormControl>
                      <FormDescription>
                        {language === 'en' 
                          ? "This will be displayed publicly on your vendor profile."
                          : "这将在您的商家资料中公开显示。"
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="businessNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("businessNumber")}</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder={language === 'en' ? "Business registration number" : "营业执照号码"} 
                          />
                        </FormControl>
                        <FormDescription>
                          {language === 'en' 
                            ? "Optional, but helps verify your business."
                            : "可选，但有助于验证您的业务。"
                          }
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("website")}</FormLabel>
                        <FormControl>
                          <Input 
                            {...field} 
                            placeholder={language === 'en' ? "https://your-company.com" : "https://您的公司.com"} 
                          />
                        </FormControl>
                        <FormDescription>
                          {language === 'en' 
                            ? "Optional, include your business website."
                            : "可选，包括您的业务网站。"
                          }
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("description")}</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder={language === 'en' 
                            ? "Describe your business and the services you offer..." 
                            : "描述您的业务和您提供的服务..."
                          }
                          rows={5}
                        />
                      </FormControl>
                      <FormDescription>
                        {language === 'en' 
                          ? "Provide details about your business, expertise, and the types of services you offer."
                          : "提供有关您的业务、专业知识和您提供的服务类型的详细信息。"
                        }
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Separator />
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-medium mb-2">
                    {language === 'en' ? "What happens next?" : "接下来会发生什么？"}
                  </h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
                    <li>
                      {language === 'en' 
                        ? "Our team will review your application (typically within 1-2 business days)."
                        : "我们的团队将审核您的申请（通常在1-2个工作日内）。"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "You'll receive an email notification once your application is approved or rejected."
                        : "一旦您的申请获得批准或拒绝，您将收到电子邮件通知。"
                      }
                    </li>
                    <li>
                      {language === 'en' 
                        ? "Once approved, you can start listing your services on our platform."
                        : "一旦获得批准，您就可以开始在我们的平台上列出您的服务。"
                      }
                    </li>
                  </ol>
                </div>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/")}>
              {language === 'en' ? "Cancel" : "取消"}
            </Button>
            <Button 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? (language === 'en' ? "Submitting..." : "提交中...") 
                : t("submitApplication")
              }
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
