import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Plus,
  Calendar,
  ExternalLink,
  Edit,
  Trash,
  Eye,
  Filter
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { applicationsAPI, schemesAPI } from "../lib/api";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "../lib/queryClient";
import { Link } from "wouter";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "under_review", label: "Under Review", color: "bg-blue-100 text-blue-800" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-800" },
  { value: "rejected", label: "Rejected", color: "bg-red-100 text-red-800" },
];

function ApplicationCard({ application }: { application: any }) {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    status: application.status,
    notes: application.notes || "",
    applicationId: application.applicationId || "",
  });

  const updateApplicationMutation = useMutation({
    mutationFn: (data: { status: string; notes?: string; applicationId?: string }) =>
      applicationsAPI.updateStatus(application.id, data.status, data.notes),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Application updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update application",
        variant: "destructive",
      });
    },
  });

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

  const getStatusColor = (status: string) => {
    const statusOption = STATUS_OPTIONS.find(s => s.value === status);
    return statusOption?.color || "bg-gray-100 text-gray-800";
  };

  const StatusIcon = getStatusIcon(application.status);

  const handleUpdate = () => {
    updateApplicationMutation.mutate({
      status: editData.status,
      notes: editData.notes,
      applicationId: editData.applicationId,
    });
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <StatusIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {application.scheme?.name || "Unknown Scheme"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("applicationId")}: #{application.applicationId || application.id}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(application.status)}>
            {t(application.status)}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("submittedOn")}
            </p>
            <p className="font-medium">
              {application.submittedAt 
                ? new Date(application.submittedAt).toLocaleDateString()
                : new Date(application.createdAt).toLocaleDateString()
              }
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t("lastUpdated")}
            </p>
            <p className="font-medium">
              {new Date(application.lastUpdated || application.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {application.notes && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Notes:</p>
            <p className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
              {application.notes}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-2">
            {application.scheme && (
              <Link href={`/schemes/${application.scheme.id}`}>
                <Button variant="ghost" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Scheme
                </Button>
              </Link>
            )}
            {application.scheme?.officialLink && (
              <Button variant="ghost" size="sm" asChild>
                <a href={application.scheme.officialLink} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Official Site
                </a>
              </Button>
            )}
          </div>

          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                {t("updateStatus")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Application</DialogTitle>
                <DialogDescription>
                  Update the status and details of your application
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={editData.status}
                    onValueChange={(value) => setEditData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="applicationId">Application ID (Optional)</Label>
                  <Input
                    id="applicationId"
                    value={editData.applicationId}
                    onChange={(e) => setEditData(prev => ({ ...prev, applicationId: e.target.value }))}
                    placeholder="Enter official application ID"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={editData.notes}
                    onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Add any notes about this application..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdate}
                    disabled={updateApplicationMutation.isPending}
                  >
                    {updateApplicationMutation.isPending ? "Updating..." : "Update"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}

function AddApplicationDialog() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSchemeId, setSelectedSchemeId] = useState("");
  const [notes, setNotes] = useState("");
  const [applicationId, setApplicationId] = useState("");

  const { data: schemes = [] } = useQuery({
    queryKey: ["/api/schemes"],
    queryFn: () => schemesAPI.getAll(),
  });

  const createApplicationMutation = useMutation({
    mutationFn: (data: { schemeId: number; notes?: string; applicationId?: string }) =>
      applicationsAPI.create(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Application added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setIsOpen(false);
      setSelectedSchemeId("");
      setNotes("");
      setApplicationId("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add application",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!selectedSchemeId) {
      toast({
        title: "Error",
        description: "Please select a scheme",
        variant: "destructive",
      });
      return;
    }

    createApplicationMutation.mutate({
      schemeId: parseInt(selectedSchemeId),
      notes: notes || undefined,
      applicationId: applicationId || undefined,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          {t("addNewApplication")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Application</DialogTitle>
          <DialogDescription>
            Track a new government scheme application
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="scheme">Select Scheme *</Label>
            <Select value={selectedSchemeId} onValueChange={setSelectedSchemeId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a government scheme" />
              </SelectTrigger>
              <SelectContent>
                {schemes.map((scheme: any) => (
                  <SelectItem key={scheme.id} value={scheme.id.toString()}>
                    {scheme.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="applicationId">Official Application ID (Optional)</Label>
            <Input
              id="applicationId"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              placeholder="Enter the official application ID if you have one"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this application..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createApplicationMutation.isPending || !selectedSchemeId}
            >
              {createApplicationMutation.isPending ? "Adding..." : "Add Application"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Applications() {
  const { t } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: applications = [], isLoading, error } = useQuery({
    queryKey: ["/api/applications"],
    queryFn: () => applicationsAPI.getAll(),
  });

  const filteredApplications = applications.filter((app: any) => {
    const matchesStatus = !statusFilter || app.status === statusFilter;
    const matchesSearch = !searchQuery || 
      (app.scheme?.name && app.scheme.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.applicationId && app.applicationId.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesStatus && matchesSearch;
  });

  const getStatusCounts = () => {
    return STATUS_OPTIONS.reduce((counts, status) => {
      counts[status.value] = applications.filter((app: any) => app.status === status.value).length;
      return counts;
    }, {} as Record<string, number>);
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-8 text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Error Loading Applications
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            We're having trouble loading your applications. Please try again later.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("myApplicationsTitle")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track and manage all your government scheme applications
          </p>
        </div>
        <AddApplicationDialog />
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {STATUS_OPTIONS.map((status) => (
          <Card key={status.value} className="hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{status.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {statusCounts[status.value] || 0}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${status.color}`}>
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search" className="sr-only">Search applications</Label>
              <Input
                id="search"
                placeholder="Search by scheme name or application ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label} ({statusCounts[status.value] || 0})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <FileText className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {applications.length === 0 ? "No Applications Yet" : "No Matching Applications"}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {applications.length === 0 ? (
              "Start tracking your government scheme applications to see them here."
            ) : (
              "Try adjusting your search or filter criteria."
            )}
          </p>
          {applications.length === 0 && <AddApplicationDialog />}
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredApplications.map((application: any) => (
            <ApplicationCard key={application.id} application={application} />
          ))}
        </div>
      )}

      {/* Results Summary */}
      {filteredApplications.length > 0 && (
        <div className="mt-6 text-center text-gray-600 dark:text-gray-300">
          Showing {filteredApplications.length} of {applications.length} applications
        </div>
      )}
    </div>
  );
}
