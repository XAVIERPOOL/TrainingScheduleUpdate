import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  Edit3,
  Trash2,
  Eye,
  UserPlus,
  Loader2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface TrainingWithRegistrations {
  id: string;
  training_id: string;
  title: string;
  topic: string;
  date: string;
  time: string | null;
  venue: string;
  capacity: number;
  speaker: string;
  status: string;
  registered: number;
}

interface Officer {
  id: string;
  full_name: string;
  cooperative: string | null;
  position: string | null;
  role: string;
  username: string;
}

const TrainingManagement = () => {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [editingTraining, setEditingTraining] = useState<TrainingWithRegistrations | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentDialogOpen, setEnrollmentDialogOpen] = useState(false);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);
  const [enrollmentMethod, setEnrollmentMethod] = useState<string>('manual');
  
  const [formData, setFormData] = useState({
    training_id: '',
    title: '',
    topic: '',
    date: '',
    time: '',
    venue: '',
    capacity: '',
    speaker: '',
    status: 'upcoming'
  });

  const [trainings, setTrainings] = useState<TrainingWithRegistrations[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [enrolledOfficers, setEnrolledOfficers] = useState<any[]>([]);
  const [selectedTrainingEnrollments, setSelectedTrainingEnrollments] = useState<any[]>([]);
  const [viewEnrolledDialogOpen, setViewEnrolledDialogOpen] = useState(false);
  const [selectedTrainingTitle, setSelectedTrainingTitle] = useState<string>('');

  // Load data on component mount
  useEffect(() => {
    loadTrainings();
    loadOfficers();
  }, []);

  const loadTrainings = async () => {
    try {
      const { data: trainingsData, error } = await supabase
        .from('trainings')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      // Get actual registration counts for each training
      const trainingsWithCounts = await Promise.all(
        (trainingsData || []).map(async (training) => {
          try {
            // Count registrations using a basic query
            const { data: registrationData, error: countError } = await supabase
              .from('training_registrations' as any)
              .select('id', { count: 'exact' })
              .eq('training_id', training.id);
            
            const registrationCount = registrationData?.length || 0;
            
            return {
              ...training,
              time: (training as any).time || null,
              registered: registrationCount
            };
          } catch (e) {
            console.warn('Could not load registration count for training:', training.id);
            return {
              ...training,
              time: (training as any).time || null,
              registered: 0
            };
          }
        })
      );

      setTrainings(trainingsWithCounts);
    } catch (error) {
      console.error('Error loading trainings:', error);
      toast({
        title: "Error",
        description: "Failed to load trainings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOfficers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'officer')
        .order('full_name');

      if (error) throw error;
      setOfficers(data || []);
    } catch (error) {
      console.error('Error loading officers:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      training_id: '',
      title: '',
      topic: '',
      date: '',
      time: '',
      venue: '',
      capacity: '',
      speaker: '',
      status: 'upcoming'
    });
    setIsCreating(false);
    setEditingTraining(null);
  };

  const generateTrainingId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TRN-${year}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.date || !formData.venue) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingTraining) {
        // Update existing training
        const { error } = await supabase
          .from('trainings')
          .update({
            title: formData.title,
            topic: formData.topic,
            date: formData.date,
            time: formData.time || null,
            venue: formData.venue,
            capacity: parseInt(formData.capacity) || 30,
            speaker: formData.speaker,
            status: formData.status
          })
          .eq('id', editingTraining.id);

        if (error) throw error;

        toast({
          title: "Training Updated",
          description: `"${formData.title}" has been successfully updated.`,
        });
      } else {
        // Create new training
        const { error } = await supabase
          .from('trainings')
          .insert({
            training_id: generateTrainingId(),
            title: formData.title,
            topic: formData.topic,
            date: formData.date,
            time: formData.time || null,
            venue: formData.venue,
            capacity: parseInt(formData.capacity) || 30,
            speaker: formData.speaker,
            status: formData.status
          });

        if (error) throw error;

        toast({
          title: "Training Event Created",
          description: `"${formData.title}" has been successfully created.`,
        });
      }

      resetForm();
      loadTrainings();
    } catch (error) {
      console.error('Error saving training:', error);
      toast({
        title: "Error",
        description: "Failed to save training event",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (training: TrainingWithRegistrations) => {
    setFormData({
      training_id: training.training_id,
      title: training.title,
      topic: training.topic,
      date: training.date,
      time: training.time || '',
      venue: training.venue,
      capacity: training.capacity.toString(),
      speaker: training.speaker,
      status: training.status
    });
    setEditingTraining(training);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trainings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Training Deleted",
        description: "Training has been successfully deleted.",
      });

      loadTrainings();
    } catch (error) {
      console.error('Error deleting training:', error);
      toast({
        title: "Error",
        description: "Failed to delete training",
        variant: "destructive",
      });
    }
  };

  const handleEnrollOfficer = async (officerId: string) => {
    if (!selectedTrainingId) return;

    try {
      // Use the database function for enrollment
      const { data, error } = await supabase.rpc('enroll_officer_in_training', {
        p_training_id: selectedTrainingId,
        p_officer_id: officerId
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Officer Enrolled",
          description: "Officer successfully enrolled in training.",
        });

        setEnrollmentDialogOpen(false);
        loadTrainings();
      } else {
        toast({
          title: "Already Enrolled",
          description: "This officer is already enrolled in this training.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error enrolling officer:', error);
      toast({
        title: "Error",
        description: "Failed to enroll officer",
        variant: "destructive",
      });
    }
  };

  const loadEnrolledOfficers = async (trainingId: string) => {
    try {
      const { data, error } = await supabase
        .from('training_registrations' as any)
        .select(`
          id,
          registered_at,
          officer_id,
          profiles!inner(*)
        `)
        .eq('training_id', trainingId);

      if (error) {
        console.error('Error loading enrolled officers:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error loading enrolled officers:', error);
      return [];
    }
  };

  const handleViewEnrolled = async (trainingId: string) => {
    const enrolled = await loadEnrolledOfficers(trainingId);
    setSelectedTrainingEnrollments(enrolled);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading trainings...</span>
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
              onClick={() => navigate('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Training & Seminar Management</h1>
              <p className="text-sm text-gray-500">Create and manage training events</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!isCreating ? (
          <>
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Training Events</h2>
                <p className="text-gray-600">Manage your cooperative training programs</p>
              </div>
              <Button 
                onClick={() => setIsCreating(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Training
              </Button>
            </div>

            {/* Training Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {trainings.map((training) => (
                <Card key={training.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className={getStatusColor(training.status)}>
                        {training.status}
                      </Badge>
                      <span className="text-sm text-gray-500">{training.topic}</span>
                    </div>
                    <CardTitle className="text-lg">{training.title}</CardTitle>
                    <CardDescription className="text-sm">
                      ID: {training.training_id}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        {new Date(training.date).toLocaleDateString()} 
                        {training.time && ` at ${training.time}`}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {training.venue}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {training.registered}/{training.capacity} registered
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        Speaker: {training.speaker}
                      </div>
                    </div>

                    <div className="flex justify-between mt-4 pt-4 border-t">
                      <Dialog open={viewEnrolledDialogOpen} onOpenChange={setViewEnrolledDialogOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setSelectedTrainingTitle(training.title);
                              handleViewEnrolled(training.id);
                              setViewEnrolledDialogOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View Enrolled
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Enrolled Officers</DialogTitle>
                            <DialogDescription>
                              Officers enrolled in {selectedTrainingTitle}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {selectedTrainingEnrollments.map((enrollment) => (
                              <div key={enrollment.id} className="flex items-center justify-between p-2 border rounded">
                                <div>
                                  <p className="font-medium">{enrollment.profiles?.full_name || 'Unknown Officer'}</p>
                                  <p className="text-sm text-gray-500">{enrollment.profiles?.cooperative || 'No cooperative'}</p>
                                </div>
                                <div className="text-right">
                                  <Badge variant="outline">{enrollment.profiles?.position || 'Officer'}</Badge>
                                  {enrollment.registered_at && (
                                    <p className="text-xs text-gray-400 mt-1">
                                      Enrolled: {new Date(enrollment.registered_at).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                            {selectedTrainingEnrollments.length === 0 && (
                              <p className="text-gray-500 text-center py-4">No officers enrolled yet</p>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <div className="flex space-x-2">
                        <Dialog open={enrollmentDialogOpen} onOpenChange={setEnrollmentDialogOpen}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedTrainingId(training.id)}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Enroll Officer</DialogTitle>
                              <DialogDescription>
                                Select an officer to enroll in {training.title}
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                              <div>
                                <Label>Enrollment Method</Label>
                                <Select value={enrollmentMethod} onValueChange={setEnrollmentMethod}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="manual">Manual Entry</SelectItem>
                                    <SelectItem value="qr">QR Code Scan</SelectItem>
                                    <SelectItem value="nfc">NFC Tap</SelectItem>
                                    <SelectItem value="biometric">Biometric</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="space-y-2 max-h-60 overflow-y-auto">
                                {officers.map((officer) => (
                                  <div key={officer.id} className="flex items-center justify-between p-2 border rounded">
                                    <div>
                                      <p className="font-medium">{officer.full_name}</p>
                                      <p className="text-sm text-gray-500">{officer.cooperative || 'No cooperative'}</p>
                                    </div>
                                    <Button 
                                      size="sm"
                                      onClick={() => handleEnrollOfficer(officer.id)}
                                    >
                                      Enroll
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEdit(training)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(training.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          /* Create/Edit Training Form */
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>
                {editingTraining ? 'Edit Training Event' : 'Create New Training Event'}
              </CardTitle>
              <CardDescription>
                {editingTraining 
                  ? 'Update the training event details below'
                  : 'Fill in the details below to create a new training session'
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Training Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Financial Management Basics"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="topic">Topic</Label>
                    <Input
                      id="topic"
                      value={formData.topic}
                      onChange={(e) => setFormData({...formData, topic: e.target.value})}
                      placeholder="e.g., Finance, Governance"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="venue">Venue *</Label>
                    <Input
                      id="venue"
                      value={formData.venue}
                      onChange={(e) => setFormData({...formData, venue: e.target.value})}
                      placeholder="e.g., Conference Room A"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                      placeholder="Maximum participants (default: 30)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="speaker">Speaker/Facilitator</Label>
                    <Input
                      id="speaker"
                      value={formData.speaker}
                      onChange={(e) => setFormData({...formData, speaker: e.target.value})}
                      placeholder="e.g., Dr. Maria Santos"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {editingTraining ? 'Update Training Event' : 'Create Training Event'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TrainingManagement;