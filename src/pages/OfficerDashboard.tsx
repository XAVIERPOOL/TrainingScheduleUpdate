
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  User,
  Mail,
  Calendar,
  FileText
} from 'lucide-react';

interface Officer {
  id: number;
  name: string;
  email: string;
  cooperative: string;
  position: string;
  complianceRate: number;
  status: string;
  lastTraining: string;
  missingRequirements: string[];
  completedTrainings: number;
  requiredTrainings: number;
}

const OfficerDashboard = () => {
  const navigate = useNavigate();
  
  // Get current user info from localStorage (in a real app, this would come from auth context)
  const userEmail = localStorage.getItem('userName') + '@coopwise.com' || 'officer@coopwise.com';
  
  // Mock data - in a real app, this would be filtered by the current user
  const currentOfficer: Officer = {
    id: 2,
    name: 'Maria Elena Rodriguez',
    email: userEmail,
    cooperative: 'Naciatransco Coop',
    position: 'Secretary',
    complianceRate: 60,
    status: 'partial',
    lastTraining: '2023-11-15',
    missingRequirements: ['Financial Management', 'Governance Training'],
    completedTrainings: 3,
    requiredTrainings: 5
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partial':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'non-compliant':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">My Compliance Dashboard</h1>
              <p className="text-sm text-gray-500">View your training compliance status</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Officer Profile Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-3 rounded-full mr-4">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{currentOfficer.name}</h2>
                  <p className="text-gray-600 flex items-center mt-1">
                    <Mail className="h-4 w-4 mr-2" />
                    {currentOfficer.email}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor(currentOfficer.status)}>
                {getStatusIcon(currentOfficer.status)}
                <span className="ml-1 capitalize">{currentOfficer.status.replace('-', ' ')}</span>
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <p><strong>Cooperative:</strong> {currentOfficer.cooperative}</p>
              <p><strong>Position:</strong> {currentOfficer.position}</p>
              <p className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <strong>Last Training:</strong> {new Date(currentOfficer.lastTraining).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{currentOfficer.complianceRate}%</div>
              <p className="text-sm text-gray-600">Overall Compliance</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{currentOfficer.completedTrainings}</div>
              <p className="text-sm text-gray-600">Completed Trainings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">{currentOfficer.missingRequirements.length}</div>
              <p className="text-sm text-gray-600">Missing Requirements</p>
            </CardContent>
          </Card>
        </div>

        {/* Progress Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Progress</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Completion Progress</span>
                <span className="text-sm text-gray-600">{currentOfficer.completedTrainings}/{currentOfficer.requiredTrainings}</span>
              </div>
              <Progress value={currentOfficer.complianceRate} className="h-3" />
              <p className="text-xs text-gray-600">
                You have completed {currentOfficer.completedTrainings} out of {currentOfficer.requiredTrainings} required trainings
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Missing Requirements */}
        {currentOfficer.missingRequirements.length > 0 ? (
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                Missing Requirements
              </h3>
              <div className="space-y-3">
                {currentOfficer.missingRequirements.map((requirement, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-red-600 mr-2" />
                      <span className="text-sm font-medium text-red-800">{requirement}</span>
                    </div>
                    <Badge variant="outline" className="text-red-600 border-red-300">
                      Required
                    </Badge>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800 mb-3">
                  <strong>Next Steps:</strong> Browse and enroll in available training programs to complete your requirements.
                </p>
                <Button 
                  onClick={() => navigate('/available-trainings')}
                  className="w-full"
                >
                  View Available Trainings
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All Requirements Complete!</h3>
              <p className="text-gray-600">Congratulations! You have met all training requirements.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default OfficerDashboard;
