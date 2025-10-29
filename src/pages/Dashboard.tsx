import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Activity, LogOut, Settings, Users, Pill, ClipboardList, HeartPulse, Calendar, FlaskConical, Stethoscope } from 'lucide-react';
import { TimelineBar } from '@/components/dashboard/TimelineBar';
import { PatientTaskCard } from '@/components/dashboard/PatientTaskCard';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patientsWithTasks, setPatientsWithTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentNurse, setCurrentNurse] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('dashboard-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchDashboardData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'nurse_logs' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;

    try {
      // Get current nurse
      const { data: nurse } = await supabase
        .from('nurses')
        .select('*, departments(department_name)')
        .eq('email', user.email)
        .single();

      setCurrentNurse(nurse);

      // Get today's date
      const today = new Date().toISOString().split('T')[0];

      // Get all active patients
      const { data: patients, error: patientsError } = await supabase
        .from('patients')
        .select('*')
        .is('discharge_date', null)
        .order('bed_number');

      if (patientsError) throw patientsError;

      // For each patient, get all their tasks for today
      const patientsWithTasksData = await Promise.all(
        (patients || []).map(async (patient) => {
          const { data: allTasks } = await supabase
            .from('tasks')
            .select(`
              *,
              medications(medication_name, dosage),
              investigations(investigation_name),
              procedures(procedure_name),
              routes_of_administration(route_name)
            `)
            .eq('patient_id', patient.patient_id)
            .gte('scheduled_time', `${today}T00:00:00`)
            .lte('scheduled_time', `${today}T23:59:59`)
            .order('scheduled_time');

          // Check which tasks are completed
          const tasksWithCompletion = await Promise.all(
            (allTasks || []).map(async (task) => {
              const { data: log } = await supabase
                .from('nurse_logs')
                .select('log_id')
                .eq('task_id', task.task_id)
                .single();

              return {
                ...task,
                completed_today: !!log,
                item_name: task.task_type === 'Medication' ? task.medications?.medication_name :
                          task.task_type === 'Investigation' ? task.investigations?.investigation_name :
                          task.task_type === 'Procedure' ? task.procedures?.procedure_name :
                          'Vital Signs Checkup',
              };
            })
          );

          // Get assigned nurse for this patient (using first schedule's nurse or default)
          const { data: assignedNurse } = await supabase
            .from('nurses')
            .select('nurse_name')
            .eq('department_id', nurse?.department_id)
            .limit(1)
            .single();

          return {
            patient,
            assignedNurse: assignedNurse?.nurse_name || 'Unassigned',
            tasks: tasksWithCompletion,
          };
        })
      );

      setPatientsWithTasks(patientsWithTasksData);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const quickActions = [
    { title: 'Patients', icon: Users, path: '/patients', color: 'bg-primary' },
    { title: 'All Tasks', icon: ClipboardList, path: '/all-tasks', color: 'bg-chart-5' },
    { title: 'Medications', icon: Pill, path: '/medications', color: 'bg-success' },
    { title: 'Investigations', icon: FlaskConical, path: '/investigations', color: 'bg-chart-3' },
    { title: 'Procedures', icon: Stethoscope, path: '/procedures', color: 'bg-chart-1' },
    { title: 'Vital Signs', icon: HeartPulse, path: '/vital-signs', color: 'bg-warning' },
    { title: 'Schedules', icon: Calendar, path: '/schedules', color: 'bg-chart-2' },
    { title: 'All Logs', icon: ClipboardList, path: '/logs', color: 'bg-chart-4' },
  ];

  if (userRole === 'admin') {
    quickActions.push({ title: 'Admin', icon: Settings, path: '/admin', color: 'bg-destructive' });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Nurse Logging System</h1>
                {currentNurse && (
                  <p className="text-xs text-muted-foreground">
                    {currentNurse.nurse_name} • {currentNurse.departments?.department_name} • {currentNurse.shift} Shift
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Timeline */}
        <TimelineBar />

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.path}
              variant="outline"
              className="h-auto flex-col gap-2 py-4 hover:shadow-md transition-all"
              onClick={() => navigate(action.path)}
            >
              <div className={`h-12 w-12 rounded-lg ${action.color} flex items-center justify-center shadow-sm`}>
                <action.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xs font-medium">{action.title}</span>
            </Button>
          ))}
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Today's Patient Tasks</h2>
            <p className="text-sm text-muted-foreground">
              {patientsWithTasks.length} patients • Click tasks to expand details • Check boxes to mark complete
            </p>
          </div>
        </div>

        {/* Patient Task Cards */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading patients and tasks...</p>
          </div>
        ) : patientsWithTasks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No active patients found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {patientsWithTasks.map(({ patient, assignedNurse, tasks }) => (
              <PatientTaskCard
                key={patient.patient_id}
                patient={patient}
                assignedNurse={assignedNurse}
                tasks={tasks}
                onTaskUpdate={fetchDashboardData}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
