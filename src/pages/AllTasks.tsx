import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { CheckSquare, Circle } from 'lucide-react';
import Layout from '@/components/Layout';

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
};

const AllTasks = () => {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const fetchAllTasks = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Fetch medication tasks
      const { data: medTasks, error: medError } = await supabase
        .from('medication_schedules')
        .select(`
          schedule_id,
          scheduled_time,
          frequency,
          status,
          priority,
          task_type,
          notes,
          patients(patient_name, ipd_number, bed_number),
          medications(medication_name),
          routes_of_administration(route_name)
        `)
        .eq('is_active', true)
        .gte('start_date', today)
        .order('scheduled_time');

      if (medError) throw medError;

      const formattedTasks: TaskRow[] = (medTasks || []).map((task: any) => ({
        task_id: task.schedule_id,
        patient_name: task.patients?.patient_name || 'Unknown',
        ipd_number: task.patients?.ipd_number || '-',
        bed_number: task.patients?.bed_number || '-',
        task_type: task.task_type || 'Medication',
        item_name: task.medications?.medication_name || '-',
        route_name: task.routes_of_administration?.route_name || '-',
        frequency: task.frequency || '-',
        scheduled_time: task.scheduled_time,
        status: task.status || 'PENDING',
        priority: task.priority || 'Medium',
        notes: task.notes || '',
      }));

      setTasks(formattedTasks);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
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
    const typeMap: Record<string, { className: string }> = {
      'Medication': { className: 'bg-blue-100 text-blue-800' },
      'Investigation': { className: 'bg-purple-100 text-purple-800' },
      'Procedure': { className: 'bg-orange-100 text-orange-800' },
    };
    const config = typeMap[taskType] || typeMap['Medication'];
    return <Badge variant="outline" className={config.className}>{taskType}</Badge>;
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
                <TableHead>STATUS</TableHead>
                <TableHead>PRIORITY</TableHead>
                <TableHead>PATIENT</TableHead>
                <TableHead>IPD NO.</TableHead>
                <TableHead>BED</TableHead>
                <TableHead>TASK TYPE</TableHead>
                <TableHead>MEDICATION/PROCEDURE</TableHead>
                <TableHead>ROUTE</TableHead>
                <TableHead>FREQUENCY</TableHead>
                <TableHead>SCHEDULED TIME</TableHead>
                <TableHead>NOTES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={11} className="text-center">Loading...</TableCell></TableRow>
              ) : filteredTasks.length === 0 ? (
                <TableRow><TableCell colSpan={11} className="text-center">No tasks found</TableCell></TableRow>
              ) : (
                filteredTasks.map((task) => (
                  <TableRow key={task.task_id}>
                    <TableCell>{getStatusBadge(task.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getPriorityIndicator(task.priority)}
                        <span className="text-sm">{task.priority}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{task.patient_name}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-xs">
                        <span className="text-muted-foreground">IPD</span>
                        <span>{task.ipd_number}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{task.bed_number}</TableCell>
                    <TableCell>{getTaskTypeBadge(task.task_type)}</TableCell>
                    <TableCell>{task.item_name}</TableCell>
                    <TableCell>{task.route_name}</TableCell>
                    <TableCell>{task.frequency}</TableCell>
                    <TableCell>{new Date(task.scheduled_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                    <TableCell className="max-w-xs truncate">{task.notes || '-'}</TableCell>
                  </TableRow>
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
