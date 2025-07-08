
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  BarChart3, 
  UserCheck, 
  LogOut,
  GraduationCap,
  Clock,
  CheckCircle,
  AlertTriangle,
  User
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Dashboard = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole') || 'officer';
  const userName = localStorage.getItem('userName') || 'User';

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
    navigate('/login');
  };

  // Mock stats - in a real app, these would come from an API
  const stats = {
    totalOfficers: 145,
    compliantOfficers: 89,
    pendingTrainings: 12,
    upcomingEvents: 5,
    myCompliance: 75 // For officer view
  };

  const adminCards = [
    {
      title: "Officer Compliance",
      description: "Track and manage officer training compliance",
      icon: UserCheck,
      route: "/compliance-tracker",
      stats: `${stats.compliantOfficers}/${stats.totalOfficers} Compliant`,
      color: "text-green-600"
    },
    {
      title: "Training Management",
      description: "Create and manage training events",
      icon: BookOpen,
      route: "/training-management",
      stats: `${stats.pendingTrainings} Pending`,
      color: "text-blue-600"
    },
    {
      title: "Attendance Tracking",
      description: "Monitor event attendance and participation",
      icon: Calendar,
      route: "/attendance",
      stats: `${stats.upcomingEvents} Upcoming`,
      color: "text-purple-600"
    },
    {
      title: "Reports & Analytics",
      description: "View comprehensive reports and insights",
      icon: BarChart3,
      route: "/reports",
      stats: "Coming Soon",
      color: "text-orange-600"
    }
  ];

  const officerCards = [
    {
      title: "My Compliance Dashboard",
      description: "View your training compliance status and requirements",
      icon: User,
      route: "/officer-dashboard",
      stats: `${stats.myCompliance}% Complete`,
      color: stats.myCompliance >= 90 ? "text-green-600" : stats.myCompliance >= 50 ? "text-yellow-600" : "text-red-600"
    },
    {
      title: "Available Trainings",
      description: "Browse available training events and register",
      icon: BookOpen,
      route: "/training-management",
      stats: `${stats.upcomingEvents} Available`,
      color: "text-blue-600"
    },
    {
      title: "My Attendance",
      description: "View your training attendance history",
      icon: Calendar,
      route: "/attendance",
      stats: "View History",
      color: "text-purple-600"
    }
  ];

  const cards = userRole === 'administrator' ? adminCards : officerCards;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-lg mr-3">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">CoopWise</h1>
                <p className="text-sm text-gray-500">Training & Seminar Management</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">Welcome, {userName}</p>
                <Badge variant="outline" className="text-xs">
                  {userRole === 'administrator' ? 'Administrator' : 'Officer'}
                </Badge>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {userRole === 'administrator' ? 'Administrator Dashboard' : 'Officer Dashboard'}
          </h2>
          <p className="text-gray-600">
            {userRole === 'administrator' 
              ? 'Manage cooperative training programs and monitor compliance across all officers.'
              : 'Track your training progress and stay up to date with compliance requirements.'
            }
          </p>
        </div>

        {/* Quick Stats for Officers */}
        {userRole === 'officer' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">{stats.myCompliance}%</div>
                <p className="text-sm text-gray-600">Compliance Rate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">3</div>
                <p className="text-sm text-gray-600">Completed Trainings</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-red-600 mb-2">2</div>
                <p className="text-sm text-gray-600">Missing Requirements</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Overview Stats for Admins */}
        {userRole === 'administrator' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Officers</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalOfficers}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Compliant</p>
                    <p className="text-2xl font-bold text-green-600">{stats.compliantOfficers}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Trainings</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pendingTrainings}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Upcoming Events</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.upcomingEvents}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(card.route)}>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <card.icon className={`h-8 w-8 ${card.color}`} />
                  <Badge variant="secondary" className="text-xs">
                    {card.stats}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <CardDescription className="text-sm">
                  {card.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button className="w-full" variant="outline">
                  Access Module
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Activity for Officers */}
        {userRole === 'officer' && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium">Completed: Ethics Training</p>
                    <p className="text-xs text-gray-600">Completed on Dec 1, 2023</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium">Pending: Financial Management Training</p>
                    <p className="text-xs text-gray-600">Deadline: Jan 15, 2024</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
