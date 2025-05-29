import { Link, useLocation } from "wouter";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../context/LanguageContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Landmark } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { notificationsAPI } from "../lib/api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [location] = useLocation();

  const { data: notifications = [] } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: () => notificationsAPI.getAll(),
    enabled: !!user,
  });

  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  if (!user) return null;

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-r from-primary to-orange-500 rounded-lg flex items-center justify-center">
                <Landmark className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">GConnect</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-hindi">सरकारी योजना खोजें</p>
              </div>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/">
              <a className={`font-medium transition-colors ${
                location === "/" 
                  ? "text-primary" 
                  : "text-gray-700 dark:text-gray-300 hover:text-primary"
              }`}>
                {t("dashboard")}
              </a>
            </Link>
            <Link href="/schemes">
              <a className={`font-medium transition-colors ${
                location === "/schemes" 
                  ? "text-primary" 
                  : "text-gray-700 dark:text-gray-300 hover:text-primary"
              }`}>
                {t("schemes")}
              </a>
            </Link>
            <Link href="/applications">
              <a className={`font-medium transition-colors ${
                location === "/applications" 
                  ? "text-primary" 
                  : "text-gray-700 dark:text-gray-300 hover:text-primary"
              }`}>
                {t("myApplications")}
              </a>
            </Link>
            <Link href="/profile">
              <a className={`font-medium transition-colors ${
                location === "/profile" 
                  ? "text-primary" 
                  : "text-gray-700 dark:text-gray-300 hover:text-primary"
              }`}>
                {t("profile")}
              </a>
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <LanguageToggle />

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs bg-red-500">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    {t("noNotifications")}
                  </div>
                ) : (
                  notifications.slice(0, 5).map((notification: any) => (
                    <DropdownMenuItem key={notification.id} className="flex flex-col items-start p-4">
                      <div className="font-medium">{notification.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{notification.message}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </div>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center space-x-3 cursor-pointer">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.state}</p>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <a className="w-full">{t("profile")}</a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  {t("logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
