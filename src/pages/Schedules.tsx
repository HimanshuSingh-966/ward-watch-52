import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Plus, Edit } from 'lucide-react';
import Layout from '@/components/Layout';

type Schedule = {
  schedule_id: string;
  patient_id: string;
  medication_id: string;
  route_id: string;
  scheduled_time: string;
  frequency: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  patients: { patient_name: string };
  medications: { medication_name: string };
  routes_of_administration: { route_name: string };
};

const Schedules = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    patient_id: '',
    medication_id: '',
    route_id: '',
    scheduled_time: '',
    frequency: '',
    start_date: '',
    end_date: '',
    is_active: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [schedulesRes, patientsRes, medsRes, routesRes] = await Promise.all([
        supabase.from('medication_schedules').select('*, patients(patient_name), medications(medication_name), routes_of_administration(route_name)').order('scheduled_time'),
        supabase.from('patients').select('patient_id, patient_name').order('patient_name'),
        supabase.from('medications').select('medication_id, medication_name').order('medication_name'),
        supabase.from('routes_of_administration').select('*').order('route_name'),
      ]);

      if (schedulesRes.error) throw schedulesRes.error;
      setSchedules(schedulesRes.data || []);
      setPatients(patientsRes.data || []);
      setMedications(medsRes.data || []);
      setRoutes(routesRes.data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        end_date: formData.end_date || null,
      };

      if (editingSchedule) {
        const { error } = await supabase
          .from('medication_schedules')
          .update(payload)
          .eq('schedule_id', editingSchedule.schedule_id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Schedule updated successfully' });
      } else {
        const { error } = await supabase.from('medication_schedules').insert([payload]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Schedule created successfully' });
      }

      setOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setFormData({
      patient_id: schedule.patient_id,
      medication_id: schedule.medication_id,
      route_id: schedule.route_id,
      scheduled_time: schedule.scheduled_time,
      frequency: schedule.frequency,
      start_date: schedule.start_date,
      end_date: schedule.end_date || '',
      is_active: schedule.is_active,
    });
    setOpen(true);
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      medication_id: '',
      route_id: '',
      scheduled_time: '',
      frequency: '',
      start_date: '',
      end_date: '',
      is_active: true,
    });
    setEditingSchedule(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Medication Schedules</h1>
          </div>
          <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Schedule</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingSchedule ? 'Edit Schedule' : 'Create Schedule'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <Label>Patient *</Label>
                    <Select value={formData.patient_id} onValueChange={(val) => setFormData({ ...formData, patient_id: val })} required>
                      <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                      <SelectContent>
                        {patients.map((p) => (
                          <SelectItem key={p.patient_id} value={p.patient_id}>{p.patient_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Medication *</Label>
                    <Select value={formData.medication_id} onValueChange={(val) => setFormData({ ...formData, medication_id: val })} required>
                      <SelectTrigger><SelectValue placeholder="Select medication" /></SelectTrigger>
                      <SelectContent>
                        {medications.map((m) => (
                          <SelectItem key={m.medication_id} value={m.medication_id}>{m.medication_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Route *</Label>
                    <Select value={formData.route_id} onValueChange={(val) => setFormData({ ...formData, route_id: val })} required>
                      <SelectTrigger><SelectValue placeholder="Select route" /></SelectTrigger>
                      <SelectContent>
                        {routes.map((r) => (
                          <SelectItem key={r.route_id} value={r.route_id}>{r.route_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Scheduled Time *</Label>
                    <Input type="time" value={formData.scheduled_time} onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Frequency *</Label>
                    <Input placeholder="e.g., Daily, Twice daily" value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Start Date *</Label>
                    <Input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} required />
                  </div>
                  <div className="col-span-2">
                    <Label>End Date (Optional)</Label>
                    <Input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} />
                  </div>
                  <div className="col-span-2 flex items-center space-x-2">
                    <Switch checked={formData.is_active} onCheckedChange={(val) => setFormData({ ...formData, is_active: val })} />
                    <Label>Active</Label>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
                  <Button type="submit">{editingSchedule ? 'Update' : 'Create'} Schedule</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Medication</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Frequency</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>
              ) : schedules.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center">No schedules found</TableCell></TableRow>
              ) : (
                schedules.map((schedule) => (
                  <TableRow key={schedule.schedule_id}>
                    <TableCell className="font-medium">{schedule.patients?.patient_name}</TableCell>
                    <TableCell>{schedule.medications?.medication_name}</TableCell>
                    <TableCell>{schedule.routes_of_administration?.route_name}</TableCell>
                    <TableCell>{schedule.scheduled_time}</TableCell>
                    <TableCell>{schedule.frequency}</TableCell>
                    <TableCell>{new Date(schedule.start_date).toLocaleDateString()} - {schedule.end_date ? new Date(schedule.end_date).toLocaleDateString() : 'Ongoing'}</TableCell>
                    <TableCell>{schedule.is_active ? <span className="text-success">Active</span> : <span className="text-muted-foreground">Inactive</span>}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(schedule)}><Edit className="h-4 w-4" /></Button>
                    </TableCell>
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

export default Schedules;
