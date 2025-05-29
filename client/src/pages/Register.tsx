import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Landmark, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../context/LanguageContext";
import LanguageToggle from "../components/LanguageToggle";

export default function Register() {
  const [, setLocation] = useLocation();
  const { register, isLoading } = useAuth();
  const { t } = useLanguage();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });
      setLocation("/");
    } catch (err: any) {
      setError(err.message || "Registration failed");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-orange-500 rounded-lg flex items-center justify-center">
              <Landmark className="text-white text-xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GConnect</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-hindi">सरकारी योजना खोजें</p>
            </div>
          </div>
          <div className="flex justify-center mb-6">
            <LanguageToggle />
          </div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">{t("createAccount")}</CardTitle>
            <CardDescription>{t("registerDescription")}</CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10">
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">{t("firstName")}</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder={t("enterFirstName")}
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">{t("lastName")}</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder={t("enterLastName")}
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder={t("enterEmail")}
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="password">{t("password")}</Label>
                <div className="relative mt-1">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("enterPassword")}
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
                <div className="relative mt-1">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={t("confirmPassword")}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                disabled={isLoading}
              >
                {isLoading ? t("creatingAccount") : t("createAccount")}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("alreadyHaveAccount")}{" "}
                <Link href="/login">
                  <a className="font-medium text-blue-600 hover:text-blue-500">
                    {t("signIn")}
                  </a>
                </Link>
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link href="/">
                <a className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                  ← {t("backToHome")}
                </a>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
