import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft,
  ExternalLink,
  Calendar,
  Users,
  DollarSign,
  MapPin,
  FileText,
  CheckCircle,
  Info,
  Star,
  Clock
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../hooks/useAuth";
import { schemesAPI, applicationsAPI } from "../lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "../lib/queryClient";

export default function SchemeDetails() {
  const params = useParams();
  const schemeId = parseInt(params.id as string);
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { toast } = useToast();

  const { data: scheme, isLoading, error } = useQuery({
    queryKey: ["/api/schemes", schemeId],
    queryFn: () => schemesAPI.getById(schemeId),
    enabled: !!schemeId,
  });

  const { data: userApplications = [] } = useQuery({
    queryKey: ["/api/applications"],
    queryFn: () => applicationsAPI.getAll(),
    enabled: !!user,
  });

  const createApplicationMutation = useMutation({
    mutationFn: (data: { schemeId: number; notes?: string }) => 
      applicationsAPI.create(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Application tracking started successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to start tracking application",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <FileText className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Scheme Not Found
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            The scheme you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/schemes">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Schemes
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const name = language === "hi" && scheme.nameHindi ? scheme.nameHindi : scheme.name;
  const description = language === "hi" && scheme.descriptionHindi ? scheme.descriptionHindi : scheme.description;
  const eligibility = language === "hi" && scheme.eligibilityHindi ? scheme.eligibilityHindi : scheme.eligibility;
  const benefits = language === "hi" && scheme.benefitsHindi ? scheme.benefitsHindi : scheme.benefits;
  const applicationProcess = language === "hi" && scheme.applicationProcessHindi ? scheme.applicationProcessHindi : scheme.applicationProcess;

  const isDeadlinePassed = scheme.applicationDeadline && new Date(scheme.applicationDeadline) < new Date();
  const hasApplied = userApplications.some((app: any) => app.schemeId === scheme.id);

  // Check eligibility based on user profile
  const checkEligibility = () => {
    if (!user) return { eligible: false, reasons: ["Please complete your profile to check eligibility"] };
    
    const reasons: string[] = [];
    let eligible = true;

    if (scheme.minAge && user.age && user.age < scheme.minAge) {
      eligible = false;
      reasons.push(`Minimum age requirement: ${scheme.minAge} years`);
    }

    if (scheme.maxAge && user.age && user.age > scheme.maxAge) {
      eligible = false;
      reasons.push(`Maximum age limit: ${scheme.maxAge} years`);
    }

    if (scheme.minIncome && user.income && user.income < scheme.minIncome) {
      eligible = false;
      reasons.push(`Minimum income requirement: ₹${scheme.minIncome.toLocaleString()}`);
    }

    if (scheme.maxIncome && user.income && user.income > scheme.maxIncome) {
      eligible = false;
      reasons.push(`Maximum income limit: ₹${scheme.maxIncome.toLocaleString()}`);
    }

    if (scheme.targetGender && scheme.targetGender !== 'all' && user.gender && user.gender !== scheme.targetGender) {
      eligible = false;
      reasons.push(`Target gender: ${scheme.targetGender}`);
    }

    if (scheme.targetStates && scheme.targetStates.length > 0 && user.state && !scheme.targetStates.includes(user.state)) {
      eligible = false;
      reasons.push(`Available in states: ${scheme.targetStates.join(", ")}`);
    }

    if (eligible) {
      reasons.push("You meet all eligibility criteria!");
    }

    return { eligible, reasons };
  };

  const eligibilityCheck = checkEligibility();

  const handleTrackApplication = () => {
    createApplicationMutation.mutate({
      schemeId: scheme.id,
      notes: `Started tracking application for ${scheme.name}`,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Link href="/schemes">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Schemes
          </Button>
        </Link>
      </div>

      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <Badge variant="secondary" className="text-sm">
                  {t(scheme.category.toLowerCase())}
                </Badge>
                {!isDeadlinePassed && (
                  <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <Star className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                )}
                {isDeadlinePassed && (
                  <Badge variant="destructive">
                    <Clock className="h-3 w-3 mr-1" />
                    Deadline Passed
                  </Badge>
                )}
              </div>
              
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
                {name}
              </CardTitle>
              
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                {description}
              </p>
            </div>

            <div className="flex flex-col gap-3 md:min-w-[200px]">
              {scheme.officialLink && (
                <Button asChild className="w-full">
                  <a href={scheme.officialLink} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t("officialWebsite")}
                  </a>
                </Button>
              )}
              
              {!hasApplied && !isDeadlinePassed && user && (
                <Button 
                  variant="outline" 
                  onClick={handleTrackApplication}
                  disabled={createApplicationMutation.isPending}
                  className="w-full"
                >
                  {createApplicationMutation.isPending ? (
                    "Adding..."
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      {t("trackApplication")}
                    </>
                  )}
                </Button>
              )}

              {hasApplied && (
                <Button variant="outline" disabled className="w-full">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Already Tracking
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Eligibility Check */}
      {user && (
        <Alert className={`mb-6 ${
          eligibilityCheck.eligible 
            ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10"
            : "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10"
        }`}>
          <Info className={`h-4 w-4 ${
            eligibilityCheck.eligible ? "text-green-600" : "text-yellow-600"
          }`} />
          <AlertDescription className={
            eligibilityCheck.eligible 
              ? "text-green-800 dark:text-green-200"
              : "text-yellow-800 dark:text-yellow-200"
          }>
            <div className="font-medium mb-2">
              {eligibilityCheck.eligible ? "✅ You are eligible for this scheme!" : "⚠️ Eligibility Check"}
            </div>
            <ul className="list-disc list-inside space-y-1">
              {eligibilityCheck.reasons.map((reason, index) => (
                <li key={index}>{reason}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Info */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {scheme.minAge || scheme.maxAge ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Age Range</p>
                  <p className="font-medium">
                    {scheme.minAge || 0} - {scheme.maxAge || "No limit"} years
                  </p>
                </div>
              </div>
            ) : null}

            {scheme.minIncome || scheme.maxIncome ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Income Range</p>
                  <p className="font-medium">
                    ₹{(scheme.minIncome || 0).toLocaleString()} - ₹{(scheme.maxIncome || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : null}

            {scheme.targetStates && scheme.targetStates.length > 0 && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available States</p>
                  <p className="font-medium">{scheme.targetStates.length} states</p>
                </div>
              </div>
            )}

            {scheme.applicationDeadline && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Deadline</p>
                  <p className="font-medium">
                    {new Date(scheme.applicationDeadline).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Eligibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5" />
                <span>{t("eligibility")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: eligibility.replace(/\n/g, '<br />') }} />
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Star className="h-5 w-5" />
                <span>{t("benefits")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: benefits.replace(/\n/g, '<br />') }} />
              </div>
            </CardContent>
          </Card>

          {/* Application Process */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>{t("applicationProcess")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                <div dangerouslySetInnerHTML={{ __html: applicationProcess.replace(/\n/g, '<br />') }} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Required Documents */}
          {scheme.documents && scheme.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>{t("requiredDocuments")}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {scheme.documents.map((doc: string, index: number) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{doc}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {scheme.tags && scheme.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Related Topics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {scheme.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Target Groups */}
          <Card>
            <CardHeader>
              <CardTitle>Target Groups</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {scheme.targetGender && scheme.targetGender !== 'all' && (
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-gray-600" />
                  <span className="text-sm">Gender: {scheme.targetGender}</span>
                </div>
              )}
              
              {scheme.targetOccupations && scheme.targetOccupations.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Target Occupations:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {scheme.targetOccupations.map((occupation: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {occupation}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {scheme.targetStates && scheme.targetStates.length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium">Available States:</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {scheme.targetStates.slice(0, 3).join(", ")}
                    {scheme.targetStates.length > 3 && ` and ${scheme.targetStates.length - 3} more`}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
