import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CheckSquare, Circle, ChevronDown, ChevronUp, Pill, Activity, Stethoscope, Syringe } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

type TaskRow = {
  task_id: string;
  patient_name: string;
  ipd_number: string;
  bed_number: string;
  task_type: string;
  item_name: string;
  route_name: string;
  frequency: string;
  scheduled_time: string;
  status: string;
  priority: string;
  notes: string;
  medication_dosage?: string;
  medication_form?: string;
  investigation_description?: string;
  investigation_range?: string;
  procedure_description?: string;
  procedure_duration?: string;
};

const AllTasks = () => {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [completingTasks, setCompletingTasks] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const fetchAllTasks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch all tasks from central tasks table
      const { data: allTasks, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          task_id,
          task_type,
          scheduled_time,
          frequency,
          status,
          priority,
          notes,
          patients(patient_name, ipd_number, bed_number),
          medications(medication_name, dosage, form),
          investigations(investigation_name, description, normal_range),
          procedures(procedure_name, description, duration),
          routes_of_administration(route_name)
        `)
        .gte('scheduled_time', today)
        .order('scheduled_time');

      if (tasksError) throw tasksError;

      const formattedTasks: TaskRow[] = (allTasks || []).map((task: any) => {
        let itemName = '-';
        let details: any = {};

        switch (task.task_type) {
          case 'Medication':
            itemName = task.medications?.medication_name || '-';
            details.medication_dosage = task.medications?.dosage;
            details.medication_form = task.medications?.form;
            break;
          case 'Investigation':
            itemName = task.investigations?.investigation_name || '-';
            details.investigation_description = task.investigations?.description;
            details.investigation_range = task.investigations?.normal_range;
            break;
          case 'Procedure':
            itemName = task.procedures?.procedure_name || '-';
            details.procedure_description = task.procedures?.description;
            details.procedure_duration = task.procedures?.duration;
            break;
          case 'Vital Signs':
            itemName = 'Vital Signs Checkup';
            break;
        }

        return {
          task_id: task.task_id,
          patient_name: task.patients?.patient_name || 'Unknown',
          ipd_number: task.patients?.ipd_number || '-',
          bed_number: task.patients?.bed_number || '-',
          task_type: task.task_type,
          item_name: itemName,
          route_name: task.routes_of_administration?.route_name || '-',
          frequency: task.frequency || '-',
          scheduled_time: task.scheduled_time,
          status: task.status || 'PENDING',
          priority: task.priority || 'Medium',
          notes: task.notes || '',
          ...details,
        };
      });

      setTasks(formattedTasks);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskComplete = async (taskId: string, completed: boolean) => {
    if (completingTasks.has(taskId)) return;
    
    setCompletingTasks(new Set(completingTasks).add(taskId));
    
    try {
      if (!user) throw new Error('Not authenticated');

      // Get nurse_id from user email
      const { data: nurse } = await supabase
        .from('nurses')
        .select('nurse_id')
        .eq('email', user.email)
        .single();

      if (!nurse) throw new Error('Nurse record not found');

      if (completed) {
        const task = tasks.find(t => t.task_id === taskId);
        if (!task) return;

        // Insert into nurse_logs
        const logData: any = {
          task_id: taskId,
          nurse_id: nurse.nurse_id,
          administration_time: new Date().toISOString(),
          remarks: 'Completed from all tasks page',
          status: 'administered',
        };

        const { error } = await supabase.from('nurse_logs').insert([logData]);
        if (error) throw error;
        
        toast({ 
          title: 'Task Completed', 
          description: `${task.task_type} completed successfully` 
        });
      } else {
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

      fetchAllTasks();
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

  const filteredTasks = tasks.filter(task =>
    task.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.ipd_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.item_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { className: string, label: string }> = {
      'PENDING': { className: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'PENDING' },
      'COMPLETED': { className: 'bg-green-100 text-green-800 border-green-300', label: 'COMPLETED' },
      'OVERDUE': { className: 'bg-red-100 text-red-800 border-red-300', label: 'OVERDUE' },
    };
    const config = statusMap[status] || statusMap['PENDING'];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPriorityIndicator = (priority: string) => {
    const colors: Record<string, string> = {
      'High': 'text-red-500',
      'Medium': 'text-yellow-500',
      'Low': 'text-green-500',
    };
    return <Circle className={`h-3 w-3 fill-current ${colors[priority] || colors['Medium']}`} />;
  };

  const getTaskTypeBadge = (taskType: string) => {
    const typeMap: Record<string, { className: string; icon: any }> = {
      'Medication': { className: 'bg-chart-1/20 text-chart-1 border-chart-1/30', icon: Pill },
      'Investigation': { className: 'bg-chart-2/20 text-chart-2 border-chart-2/30', icon: Stethoscope },
      'Procedure': { className: 'bg-chart-3/20 text-chart-3 border-chart-3/30', icon: Syringe },
      'Vital Signs': { className: 'bg-chart-4/20 text-chart-4 border-chart-4/30', icon: Activity },
    };
    const config = typeMap[taskType] || typeMap['Medication'];
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {taskType}
      </Badge>
    );
  };

  const renderTaskDetails = (task: TaskRow) => {
    return (
      <Card className="mt-2 bg-muted/50">
        <CardContent className="pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            {task.task_type === 'Medication' && (
              <>
                <div>
                  <span className="font-semibold text-muted-foreground">Dosage:</span>
                  <p className="mt-1">{task.medication_dosage || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Form:</span>
                  <p className="mt-1">{task.medication_form || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Route:</span>
                  <p className="mt-1">{task.route_name}</p>
                </div>
              </>
            )}
            {task.task_type === 'Investigation' && (
              <>
                <div className="col-span-2">
                  <span className="font-semibold text-muted-foreground">Description:</span>
                  <p className="mt-1">{task.investigation_description || 'N/A'}</p>
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-muted-foreground">Normal Range:</span>
                  <p className="mt-1">{task.investigation_range || 'N/A'}</p>
                </div>
              </>
            )}
            {task.task_type === 'Procedure' && (
              <>
                <div className="col-span-2">
                  <span className="font-semibold text-muted-foreground">Description:</span>
                  <p className="mt-1">{task.procedure_description || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-semibold text-muted-foreground">Duration:</span>
                  <p className="mt-1">{task.procedure_duration || 'N/A'}</p>
                </div>
              </>
            )}
            {task.notes && (
              <div className="col-span-2">
                <span className="font-semibold text-muted-foreground">Notes:</span>
                <p className="mt-1">{task.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">All Tasks</h1>
              <p className="text-sm text-muted-foreground">
                <Badge variant="outline" className="mt-1">{filteredTasks.length} tasks</Badge>
              </p>
            </div>
          </div>
        </div>

        <div className="bg-card/50 p-4 rounded-lg border">
          <Input
            placeholder="Search tasks by patient name, ID, or medication..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>PRIORITY</TableHead>
                <TableHead>PATIENT</TableHead>
                <TableHead>IPD NO.</TableHead>
                <TableHead>BED</TableHead>
                <TableHead>TASK TYPE</TableHead>
                <TableHead>ITEM</TableHead>
                <TableHead>FREQUENCY</TableHead>
                <TableHead>SCHEDULED TIME</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={11} className="text-center">Loading...</TableCell></TableRow>
              ) : filteredTasks.length === 0 ? (
                <TableRow><TableCell colSpan={11} className="text-center">No tasks found</TableCell></TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <>
                    <TableRow 
                      key={task.task_id} 
                      className="hover:bg-muted/50"
                    >
                      <TableCell onClick={(e) => {
                        e.stopPropagation();
                        setExpandedTask(expandedTask === task.task_id ? null : task.task_id);
                      }}>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          {expandedTask === task.task_id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox 
                          checked={task.status === 'COMPLETED'}
                          onCheckedChange={(checked) => handleTaskComplete(task.task_id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell onClick={() => setExpandedTask(expandedTask === task.task_id ? null : task.task_id)}>{getStatusBadge(task.status)}</TableCell>
                      <TableCell onClick={() => setExpandedTask(expandedTask === task.task_id ? null : task.task_id)}>
                        <div className="flex items-center gap-1">
                          {getPriorityIndicator(task.priority)}
                          <span className="text-sm">{task.priority}</span>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => setExpandedTask(expandedTask === task.task_id ? null : task.task_id)} className="font-semibold">{task.patient_name}</TableCell>
                      <TableCell onClick={() => setExpandedTask(expandedTask === task.task_id ? null : task.task_id)}>
                        <div className="flex flex-col text-xs">
                          <span className="text-muted-foreground">IPD</span>
                          <span>{task.ipd_number}</span>
                        </div>
                      </TableCell>
                      <TableCell onClick={() => setExpandedTask(expandedTask === task.task_id ? null : task.task_id)} className="font-medium">{task.bed_number}</TableCell>
                      <TableCell onClick={() => setExpandedTask(expandedTask === task.task_id ? null : task.task_id)}>{getTaskTypeBadge(task.task_type)}</TableCell>
                      <TableCell onClick={() => setExpandedTask(expandedTask === task.task_id ? null : task.task_id)}>{task.item_name}</TableCell>
                      <TableCell onClick={() => setExpandedTask(expandedTask === task.task_id ? null : task.task_id)}>{task.frequency}</TableCell>
                      <TableCell onClick={() => setExpandedTask(expandedTask === task.task_id ? null : task.task_id)}>{new Date(task.scheduled_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                    </TableRow>
                    {expandedTask === task.task_id && (
                      <TableRow key={`${task.task_id}-details`}>
                        <TableCell colSpan={11} className="p-0">
                          {renderTaskDetails(task)}
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </Layout>
  );
};

export default AllTasks;
