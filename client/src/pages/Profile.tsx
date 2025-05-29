import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { User, MapPin, Briefcase, DollarSign, Calendar } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../context/LanguageContext";
import { profileAPI } from "../lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "../lib/queryClient";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const OCCUPATIONS = [
  "Student", "Farmer", "Teacher", "Engineer", "Doctor", "Lawyer", "Businessman",
  "Government Employee", "Private Employee", "Self Employed", "Unemployed",
  "Retired", "Homemaker", "Daily Wage Worker", "Skilled Worker", "Other"
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    age: user?.age?.toString() || "",
    gender: user?.gender || "",
    income: user?.income?.toString() || "",
    occupation: user?.occupation || "",
    state: user?.state || "",
    district: user?.district || "",
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => profileAPI.update(data),
    onSuccess: (updatedUser) => {
      updateUser(updatedUser);
      setIsEditing(false);
      toast({
        title: "Success",
        description: t("profileUpdated"),
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/schemes/recommended"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updateData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      age: formData.age ? parseInt(formData.age) : undefined,
      gender: formData.gender || undefined,
      income: formData.income ? parseInt(formData.income) : undefined,
      occupation: formData.occupation || undefined,
      state: formData.state || undefined,
      district: formData.district || undefined,
    };

    updateProfileMutation.mutate(updateData);
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      age: user?.age?.toString() || "",
      gender: user?.gender || "",
      income: user?.income?.toString() || "",
      occupation: user?.occupation || "",
      state: user?.state || "",
      district: user?.district || "",
    });
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardContent className="p-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profileCompletion = [
    user.firstName, user.lastName, user.age, user.gender, 
    user.income, user.occupation, user.state
  ].filter(Boolean).length;
  const completionPercentage = Math.round((profileCompletion / 7) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t("profileSettings")}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          Manage your personal information and preferences
        </p>
      </div>

      {/* Profile Completion Alert */}
      {completionPercentage < 100 && (
        <Alert className="mb-6 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10">
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            Your profile is {completionPercentage}% complete. Complete your profile to get better scheme recommendations.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>{t("personalInformation")}</span>
              </CardTitle>
              <CardDescription>
                This information helps us recommend the best government schemes for you
              </CardDescription>
            </div>
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                {t("edit")}
              </Button>
            ) : (
              <div className="space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  {t("cancel")}
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={updateProfileMutation.isPending}
                >
                  {updateProfileMutation.isPending ? "Saving..." : t("saveChanges")}
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t("firstName")}</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">{t("lastName")}</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  disabled={!isEditing}
                  required
                />
              </div>
            </div>

            {/* Demographics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="age" className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{t("age")}</span>
                </Label>
                <Input
                  id="age"
                  type="number"
                  min="0"
                  max="120"
                  value={formData.age}
                  onChange={(e) => handleInputChange("age", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your age"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">{t("gender")}</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("male")}</SelectItem>
                    <SelectItem value="female">{t("female")}</SelectItem>
                    <SelectItem value="other">{t("other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Economic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="income" className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4" />
                  <span>{t("income")}</span>
                </Label>
                <Input
                  id="income"
                  type="number"
                  min="0"
                  value={formData.income}
                  onChange={(e) => handleInputChange("income", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Annual income in rupees"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="occupation" className="flex items-center space-x-2">
                  <Briefcase className="h-4 w-4" />
                  <span>{t("occupation")}</span>
                </Label>
                <Select
                  value={formData.occupation}
                  onValueChange={(value) => handleInputChange("occupation", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select occupation" />
                  </SelectTrigger>
                  <SelectContent>
                    {OCCUPATIONS.map((occupation) => (
                      <SelectItem key={occupation} value={occupation}>
                        {occupation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="state" className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{t("state")}</span>
                </Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => handleInputChange("state", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="district">{t("district")}</Label>
                <Input
                  id="district"
                  value={formData.district}
                  onChange={(e) => handleInputChange("district", e.target.value)}
                  disabled={!isEditing}
                  placeholder="Enter your district"
                />
              </div>
            </div>

            {/* Profile Stats */}
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                Profile Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {completionPercentage}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Profile Complete
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {user.email ? "✓" : "✗"}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Email Verified
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Member Since
                  </div>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
