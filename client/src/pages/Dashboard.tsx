import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  GraduationCap,
  Briefcase,
  Heart,
  ArrowRight,
  TrendingUp,
  Users,
  Building,
  Info
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../context/LanguageContext";
import { dashboardAPI, schemesAPI, applicationsAPI, notificationsAPI } from "../lib/api";

interface DashboardStats {
  totalApplications: number;
  approvedApplications: number;
  pendingApplications: number;
  upcomingDeadlines: number;
  eligibleSchemes: number;
}

function StatsCard({ icon: Icon, title, value, color }: {
  icon: any;
  title: string;
  value: number;
  color: string;
}) {
  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SchemeCard({ scheme, matchPercentage }: { scheme: any; matchPercentage: number }) {
  const { t, language } = useLanguage();
  
  const getIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'education':
        return GraduationCap;
      case 'business':
        return Briefcase;
      case 'health':
        return Heart;
      default:
        return Building;
    }
  };

  const Icon = getIcon(scheme.category);
  const name = language === "hi" && scheme.nameHindi ? scheme.nameHindi : scheme.name;
  const description = language === "hi" && scheme.descriptionHindi ? scheme.descriptionHindi : scheme.description;

  return (
    <Card className="scheme-card cursor-pointer hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            {matchPercentage}% {t("match")}
          </Badge>
        </div>
        
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {name}
        </h4>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
          {description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              {t(scheme.category.toLowerCase())}
            </Badge>
            {scheme.targetGender && scheme.targetGender !== 'all' && (
              <Badge variant="outline" className="text-xs">
                {scheme.targetGender}
              </Badge>
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

function ApplicationItem({ application }: { application: any }) {
  const { t } = useLanguage();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return CheckCircle;
      case 'pending':
        return Clock;
      case 'under_review':
        return FileText;
      case 'rejected':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  const StatusIcon = getStatusIcon(application.status);

  return (
    <div className="flex items-center space-x-4 p-4 border border-gray-100 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
        <StatusIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 dark:text-white">
          {application.scheme?.name || "Unknown Scheme"}
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t("applicationId")}: #{application.applicationId || application.id}
        </p>
      </div>
      <Badge className={getStatusColor(application.status)}>
        {t(application.status)}
      </Badge>
    </div>
  );
}

function NotificationItem({ notification }: { notification: any }) {
  const { t, language } = useLanguage();
  
  const title = language === "hi" && notification.titleHindi 
    ? notification.titleHindi 
    : notification.title;
  const message = language === "hi" && notification.messageHindi 
    ? notification.messageHindi 
    : notification.message;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'scheme_match':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800';
      case 'deadline_reminder':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800';
      case 'status_update':
        return 'bg-green-50 border-green-200 dark:bg-green-900/10 dark:border-green-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/10 dark:border-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'scheme_match':
        return Info;
      case 'deadline_reminder':
        return AlertTriangle;
      case 'status_update':
        return CheckCircle;
      default:
        return Info;
    }
  };

  const TypeIcon = getTypeIcon(notification.type);

  return (
    <div className={`flex items-start space-x-4 p-4 border rounded-lg ${getTypeColor(notification.type)}`}>
      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
        <TypeIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 dark:text-white text-sm">{title}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{message}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {new Date(notification.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    queryFn: () => dashboardAPI.getStats(),
  });

  const { data: recommendedSchemes = [], isLoading: schemesLoading } = useQuery({
    queryKey: ["/api/schemes/recommended"],
    queryFn: () => schemesAPI.getRecommended(),
  });

  const { data: applications = [], isLoading: applicationsLoading } = useQuery({
    queryKey: ["/api/applications"],
    queryFn: () => applicationsAPI.getAll(),
  });

  const { data: notifications = [], isLoading: notificationsLoading } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: () => notificationsAPI.getAll(),
  });

  if (!user) return null;

  // Calculate match percentages for schemes (simplified algorithm)
  const schemesWithMatch = recommendedSchemes.map((scheme: any) => {
    let matchScore = 70; // Base score
    
    // Age matching
    if (user.age && scheme.minAge && scheme.maxAge) {
      if (user.age >= scheme.minAge && user.age <= scheme.maxAge) {
        matchScore += 15;
      }
    }
    
    // Income matching
    if (user.income && scheme.minIncome && scheme.maxIncome) {
      if (user.income >= scheme.minIncome && user.income <= scheme.maxIncome) {
        matchScore += 10;
      }
    }
    
    // State matching
    if (user.state && scheme.targetStates?.includes(user.state)) {
      matchScore += 5;
    }

    return {
      ...scheme,
      matchPercentage: Math.min(matchScore, 95)
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary to-blue-700 rounded-2xl p-8 mb-8 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-3xl font-bold mb-2 font-hindi">
              {t("welcomeUser")} {user.firstName}! 🙏
            </h2>
            <p className="text-blue-100 text-lg">{t("discoverSchemes")}</p>
            <div className="mt-4 flex flex-wrap gap-4">
              {user.age && (
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <span className="text-sm">{t("age")}: <strong>{user.age}</strong></span>
                </div>
              )}
              {user.income && (
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <span className="text-sm">{t("income")}: <strong>₹{user.income.toLocaleString()}/year</strong></span>
                </div>
              )}
              {user.state && (
                <div className="bg-white/20 rounded-lg px-4 py-2">
                  <span className="text-sm">{t("state")}: <strong>{t(user.state.toLowerCase().replace(/\s+/g, ''))}</strong></span>
                </div>
              )}
            </div>
          </div>
          <div className="text-center">
            {statsLoading ? (
              <Skeleton className="h-16 w-16 rounded-lg bg-white/20" />
            ) : (
              <div className="text-4xl font-bold">{stats?.eligibleSchemes || 0}</div>
            )}
            <div className="text-blue-100">{t("eligibleSchemes")}</div>
            <Link href="/schemes">
              <Button className="mt-4 bg-white text-primary hover:bg-gray-50">
                {t("viewAll")} <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatsCard
              icon={FileText}
              title={t("applicationsTracked")}
              value={stats?.totalApplications || 0}
              color="bg-blue-500"
            />
            <StatsCard
              icon={CheckCircle}
              title={t("approved")}
              value={stats?.approvedApplications || 0}
              color="bg-green-500"
            />
            <StatsCard
              icon={Clock}
              title={t("pending")}
              value={stats?.pendingApplications || 0}
              color="bg-yellow-500"
            />
            <StatsCard
              icon={AlertTriangle}
              title={t("deadlinesThisWeek")}
              value={stats?.upcomingDeadlines || 0}
              color="bg-red-500"
            />
          </>
        )}
      </div>

      {/* Recommended Schemes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t("recommendedForYou")}
          </h3>
          <Link href="/schemes">
            <Button variant="outline">
              {t("viewAll")} <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {schemesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : schemesWithMatch.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Recommended Schemes
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Complete your profile to get personalized scheme recommendations.
              </p>
              <Link href="/profile">
                <Button>Complete Profile</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemesWithMatch.slice(0, 3).map((scheme: any) => (
              <SchemeCard 
                key={scheme.id} 
                scheme={scheme} 
                matchPercentage={scheme.matchPercentage}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Applications & Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">
                {t("myApplications")}
              </CardTitle>
              <Link href="/applications">
                <Button variant="ghost" size="sm">
                  {t("viewAll")}
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {applicationsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  No applications yet. Start by applying to recommended schemes.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.slice(0, 3).map((application: any) => (
                  <ApplicationItem key={application.id} application={application} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">
                {t("notifications")}
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => notificationsAPI.markAllRead()}>
                {t("markAllRead")}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {notificationsLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8">
                <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300">
                  {t("noNotifications")}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.slice(0, 3).map((notification: any) => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
