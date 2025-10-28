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
import { HeartPulse, Plus } from 'lucide-react';
import Layout from '@/components/Layout';

type VitalSign = {
  vital_id: string;
  patient_id: string;
  nurse_id: string;
  recorded_time: string;
  temperature: number;
  blood_pressure: string;
  heart_rate: number;
  respiratory_rate: number;
  oxygen_saturation: number;
  remarks: string;
  patients: { patient_name: string };
  nurses: { nurse_name: string };
};

const VitalSigns = () => {
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    patient_id: '',
    recorded_time: '',
    temperature: '',
    blood_pressure: '',
    heart_rate: '',
    respiratory_rate: '',
    oxygen_saturation: '',
    remarks: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [vitalsRes, patientsRes, nursesRes] = await Promise.all([
        supabase.from('vital_signs').select('*, patients(patient_name), nurses(nurse_name)').order('recorded_time', { ascending: false }),
        supabase.from('patients').select('patient_id, patient_name').order('patient_name'),
        supabase.from('nurses').select('nurse_id').eq('email', user?.email).single(),
      ]);

      if (vitalsRes.error) throw vitalsRes.error;
      if (patientsRes.error) throw patientsRes.error;
      
      setVitalSigns(vitalsRes.data || []);
      setPatients(patientsRes.data || []);
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

      const payload = {
        ...formData,
        nurse_id: nurse.nurse_id,
        temperature: parseFloat(formData.temperature),
        heart_rate: parseInt(formData.heart_rate),
        respiratory_rate: parseInt(formData.respiratory_rate),
        oxygen_saturation: parseFloat(formData.oxygen_saturation),
      };

      const { error } = await supabase.from('vital_signs').insert([payload]);
      if (error) throw error;

      toast({ title: 'Success', description: 'Vital signs recorded successfully' });
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
      recorded_time: '',
      temperature: '',
      blood_pressure: '',
      heart_rate: '',
      respiratory_rate: '',
      oxygen_saturation: '',
      remarks: '',
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Vital Signs</h1>
          </div>
          <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Record Vital Signs</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Record Vital Signs</DialogTitle>
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
                    <Label>Recorded Time *</Label>
                    <Input type="datetime-local" value={formData.recorded_time} onChange={(e) => setFormData({ ...formData, recorded_time: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Temperature (°C) *</Label>
                    <Input type="number" step="0.01" value={formData.temperature} onChange={(e) => setFormData({ ...formData, temperature: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Blood Pressure *</Label>
                    <Input placeholder="e.g., 120/80" value={formData.blood_pressure} onChange={(e) => setFormData({ ...formData, blood_pressure: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Heart Rate (bpm) *</Label>
                    <Input type="number" value={formData.heart_rate} onChange={(e) => setFormData({ ...formData, heart_rate: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Respiratory Rate *</Label>
                    <Input type="number" value={formData.respiratory_rate} onChange={(e) => setFormData({ ...formData, respiratory_rate: e.target.value })} required />
                  </div>
                  <div className="col-span-2">
                    <Label>Oxygen Saturation (%) *</Label>
                    <Input type="number" step="0.01" value={formData.oxygen_saturation} onChange={(e) => setFormData({ ...formData, oxygen_saturation: e.target.value })} required />
                  </div>
                  <div className="col-span-2">
                    <Label>Remarks</Label>
                    <Textarea value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
                  <Button type="submit">Record</Button>
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
                <TableHead>Time</TableHead>
                <TableHead>Temp (°C)</TableHead>
                <TableHead>BP</TableHead>
                <TableHead>HR</TableHead>
                <TableHead>RR</TableHead>
                <TableHead>SpO2</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>
              ) : vitalSigns.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center">No vital signs recorded</TableCell></TableRow>
              ) : (
                vitalSigns.map((vital) => (
                  <TableRow key={vital.vital_id}>
                    <TableCell className="font-medium">{vital.patients?.patient_name}</TableCell>
                    <TableCell>{new Date(vital.recorded_time).toLocaleString()}</TableCell>
                    <TableCell>{vital.temperature}</TableCell>
                    <TableCell>{vital.blood_pressure}</TableCell>
                    <TableCell>{vital.heart_rate}</TableCell>
                    <TableCell>{vital.respiratory_rate}</TableCell>
                    <TableCell>{vital.oxygen_saturation}%</TableCell>
                    <TableCell>{vital.remarks}</TableCell>
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

export default VitalSigns;
