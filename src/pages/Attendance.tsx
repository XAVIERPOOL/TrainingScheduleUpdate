import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft, 
  QrCode, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  UserCheck,
  Loader2,
  Search
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Training {
  id: string;
  title: string;
  date: string;
  time: string | null;
  venue: string;
  capacity: number;
  status: string;
  training_id: string;
}

interface EnrolledOfficer {
  id: string;
  officer_id: string;
  training_id: string;
  registered_at: string;
  profiles: {
    id: string;
    full_name: string;
    cooperative: string | null;
    position: string | null;
    username: string;
  };
  attendance?: {
    id: string;
    recorded_at: string;
    method: string;
    check_in_time: string | null;
  };
}

const Attendance = () => {
  const navigate = useNavigate();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [attendanceMethod, setAttendanceMethod] = useState<'qr' | 'manual' | 'nfc' | 'biometric'>('manual');
  const [loading, setLoading] = useState(true);
  const [markingAttendance, setMarkingAttendance] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [activeEvents, setActiveEvents] = useState<Training[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Training[]>([]);
  const [enrolledOfficers, setEnrolledOfficers] = useState<EnrolledOfficer[]>([]);

  useEffect(() => {
    loadTrainings();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      loadEnrolledOfficers(selectedEvent);
    }
  }, [selectedEvent]);

  const loadTrainings = async () => {
    try {
      const { data: trainings, error } = await supabase
        .from('trainings')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      const today = new Date().toISOString().split('T')[0];
      
      const active = trainings?.filter(t => t.status === 'ongoing').map(t => ({
        ...t,
        time: (t as any).time || null
      })) || [];
      const upcoming = trainings?.filter(t => t.status === 'upcoming' && t.date >= today).map(t => ({
        ...t,
        time: (t as any).time || null
      })) || [];
      
      setActiveEvents(active);
      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error('Error loading trainings:', error);
      toast({
        title: "Error",
        description: "Failed to load training events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadEnrolledOfficers = async (trainingId: string) => {
    try {
      setLoading(true);
      
      // Simplified approach to avoid type issues
      const { data: registrations } = await supabase
        .from('training_registrations' as any)
        .select('*')
        .eq('training_id', trainingId);

      if (!registrations) {
        setEnrolledOfficers([]);
        return;
      }

      // Get profiles for enrolled officers
      const officerIds = registrations.map((reg: any) => reg.officer_id);
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', officerIds);

      // Get attendance records
      const { data: attendanceRecords } = await supabase
        .from('attendance')
        .select('*')
        .eq('training_id', trainingId);

      // Combine the data
      const enrichedOfficers = registrations.map((reg: any) => {
        const profile = profiles?.find(p => p.id === reg.officer_id);
        const attendance = attendanceRecords?.find(att => att.officer_id === reg.officer_id);
        
        return {
          id: reg.id,
          officer_id: reg.officer_id,
          training_id: reg.training_id,
          registered_at: reg.registered_at,
          profiles: profile || {
            id: reg.officer_id,
            full_name: 'Unknown Officer',
            cooperative: null,
            position: null,
            username: 'unknown'
          },
          attendance: attendance ? {
            id: attendance.id,
            recorded_at: attendance.recorded_at,
            method: attendance.method || 'manual',
            check_in_time: attendance.recorded_at ? new Date(attendance.recorded_at).toTimeString().split(' ')[0] : null
          } : null
        };
      });

      setEnrolledOfficers(enrichedOfficers);
    } catch (error) {
      console.error('Error loading enrolled officers:', error);
      toast({
        title: "Error",
        description: "Failed to load enrolled officers",
        variant: "destructive",
      });
      setEnrolledOfficers([]);
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (officerId: string, present: boolean) => {
    if (!selectedEvent) return;

    try {
      setMarkingAttendance(true);

      if (present) {
        // Mark as present - insert attendance record
        const { error } = await supabase
          .from('attendance')
          .upsert({
            officer_id: officerId,
            training_id: selectedEvent,
            recorded_at: new Date().toISOString(),
            method: attendanceMethod
          }, {
            onConflict: 'officer_id,training_id'
          });

        if (error) throw error;

        toast({
          title: "Marked Present",
          description: "Officer has been marked as present.",
        });
      } else {
        // Mark as absent - remove attendance record
        const { error } = await supabase
          .from('attendance')
          .delete()
          .eq('officer_id', officerId)
          .eq('training_id', selectedEvent);

        if (error) throw error;

        toast({
          title: "Marked Absent",
          description: "Officer has been marked as absent.",
        });
      }

      // Reload attendance data
      loadEnrolledOfficers(selectedEvent);
    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: "Error",
        description: "Failed to update attendance",
        variant: "destructive",
      });
    } finally {
      setMarkingAttendance(false);
    }
  };

  const generateQRCode = () => {
    if (!selectedEvent) return;
    
    const qrData = {
      type: 'training_attendance',
      training_id: selectedEvent,
      timestamp: Date.now()
    };
    
    toast({
      title: "QR Code Generated",
      description: "Officers can scan this QR code to mark their attendance.",
    });
    
    console.log('QR Code Data:', JSON.stringify(qrData));
  };

  const selectedEventData = selectedEvent ? 
    [...activeEvents, ...upcomingEvents].find(e => e.id === selectedEvent) : null;

  const filteredOfficers = enrolledOfficers.filter(officer =>
    officer.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    officer.profiles.cooperative?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const presentCount = enrolledOfficers.filter(o => o.attendance).length;
  const totalCount = enrolledOfficers.length;

  if (loading && !selectedEvent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading training events...</span>
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
              <h1 className="text-xl font-bold text-gray-900">Attendance Management</h1>
              <p className="text-sm text-gray-500">Track and manage training attendance</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedEvent ? (
          <>
            {/* Event Selection */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Training Event</h2>
              
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="active">Active Events ({activeEvents.length})</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming Events ({upcomingEvents.length})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="active" className="space-y-4">
                  {activeEvents.length > 0 ? (
                    activeEvents.map((event) => (
                      <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedEvent(event.id)}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">ID: {event.training_id}</p>
                              <Badge className="bg-green-100 text-green-800">
                                <Clock className="h-3 w-3 mr-1" />
                                Currently Active
                              </Badge>
                            </div>
                            <Button>Take Attendance</Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              {new Date(event.date).toLocaleDateString()} 
                              {event.time && ` at ${event.time}`}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {event.venue}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              Capacity: {event.capacity}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Events</h3>
                        <p className="text-gray-600">There are no currently active training events.</p>
                        <Button 
                          onClick={() => navigate('/training-management')} 
                          className="mt-4"
                        >
                          Create Training Event
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
                
                <TabsContent value="upcoming" className="space-y-4">
                  {upcomingEvents.length > 0 ? (
                    upcomingEvents.map((event) => (
                      <Card key={event.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedEvent(event.id)}>
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">ID: {event.training_id}</p>
                              <Badge className="bg-blue-100 text-blue-800">
                                Upcoming
                              </Badge>
                            </div>
                            <Button variant="outline">Prepare Attendance</Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              {new Date(event.date).toLocaleDateString()}
                              {event.time && ` at ${event.time}`}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2" />
                              {event.venue}
                            </div>
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-2" />
                              Capacity: {event.capacity}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Upcoming Events</h3>
                        <p className="text-gray-600">There are no upcoming training events scheduled.</p>
                        <Button 
                          onClick={() => navigate('/training-management')} 
                          className="mt-4"
                        >
                          Create Training Event
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          /* Attendance Management Interface */
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedEvent(null)}
                  className="mb-2"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Events
                </Button>
                <h2 className="text-2xl font-bold text-gray-900">{selectedEventData?.title}</h2>
                <p className="text-gray-600">
                  {selectedEventData && new Date(selectedEventData.date).toLocaleDateString()} • {selectedEventData?.venue}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {presentCount}/{totalCount}
                </div>
                <p className="text-sm text-gray-600">Attendees Present</p>
                {totalCount > 0 && (
                  <div className="w-32 h-2 bg-gray-200 rounded-full mt-1">
                    <div
                      className="h-2 bg-green-500 rounded-full transition-all duration-300"
                      style={{ width: `${(presentCount / totalCount) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Attendance Method Selection */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Attendance Method</CardTitle>
                  <CardDescription>Choose how to track attendance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Select value={attendanceMethod} onValueChange={(value: any) => setAttendanceMethod(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual Check-in</SelectItem>
                        <SelectItem value="qr">QR Code Scan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {attendanceMethod === 'qr' && (
                    <div className="mt-6 p-4 border rounded-lg text-center">
                      <div className="w-32 h-32 bg-gray-200 mx-auto mb-4 rounded-lg flex items-center justify-center">
                        <QrCode className="h-16 w-16 text-gray-400" />
                      </div>
                      <Button onClick={generateQRCode} className="w-full mb-2">
                        Generate QR Code
                      </Button>
                      <p className="text-xs text-gray-600">
                        Officers can scan this code to mark attendance
                      </p>
                    </div>
                  )}

                  {(attendanceMethod === 'nfc' || attendanceMethod === 'biometric') && (
                    <div className="mt-6 p-4 border rounded-lg text-center">
                      <div className="w-32 h-32 bg-gray-200 mx-auto mb-4 rounded-lg flex items-center justify-center">
                        <UserCheck className="h-16 w-16 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-600">
                        {attendanceMethod === 'nfc' 
                          ? 'Ready for NFC device scanning'
                          : 'Ready for biometric verification'
                        }
                      </p>
                    </div>
                  )}

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Quick Stats</h4>
                    <div className="space-y-1 text-sm text-blue-800">
                      <div className="flex justify-between">
                        <span>Total Enrolled:</span>
                        <span>{totalCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Present:</span>
                        <span>{presentCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Absent:</span>
                        <span>{totalCount - presentCount}</span>
                      </div>
                      <div className="flex justify-between font-medium">
                        <span>Attendance Rate:</span>
                        <span>{totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attendee List */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Enrolled Officers ({totalCount})</CardTitle>
                      <CardDescription>
                        {attendanceMethod === 'manual' ? 'Click to mark attendance manually' : 'Real-time attendance tracking'}
                      </CardDescription>
                    </div>
                    <div className="relative w-64">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search officers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Loading enrolled officers...
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {filteredOfficers.length > 0 ? (
                        filteredOfficers.map((enrollment) => (
                          <div key={enrollment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{enrollment.profiles.full_name}</h4>
                              <p className="text-sm text-gray-600">{enrollment.profiles.cooperative || 'No cooperative'}</p>
                              <p className="text-xs text-gray-500">
                                Position: {enrollment.profiles.position || 'N/A'} • 
                                Enrolled: {new Date(enrollment.registered_at).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              {enrollment.attendance ? (
                                <div className="text-right">
                                  <div className="flex items-center text-green-600">
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Present
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {enrollment.attendance.check_in_time && 
                                      `${enrollment.attendance.check_in_time} • ${enrollment.attendance.method}`
                                    }
                                  </p>
                                </div>
                              ) : (
                                <div className="flex items-center text-gray-400">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Not checked in
                                </div>
                              )}
                              
                              {attendanceMethod === 'manual' && (
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    variant={enrollment.attendance ? "outline" : "default"}
                                    onClick={() => markAttendance(enrollment.officer_id, true)}
                                    disabled={markingAttendance}
                                  >
                                    Present
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => markAttendance(enrollment.officer_id, false)}
                                    disabled={markingAttendance}
                                  >
                                    Absent
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            {searchTerm ? 'No officers found' : 'No officers enrolled'}
                          </h3>
                          <p className="text-gray-600 mb-4">
                            {searchTerm 
                              ? 'Try adjusting your search terms'
                              : 'Officers need to be enrolled in this training first'
                            }
                          </p>
                          {!searchTerm && (
                            <Button 
                              onClick={() => navigate('/training-management')}
                              variant="outline"
                            >
                              Manage Enrollments
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Attendance;