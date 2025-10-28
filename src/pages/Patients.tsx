import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Eye, Bed } from 'lucide-react';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';

type Patient = {
  patient_id: string;
  patient_name: string;
  age: number;
  gender: string;
  admission_date: string;
  bed_number: string;
  ward?: string;
  status?: string;
  diagnosis?: string;
  ipd_number?: string;
  contact_number: string;
  emergency_contact: string;
};

const Patients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { userRole } = useAuth();

  const [formData, setFormData] = useState({
    patient_name: '',
    age: '',
    gender: '',
    admission_date: '',
    bed_number: '',
    ward: '',
    status: 'STABLE',
    diagnosis: '',
    ipd_number: '',
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
        .is('discharge_date', null)
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
      const { error } = await supabase.from('patients').insert([{
        ...formData,
        age: parseInt(formData.age),
      }]);
      
      if (error) throw error;
      toast({ title: 'Success', description: 'Patient added successfully' });
      setOpen(false);
      resetForm();
      fetchPatients();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      patient_name: '',
      age: '',
      gender: '',
      admission_date: '',
      bed_number: '',
      ward: '',
      status: 'STABLE',
      diagnosis: '',
      ipd_number: '',
      contact_number: '',
      emergency_contact: '',
    });
  };

  const filteredPatients = patients.filter(patient =>
    patient.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.ipd_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    patient.bed_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status?: string) => {
    const statusMap: Record<string, { variant: 'default' | 'destructive' | 'secondary' | 'outline', label: string }> = {
      'STABLE': { variant: 'secondary', label: 'STABLE' },
      'CRITICAL': { variant: 'destructive', label: 'CRITICAL' },
    };
    const config = statusMap[status || 'STABLE'] || statusMap['STABLE'];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">All Patients</h1>
              <p className="text-sm text-muted-foreground">
                <Badge variant="outline" className="mt-1">{filteredPatients.length} patients</Badge>
              </p>
            </div>
          </div>
          {userRole === 'admin' && (
            <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" /> Add Patient</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Patient</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Patient Name *</Label>
                      <Input value={formData.patient_name} onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })} required />
                    </div>
                    <div>
                      <Label>IPD Number *</Label>
                      <Input placeholder="IPD 3430/98" value={formData.ipd_number} onChange={(e) => setFormData({ ...formData, ipd_number: e.target.value })} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Age *</Label>
                      <Input type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Gender *</Label>
                      <Select value={formData.gender} onValueChange={(val) => setFormData({ ...formData, gender: val })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Bed Number *</Label>
                      <Input placeholder="128" value={formData.bed_number} onChange={(e) => setFormData({ ...formData, bed_number: e.target.value })} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Ward *</Label>
                      <Input placeholder="OBG, General, ICU" value={formData.ward} onChange={(e) => setFormData({ ...formData, ward: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Status *</Label>
                      <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STABLE">STABLE</SelectItem>
                          <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Diagnosis *</Label>
                    <Textarea 
                      placeholder="Post-operative care, Cardiac monitoring, etc."
                      value={formData.diagnosis} 
                      onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} 
                      required 
                    />
                  </div>

                  <div>
                    <Label>Admission Date *</Label>
                    <Input type="date" value={formData.admission_date} onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })} required />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
                    <Button type="submit">Add Patient</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="bg-card/50 p-4 rounded-lg border">
          <Input
            placeholder="Search patients by name, IPD number, or bed number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="border rounded-lg bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IPD NUMBER</TableHead>
                <TableHead>PATIENT NAME</TableHead>
                <TableHead>AGE</TableHead>
                <TableHead>GENDER</TableHead>
                <TableHead>BED NO.</TableHead>
                <TableHead>WARD</TableHead>
                <TableHead>STATUS</TableHead>
                <TableHead>ADMITTED DATE</TableHead>
                <TableHead>DIAGNOSIS</TableHead>
                <TableHead>ACTIONS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={10} className="text-center">Loading...</TableCell></TableRow>
              ) : filteredPatients.length === 0 ? (
                <TableRow><TableCell colSpan={10} className="text-center">No patients found</TableCell></TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.patient_id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">IPD</span>
                        <span className="font-medium">{patient.ipd_number || '-'}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{patient.patient_name}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>{patient.gender}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4 text-primary" />
                        <span className="font-medium text-primary">{patient.bed_number}</span>
                      </div>
                    </TableCell>
                    <TableCell>{patient.ward || '-'}</TableCell>
                    <TableCell>{getStatusBadge(patient.status)}</TableCell>
                    <TableCell>{new Date(patient.admission_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                    <TableCell className="max-w-xs truncate">{patient.diagnosis || '-'}</TableCell>
                    <TableCell>
                      <Button variant="default" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
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
