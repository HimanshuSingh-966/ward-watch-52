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

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    if (completingTasks.has(taskId)) return;
    
    setCompletingTasks(new Set(completingTasks).add(taskId));
    
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
        // Find the task
        const task = tasks.find(t => t.task_id === taskId);
        
        // Insert into nurse_logs
        const logData: any = {
          patient_id: patient.patient_id,
          nurse_id: nurse.nurse_id,
          task_id: task.task_id,
          administration_time: new Date().toISOString(),
          remarks: 'Completed from dashboard',
          status: 'administered',
        };

        // Add task-specific fields
        if (task.task_type === 'Medication') {
          logData.medication_id = task.medication_id;
          logData.route_id = task.route_id;
          logData.dosage_given = task.medications?.dosage || '';
        }

        const { error } = await supabase.from('nurse_logs').insert([logData]);

        if (error) throw error;
        
        toast({ 
          title: 'Task Completed', 
          description: `${task.task_type} completed successfully` 
        });
      } else {
        // Delete the log for this task
        const { data: recentLog } = await supabase
          .from('nurse_logs')
          .select('log_id')
          .eq('task_id', taskId)
          .single();

        if (recentLog) {
          await supabase.from('nurse_logs').delete().eq('log_id', recentLog.log_id);
        }
        
        toast({ 
          title: 'Task Unmarked', 
          description: 'Task marked as incomplete' 
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
      newSet.delete(taskId);
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
          tasks.map((task) => {
            const taskType = task.task_type?.toLowerCase() || 'medication';
            const scheduledTime = task.scheduled_time ? new Date(task.scheduled_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '-';
            
            let details: any = {};
            if (task.task_type === 'Medication') {
              details = {
                medication_name: task.medications?.medication_name,
                dosage: task.medications?.dosage,
                route_name: task.routes_of_administration?.route_name,
                frequency: task.frequency,
              };
            } else if (task.task_type === 'Investigation') {
              details = {
                investigation_name: task.investigations?.investigation_name,
                frequency: task.frequency,
              };
            } else if (task.task_type === 'Procedure') {
              details = {
                procedure_name: task.procedures?.procedure_name,
                frequency: task.frequency,
              };
            }

            return (
              <TaskItem
                key={task.task_id}
                type={taskType as any}
                taskType={task.task_type}
                itemName={task.item_name}
                scheduledTime={scheduledTime}
                details={details}
                isCompleted={isTaskCompleted(task)}
                isDueSoon={!isTaskCompleted(task) && isTaskDueSoon(scheduledTime)}
                isOverdue={!isTaskCompleted(task) && isTaskOverdue(scheduledTime)}
                onComplete={(completed) => handleTaskComplete(task.task_id, completed)}
              />
            );
          })
        )}
      </CardContent>
    </Card>
  );
};
