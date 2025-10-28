import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Edit, Trash2 } from 'lucide-react';
import Layout from '@/components/Layout';

type Patient = {
  patient_id: string;
  patient_name: string;
  age: number;
  gender: string;
  admission_date: string;
  discharge_date?: string;
  bed_number: string;
  contact_number: string;
  emergency_contact: string;
};

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    patient_name: '',
    age: '',
    gender: '',
    admission_date: '',
    discharge_date: '',
    bed_number: '',
    contact_number: '',
    emergency_contact: '',
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('admission_date', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
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
        age: parseInt(formData.age),
        discharge_date: formData.discharge_date || null,
      };

      if (editingPatient) {
        const { error } = await supabase
          .from('patients')
          .update(payload)
          .eq('patient_id', editingPatient.patient_id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Patient updated successfully' });
      } else {
        const { error } = await supabase.from('patients').insert([payload]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Patient added successfully' });
      }

      setOpen(false);
      resetForm();
      fetchPatients();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    try {
      const { error } = await supabase.from('patients').delete().eq('patient_id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Patient deleted successfully' });
      fetchPatients();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setFormData({
      patient_name: patient.patient_name,
      age: patient.age.toString(),
      gender: patient.gender,
      admission_date: patient.admission_date,
      discharge_date: patient.discharge_date || '',
      bed_number: patient.bed_number,
      contact_number: patient.contact_number,
      emergency_contact: patient.emergency_contact,
    });
    setOpen(true);
  };

  const resetForm = () => {
    setFormData({
      patient_name: '',
      age: '',
      gender: '',
      admission_date: '',
      discharge_date: '',
      bed_number: '',
      contact_number: '',
      emergency_contact: '',
    });
    setEditingPatient(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Patient Management</h1>
          </div>
          <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Patient</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Patient Name *</Label>
                    <Input value={formData.patient_name} onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Age *</Label>
                    <Input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Gender *</Label>
                    <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val })} required>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Bed Number *</Label>
                    <Input value={formData.bed_number} onChange={(e) => setFormData({ ...formData, bed_number: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Admission Date *</Label>
                    <Input type="date" value={formData.admission_date} onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Discharge Date</Label>
                    <Input type="date" value={formData.discharge_date} onChange={(e) => setFormData({ ...formData, discharge_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>Contact Number *</Label>
                    <Input value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} required />
                  </div>
                  <div>
                    <Label>Emergency Contact *</Label>
                    <Input value={formData.emergency_contact} onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })} required />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
                  <Button type="submit">{editingPatient ? 'Update' : 'Add'} Patient</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Age</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Bed</TableHead>
                <TableHead>Admission</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Emergency</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} className="text-center">Loading...</TableCell></TableRow>
              ) : patients.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center">No patients found</TableCell></TableRow>
              ) : (
                patients.map((patient) => (
                  <TableRow key={patient.patient_id}>
                    <TableCell className="font-medium">{patient.patient_name}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>{patient.bed_number}</TableCell>
                    <TableCell>{new Date(patient.admission_date).toLocaleDateString()}</TableCell>
                    <TableCell>{patient.contact_number}</TableCell>
                    <TableCell>{patient.emergency_contact}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(patient)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(patient.patient_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                      </div>
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

export default Patients;
