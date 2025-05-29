import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Landmark, Users, Search, MessageCircle, Bell, Shield } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

export default function Landing() {
  const { t } = useLanguage();

  const features = [
    {
      icon: Search,
      title: "Smart Scheme Discovery",
      titleHindi: "स्मार्ट योजना खोज",
      description: "Find government schemes based on your profile and eligibility",
      descriptionHindi: "अपनी प्रोफाइल और पात्रता के आधार पर सरकारी योजनाएं खोजें",
    },
    {
      icon: MessageCircle,
      title: "AI Chatbot Assistant",
      titleHindi: "AI चैटबॉट सहायक",
      description: "Ask questions in Hindi or English about schemes and eligibility",
      descriptionHindi: "योजनाओं और पात्रता के बारे में हिंदी या अंग्रेजी में प्रश्न पूछें",
    },
    {
      icon: Bell,
      title: "Application Tracking",
      titleHindi: "आवेदन ट्रैकिंग",
      description: "Track your scheme applications and get deadline reminders",
      descriptionHindi: "अपने योजना आवेदनों को ट्रैक करें और डेडलाइन रिमाइंडर पाएं",
    },
    {
      icon: Shield,
      title: "Secure & Trusted",
      titleHindi: "सुरक्षित और विश्वसनीय",
      description: "Official government scheme information with secure data handling",
      descriptionHindi: "सुरक्षित डेटा हैंडलिंग के साथ आधिकारिक सरकारी योजना जानकारी",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
              <Landmark className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">GConnect</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-hindi">सरकारी योजना खोजें</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <LanguageToggle />
            <Link href="/login">
              <Button variant="outline">{t("login")}</Button>
            </Link>
            <Link href="/register">
              <Button>{t("getStarted")}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            {t("heroTitle")}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            {t("heroSubtitle")}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                {t("startDiscovering")}
              </Button>
            </Link>
            <Button variant="outline" size="lg">
              {t("learnMore")}
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600 dark:text-gray-300">{t("governmentSchemes")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-500 mb-2">10L+</div>
              <div className="text-gray-600 dark:text-gray-300">{t("beneficiaries")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">28</div>
              <div className="text-gray-600 dark:text-gray-300">{t("statesCovered")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t("featuresTitle")}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t("featuresSubtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t("language") === "hi" ? feature.titleHindi : feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {t("language") === "hi" ? feature.descriptionHindi : feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-800 dark:to-blue-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t("ctaTitle")}
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {t("ctaSubtitle")}
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              {t("signUpNow")}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
                  <Landmark className="text-white text-sm" />
                </div>
                <span className="text-lg font-bold">GConnect</span>
              </div>
              <p className="text-gray-400">
                {t("footerDescription")}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t("quickLinks")}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">{t("aboutUs")}</a></li>
                <li><a href="#" className="hover:text-white">{t("contactUs")}</a></li>
                <li><a href="#" className="hover:text-white">{t("privacyPolicy")}</a></li>
                <li><a href="#" className="hover:text-white">{t("terms")}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t("support")}</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">{t("helpCenter")}</a></li>
                <li><a href="#" className="hover:text-white">{t("faq")}</a></li>
                <li><a href="#" className="hover:text-white">{t("guidelines")}</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">{t("connect")}</h4>
              <p className="text-gray-400 mb-2">Email: support@gconnect.gov.in</p>
              <p className="text-gray-400">Phone: 1800-XXX-XXXX</p>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 GConnect. {t("allRightsReserved")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
