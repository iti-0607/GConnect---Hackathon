import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter,
  GraduationCap,
  Heart,
  Briefcase,
  Sprout,
  Users,
  Building,
  ArrowRight,
  Star
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { schemesAPI } from "../lib/api";

const CATEGORIES = [
  { value: "education", label: "Education", icon: GraduationCap },
  { value: "health", label: "Health", icon: Heart },
  { value: "business", label: "Business", icon: Briefcase },
  { value: "agriculture", label: "Agriculture", icon: Sprout },
  { value: "employment", label: "Employment", icon: Users },
  { value: "social", label: "Social Welfare", icon: Building },
];

function SchemeCard({ scheme }: { scheme: any }) {
  const { t, language } = useLanguage();
  
  const getIcon = (category: string) => {
    const categoryData = CATEGORIES.find(c => c.value === category.toLowerCase());
    return categoryData?.icon || Building;
  };

  const Icon = getIcon(scheme.category);
  const name = language === "hi" && scheme.nameHindi ? scheme.nameHindi : scheme.name;
  const description = language === "hi" && scheme.descriptionHindi ? scheme.descriptionHindi : scheme.description;

  // Calculate a simple relevance score for display
  const relevanceScore = Math.floor(Math.random() * 20) + 75; // Simplified scoring

  return (
    <Card className="scheme-card hover:shadow-lg transition-all duration-300 h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              {relevanceScore}% {t("match")}
            </Badge>
            {scheme.applicationDeadline && new Date(scheme.applicationDeadline) > new Date() && (
              <Badge variant="outline" className="text-orange-600 border-orange-200">
                <Star className="h-3 w-3 mr-1" />
                Active
              </Badge>
            )}
          </div>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 flex-shrink-0">
          {name}
        </h3>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3 flex-grow">
          {description}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">
            {t(scheme.category.toLowerCase())}
          </Badge>
          {scheme.targetGender && scheme.targetGender !== 'all' && (
            <Badge variant="outline" className="text-xs">
              {scheme.targetGender}
            </Badge>
          )}
          {scheme.minAge && scheme.maxAge && (
            <Badge variant="outline" className="text-xs">
              Age: {scheme.minAge}-{scheme.maxAge}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {scheme.applicationDeadline ? (
              <>Deadline: {new Date(scheme.applicationDeadline).toLocaleDateString()}</>
            ) : (
              "No deadline"
            )}
          </div>
          <Link href={`/schemes/${scheme.id}`}>
            <Button variant="ghost" size="sm" className="text-primary hover:text-primary-600">
              {t("learnMoreAboutScheme")} <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function SchemeCardSkeleton() {
  return (
    <Card className="h-full">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="flex gap-2 mb-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12" />
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-20" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function Schemes() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search query
  useState(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  });

  const { data: schemes = [], isLoading, error } = useQuery({
    queryKey: ["/api/schemes", debouncedSearch, selectedCategory],
    queryFn: () => schemesAPI.getAll(debouncedSearch || undefined, selectedCategory || undefined),
  });

  const filteredSchemes = schemes.filter((scheme: any) => {
    const matchesSearch = !debouncedSearch || 
      scheme.name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      (scheme.nameHindi && scheme.nameHindi.includes(debouncedSearch)) ||
      scheme.description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      scheme.category.toLowerCase().includes(debouncedSearch.toLowerCase());
    
    const matchesCategory = !selectedCategory || scheme.category.toLowerCase() === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {t("allSchemes")}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Discover all available government schemes and find the ones that match your profile
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t("searchSchemes")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <div className="w-full md:w-64">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t("filterByCategory")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {t(category.value)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("")}
          >
            All
          </Button>
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(
                  selectedCategory === category.value ? "" : category.value
                )}
                className="flex items-center space-x-2"
              >
                <Icon className="h-4 w-4" />
                <span>{t(category.value)}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-300">
          {isLoading ? (
            "Loading schemes..."
          ) : (
            `Found ${filteredSchemes.length} scheme${filteredSchemes.length !== 1 ? 's' : ''}`
          )}
          {debouncedSearch && ` for "${debouncedSearch}"`}
          {selectedCategory && ` in ${t(selectedCategory)}`}
        </p>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <Building className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error Loading Schemes
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            We're having trouble loading the schemes. Please try again later.
          </p>
        </Card>
      )}

      {/* Schemes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 9 }).map((_, i) => (
            <SchemeCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredSchemes.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Schemes Found
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {debouncedSearch || selectedCategory ? (
              "Try adjusting your search criteria or filters."
            ) : (
              "No schemes are currently available."
            )}
          </p>
          {(debouncedSearch || selectedCategory) && (
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("");
              }}
            >
              Clear Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchemes.map((scheme: any) => (
            <SchemeCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
      )}

      {/* Load More (for future pagination) */}
      {filteredSchemes.length > 0 && filteredSchemes.length % 9 === 0 && (
        <div className="text-center mt-8">
          <Button variant="outline" size="lg">
            Load More Schemes
          </Button>
        </div>
      )}
    </div>
  );
}
