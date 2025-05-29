import { Link, useLocation } from "wouter";
import { useLanguage } from "../context/LanguageContext";
import { Home, Search, FileText, Bell, User } from "lucide-react";

export default function MobileNav() {
  const { t } = useLanguage();
  const [location] = useLocation();

  const navItems = [
    { href: "/", icon: Home, label: t("home") },
    { href: "/schemes", icon: Search, label: t("schemes") },
    { href: "/applications", icon: FileText, label: t("applications") },
    { href: "/notifications", icon: Bell, label: t("alerts") },
    { href: "/profile", icon: User, label: t("profile") },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden z-40">
      <div className="grid grid-cols-5 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link key={item.href} href={item.href}>
              <a className="flex flex-col items-center py-2 px-1">
                <Icon className={`text-lg ${
                  isActive 
                    ? "text-primary" 
                    : "text-gray-400 dark:text-gray-500"
                }`} />
                <span className={`text-xs mt-1 ${
                  isActive 
                    ? "text-primary font-medium" 
                    : "text-gray-400 dark:text-gray-500"
                }`}>
                  {item.label}
                </span>
              </a>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
