import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  ArrowLeft, 
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle
} from 'lucide-react';

interface Training {
  id: string;
  training_id: string;
  title: string;
  topic: string;
  date: string;
  time: string;
  venue: string;
  speaker: string;
  capacity: number;
  status: string;
}

const AvailableTrainings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [enrolledTrainings, setEnrolledTrainings] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  // Get current user ID from localStorage (in real app, this would come from auth context)
  const getCurrentUserId = () => {
    const userName = localStorage.getItem('userName') || 'officer.two';
    // Map usernames to IDs for demo purposes
    const userIdMap: { [key: string]: string } = {
      'officer.one': '22222222-2222-2222-2222-222222222222',
      'officer.two': '33333333-3333-3333-3333-333333333333',
      'officer.three': '44444444-4444-4444-4444-444444444444',
      'officer.four': '55555555-5555-5555-5555-555555555555'
    };
    return userIdMap[userName] || '33333333-3333-3333-3333-333333333333';
  };

  const loadTrainings = async () => {
    try {
      const { data, error } = await supabase
        .from('trainings')
        .select('*')
        .in('status', ['upcoming', 'ongoing'])
        .order('date', { ascending: true });

      if (error) throw error;
      setTrainings(data || []);
    } catch (error) {
      console.error('Error loading trainings:', error);
      toast({
        title: "Error",
        description: "Failed to load available trainings",
        variant: "destructive",
      });
    }
  };

  const loadEnrolledTrainings = async () => {
    try {
      const currentUserId = getCurrentUserId();
      const { data, error } = await supabase
        .from('training_registrations')
        .select('training_id')
        .eq('officer_id', currentUserId);

      if (error) throw error;
      
      const enrolledIds = new Set(data?.map(reg => reg.training_id) || []);
      setEnrolledTrainings(enrolledIds);
    } catch (error) {
      console.error('Error loading enrolled trainings:', error);
    }
  };

  const handleEnroll = async (trainingId: string) => {
    setEnrollingId(trainingId);
    try {
      const currentUserId = getCurrentUserId();
      
      // Use the database function for enrollment
      const { data, error } = await supabase.rpc('enroll_officer_in_training', {
        p_training_id: trainingId,
        p_officer_id: currentUserId
      });

      if (error) throw error;

      if (data) {
        setEnrolledTrainings(prev => new Set([...prev, trainingId]));
        toast({
          title: "Enrollment Successful",
          description: "You have been enrolled in this training.",
        });
      } else {
        toast({
          title: "Already Enrolled",
          description: "You are already enrolled in this training.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error enrolling in training:', error);
      toast({
        title: "Enrollment Failed",
        description: "Failed to enroll in training. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrollingId(null);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadTrainings(), loadEnrolledTrainings()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ongoing':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading available trainings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/officer-dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Available Trainings</h1>
              <p className="text-sm text-gray-500">Enroll in upcoming training programs</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map((training) => {
            const isEnrolled = enrolledTrainings.has(training.id);
            const isEnrolling = enrollingId === training.id;
            
            return (
              <Card key={training.id} className="h-full flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg line-clamp-2">{training.title}</CardTitle>
                    <Badge className={getStatusColor(training.status)}>
                      {training.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{training.topic}</p>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(training.date).toLocaleDateString()}
                    </div>
                    
                    {training.time && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {training.time}
                      </div>
                    )}
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {training.venue}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      {training.speaker}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      Capacity: {training.capacity}
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    {isEnrolled ? (
                      <div className="flex items-center justify-center py-2 text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <span className="text-sm font-medium">Enrolled</span>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => handleEnroll(training.id)}
                        disabled={isEnrolling}
                        className="w-full"
                      >
                        {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {trainings.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Trainings</h3>
            <p className="text-gray-600">There are currently no upcoming trainings available for enrollment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableTrainings;