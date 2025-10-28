import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ClipboardList, Plus } from 'lucide-react';
import Layout from '@/components/Layout';

type NurseLog = {
  log_id: string;
  patient_id: string;
  nurse_id: string;
  medication_id: string;
  route_id: string;
  administration_time: string;
  dosage_given: string;
  remarks: string;
  status: string;
  patients: { patient_name: string };
  nurses: { nurse_name: string };
  medications: { medication_name: string };
  routes_of_administration: { route_name: string };
};

const Logs = () => {
  const [logs, setLogs] = useState<NurseLog[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    patient_id: '',
    medication_id: '',
    route_id: '',
    administration_time: '',
    dosage_given: '',
    remarks: '',
    status: 'administered',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [logsRes, patientsRes, medsRes, routesRes] = await Promise.all([
        supabase.from('nurse_logs').select('*, patients(patient_name), nurses(nurse_name), medications(medication_name), routes_of_administration(route_name)').order('administration_time', { ascending: false }),
        supabase.from('patients').select('patient_id, patient_name').order('patient_name'),
        supabase.from('medications').select('medication_id, medication_name').order('medication_name'),
        supabase.from('routes_of_administration').select('*').order('route_name'),
      ]);

      if (logsRes.error) throw logsRes.error;
      setLogs(logsRes.data || []);
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
      const { data: nurse } = await supabase.from('nurses').select('nurse_id').eq('email', user?.email).single();
      
      if (!nurse) {
        toast({ title: 'Error', description: 'Nurse profile not found', variant: 'destructive' });
        return;
      }

      const payload = { ...formData, nurse_id: nurse.nurse_id };
      const { error } = await supabase.from('nurse_logs').insert([payload]);
      if (error) throw error;

      toast({ title: 'Success', description: 'Medication log recorded successfully' });
      setOpen(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      medication_id: '',
      route_id: '',
      administration_time: '',
      dosage_given: '',
      remarks: '',
      status: 'administered',
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Nurse Logs</h1>
          </div>
          <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Log Medication</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Log Medication Administration</DialogTitle>
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
                    <Label>Administration Time *</Label>
                    <Input type="datetime-local" value={formData.administration_time} onChange={(e) => setFormData({ ...formData, administration_time: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Dosage Given *</Label>
                    <Input placeholder="e.g., 500mg" value={formData.dosage_given} onChange={(e) => setFormData({ ...formData, dosage_given: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Status *</Label>
                    <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })} required>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="administered">Administered</SelectItem>
                        <SelectItem value="missed">Missed</SelectItem>
                        <SelectItem value="delayed">Delayed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-2">
                    <Label>Remarks</Label>
                    <Textarea value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
                  <Button type="submit">Log</Button>
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
                <TableHead>Dosage</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Nurse</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>
              ) : logs.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center">No logs found</TableCell></TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.log_id}>
                    <TableCell className="font-medium">{log.patients?.patient_name}</TableCell>
                    <TableCell>{log.medications?.medication_name}</TableCell>
                    <TableCell>{log.routes_of_administration?.route_name}</TableCell>
                    <TableCell>{log.dosage_given}</TableCell>
                    <TableCell>{new Date(log.administration_time).toLocaleString()}</TableCell>
                    <TableCell>{log.nurses?.nurse_name}</TableCell>
                    <TableCell>
                      <span className={`capitalize ${log.status === 'administered' ? 'text-success' : log.status === 'missed' ? 'text-destructive' : 'text-warning'}`}>
                        {log.status}
                      </span>
                    </TableCell>
                    <TableCell>{log.remarks}</TableCell>
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

export default Logs;
