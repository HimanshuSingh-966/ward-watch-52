import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, MapPin, Calendar } from 'lucide-react';
import { TaskItem } from './TaskItem';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface PatientTaskCardProps {
  patient: any;
  assignedNurse: string;
  tasks: any[];
  onTaskUpdate: () => void;
}

export const PatientTaskCard = ({ patient, assignedNurse, tasks, onTaskUpdate }: PatientTaskCardProps) => {
  const { toast } = useToast();
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());

  const handleTaskComplete = async (scheduleId: string, completed: boolean) => {
    if (completingTasks.has(scheduleId)) return;
    
    setCompletingTasks(new Set(completingTasks).add(scheduleId));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get nurse_id from user email
      const { data: nurse } = await supabase
        .from('nurses')
        .select('nurse_id')
        .eq('email', user.email)
        .single();

      if (!nurse) throw new Error('Nurse record not found');

      if (completed) {
        // Find the schedule to get medication details
        const schedule = tasks.find(t => t.schedule_id === scheduleId);
        
        // Insert into nurse_logs
        const { error } = await supabase.from('nurse_logs').insert([{
          patient_id: patient.patient_id,
          nurse_id: nurse.nurse_id,
          medication_id: schedule.medication_id,
          route_id: schedule.route_id,
          administration_time: new Date().toISOString(),
          dosage_given: schedule.medications?.dosage || '',
          remarks: 'Completed from dashboard',
          status: 'administered',
        }]);

        if (error) throw error;
        
        toast({ 
          title: 'Task Completed', 
          description: 'Medication administered successfully' 
        });
      } else {
        // Delete the most recent log for this schedule
        const { data: recentLog } = await supabase
          .from('nurse_logs')
          .select('log_id')
          .eq('patient_id', patient.patient_id)
          .eq('medication_id', tasks.find(t => t.schedule_id === scheduleId)?.medication_id)
          .order('administration_time', { ascending: false })
          .limit(1)
          .single();

        if (recentLog) {
          await supabase.from('nurse_logs').delete().eq('log_id', recentLog.log_id);
        }
        
        toast({ 
          title: 'Task Unmarked', 
          description: 'Medication marked as incomplete' 
        });
      }

      onTaskUpdate();
    } catch (error: any) {
      toast({ 
        title: 'Error', 
        description: error.message, 
        variant: 'destructive' 
      });
    } finally {
      const newSet = new Set(completingTasks);
      newSet.delete(scheduleId);
      setCompletingTasks(newSet);
    }
  };

  const isTaskCompleted = (task: any) => {
    return task.completed_today || false;
  };

  const isTaskDueSoon = (scheduledTime: string) => {
    const now = new Date();
    const [hours, minutes] = scheduledTime.split(':');
    const taskTime = new Date();
    taskTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    const diff = taskTime.getTime() - now.getTime();
    return diff > 0 && diff <= 30 * 60 * 1000; // Within 30 minutes
  };

  const isTaskOverdue = (scheduledTime: string) => {
    const now = new Date();
    const [hours, minutes] = scheduledTime.split(':');
    const taskTime = new Date();
    taskTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return now.getTime() > taskTime.getTime();
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <CardTitle className="text-xl flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {patient.patient_name}
            </CardTitle>
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>Bed: {patient.bed_number}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{patient.age}y, {patient.gender}</span>
              </div>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            Nurse: {assignedNurse}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No tasks scheduled</p>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.schedule_id}
              type="medication"
              scheduledTime={task.scheduled_time}
              details={{
                medication_name: task.medications?.medication_name,
                dosage: task.medications?.dosage,
                route_name: task.routes_of_administration?.route_name,
                frequency: task.frequency,
              }}
              isCompleted={isTaskCompleted(task)}
              isDueSoon={!isTaskCompleted(task) && isTaskDueSoon(task.scheduled_time)}
              isOverdue={!isTaskCompleted(task) && isTaskOverdue(task.scheduled_time)}
              onComplete={(completed) => handleTaskComplete(task.schedule_id, completed)}
            />
          ))
        )}
      </CardContent>
    </Card>
  );
};
