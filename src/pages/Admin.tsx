import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Settings, Plus, Edit, Trash2, Users, Pill, Calendar, Building2, UserPlus } from 'lucide-react';
import Layout from '@/components/Layout';

const Admin = () => {
  const [nurses, setNurses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  
  const [openNurse, setOpenNurse] = useState(false);
  const [openDept, setOpenDept] = useState(false);
  const [openPatient, setOpenPatient] = useState(false);
  const [openMed, setOpenMed] = useState(false);
  const [openSchedule, setOpenSchedule] = useState(false);
  
  const [editingNurse, setEditingNurse] = useState<any>(null);
  const [editingDept, setEditingDept] = useState<any>(null);
  const [editingPatient, setEditingPatient] = useState<any>(null);
  const [editingMed, setEditingMed] = useState<any>(null);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  
  const { toast } = useToast();

  const [nurseForm, setNurseForm] = useState({
    nurse_name: '',
    department_id: '',
    contact_number: '',
    email: '',
    shift: '',
  });

  const [deptForm, setDeptForm] = useState({ department_name: '' });

  const [patientForm, setPatientForm] = useState({
    patient_name: '',
    age: '',
    gender: '',
    admission_date: '',
    bed_number: '',
    contact_number: '',
    emergency_contact: '',
  });

  const [medForm, setMedForm] = useState({
    medication_name: '',
    dosage: '',
    form: '',
  });

  const [scheduleForm, setScheduleForm] = useState({
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
      const [nursesRes, deptsRes, patientsRes, medsRes, schedulesRes, routesRes] = await Promise.all([
        supabase.from('nurses').select('*, departments(department_name)').order('nurse_name'),
        supabase.from('departments').select('*').order('department_name'),
        supabase.from('patients').select('*').order('patient_name'),
        supabase.from('medications').select('*').order('medication_name'),
        supabase.from('medication_schedules').select(`
          *,
          patients(patient_name),
          medications(medication_name),
          routes_of_administration(route_name)
        `).order('scheduled_time'),
        supabase.from('routes_of_administration').select('*').order('route_name'),
      ]);

      if (nursesRes.error) throw nursesRes.error;
      if (deptsRes.error) throw deptsRes.error;
      if (patientsRes.error) throw patientsRes.error;
      if (medsRes.error) throw medsRes.error;
      if (schedulesRes.error) throw schedulesRes.error;
      if (routesRes.error) throw routesRes.error;

      setNurses(nursesRes.data || []);
      setDepartments(deptsRes.data || []);
      setPatients(patientsRes.data || []);
      setMedications(medsRes.data || []);
      setSchedules(schedulesRes.data || []);
      setRoutes(routesRes.data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleNurseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...nurseForm, department_id: nurseForm.department_id || null };

      if (editingNurse) {
        const { error } = await supabase.from('nurses').update(payload).eq('nurse_id', editingNurse.nurse_id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Nurse updated successfully' });
      } else {
        const { error } = await supabase.from('nurses').insert([payload]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Nurse added successfully' });
      }

      setOpenNurse(false);
      resetNurseForm();
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        const { error } = await supabase.from('departments').update(deptForm).eq('department_id', editingDept.department_id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Department updated successfully' });
      } else {
        const { error } = await supabase.from('departments').insert([deptForm]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Department added successfully' });
      }

      setOpenDept(false);
      resetDeptForm();
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteNurse = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('nurses').delete().eq('nurse_id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Nurse deleted successfully' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteDept = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('departments').delete().eq('department_id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Department deleted successfully' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const editNurse = (nurse: any) => {
    setEditingNurse(nurse);
    setNurseForm({
      nurse_name: nurse.nurse_name,
      department_id: nurse.department_id || '',
      contact_number: nurse.contact_number,
      email: nurse.email,
      shift: nurse.shift,
    });
    setOpenNurse(true);
  };

  const editDept = (dept: any) => {
    setEditingDept(dept);
    setDeptForm({ department_name: dept.department_name });
    setOpenDept(true);
  };

  const resetNurseForm = () => {
    setNurseForm({ nurse_name: '', department_id: '', contact_number: '', email: '', shift: '' });
    setEditingNurse(null);
  };

  const resetDeptForm = () => {
    setDeptForm({ department_name: '' });
    setEditingDept(null);
  };

  // Patient handlers
  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...patientForm,
        age: patientForm.age ? parseInt(patientForm.age) : null,
        discharge_date: null,
      };

      if (editingPatient) {
        const { error } = await supabase.from('patients').update(payload).eq('patient_id', editingPatient.patient_id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Patient updated successfully' });
      } else {
        const { error } = await supabase.from('patients').insert([payload]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Patient added successfully' });
      }

      setOpenPatient(false);
      resetPatientForm();
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeletePatient = async (id: string) => {
    if (!confirm('Are you sure? This will delete all associated schedules and logs.')) return;
    try {
      const { error } = await supabase.from('patients').delete().eq('patient_id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Patient deleted successfully' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const editPatient = (patient: any) => {
    setEditingPatient(patient);
    setPatientForm({
      patient_name: patient.patient_name,
      age: patient.age?.toString() || '',
      gender: patient.gender || '',
      admission_date: patient.admission_date || '',
      bed_number: patient.bed_number || '',
      contact_number: patient.contact_number || '',
      emergency_contact: patient.emergency_contact || '',
    });
    setOpenPatient(true);
  };

  const resetPatientForm = () => {
    setPatientForm({
      patient_name: '',
      age: '',
      gender: '',
      admission_date: '',
      bed_number: '',
      contact_number: '',
      emergency_contact: '',
    });
    setEditingPatient(null);
  };

  // Medication handlers
  const handleMedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMed) {
        const { error } = await supabase.from('medications').update(medForm).eq('medication_id', editingMed.medication_id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Medication updated successfully' });
      } else {
        const { error } = await supabase.from('medications').insert([medForm]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Medication added successfully' });
      }

      setOpenMed(false);
      resetMedForm();
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteMed = async (id: string) => {
    if (!confirm('Are you sure? This will affect all schedules using this medication.')) return;
    try {
      const { error } = await supabase.from('medications').delete().eq('medication_id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Medication deleted successfully' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const editMed = (med: any) => {
    setEditingMed(med);
    setMedForm({
      medication_name: med.medication_name,
      dosage: med.dosage,
      form: med.form,
    });
    setOpenMed(true);
  };

  const resetMedForm = () => {
    setMedForm({ medication_name: '', dosage: '', form: '' });
    setEditingMed(null);
  };

  // Schedule handlers
  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...scheduleForm,
        end_date: scheduleForm.end_date || null,
      };

      if (editingSchedule) {
        const { error } = await supabase.from('medication_schedules').update(payload).eq('schedule_id', editingSchedule.schedule_id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Schedule updated successfully' });
      } else {
        const { error } = await supabase.from('medication_schedules').insert([payload]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Schedule added successfully' });
      }

      setOpenSchedule(false);
      resetScheduleForm();
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('medication_schedules').delete().eq('schedule_id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Schedule deleted successfully' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const editSchedule = (schedule: any) => {
    setEditingSchedule(schedule);
    setScheduleForm({
      patient_id: schedule.patient_id,
      medication_id: schedule.medication_id,
      route_id: schedule.route_id,
      scheduled_time: schedule.scheduled_time,
      frequency: schedule.frequency,
      start_date: schedule.start_date,
      end_date: schedule.end_date || '',
      is_active: schedule.is_active,
    });
    setOpenSchedule(true);
  };

  const resetScheduleForm = () => {
    setScheduleForm({
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
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

        <Tabs defaultValue="patients" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="patients" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Patients
            </TabsTrigger>
            <TabsTrigger value="medications" className="flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Medications
            </TabsTrigger>
            <TabsTrigger value="schedules" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedules
            </TabsTrigger>
            <TabsTrigger value="nurses" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Nurses
            </TabsTrigger>
            <TabsTrigger value="departments" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Departments
            </TabsTrigger>
          </TabsList>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{patients.length} total patients</p>
              <Dialog open={openPatient} onOpenChange={(val) => { setOpenPatient(val); if (!val) resetPatientForm(); }}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" /> Add Patient</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingPatient ? 'Edit Patient' : 'Add New Patient'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handlePatientSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Patient Name *</Label>
                        <Input value={patientForm.patient_name} onChange={(e) => setPatientForm({ ...patientForm, patient_name: e.target.value })} required />
                      </div>
                      <div>
                        <Label>Bed Number *</Label>
                        <Input value={patientForm.bed_number} onChange={(e) => setPatientForm({ ...patientForm, bed_number: e.target.value })} required />
                      </div>
                      <div>
                        <Label>Age</Label>
                        <Input type="number" value={patientForm.age} onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })} />
                      </div>
                      <div>
                        <Label>Gender</Label>
                        <Select value={patientForm.gender} onValueChange={(val) => setPatientForm({ ...patientForm, gender: val })}>
                          <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Admission Date</Label>
                        <Input type="date" value={patientForm.admission_date} onChange={(e) => setPatientForm({ ...patientForm, admission_date: e.target.value })} />
                      </div>
                      <div>
                        <Label>Contact Number</Label>
                        <Input value={patientForm.contact_number} onChange={(e) => setPatientForm({ ...patientForm, contact_number: e.target.value })} />
                      </div>
                      <div className="col-span-2">
                        <Label>Emergency Contact</Label>
                        <Input value={patientForm.emergency_contact} onChange={(e) => setPatientForm({ ...patientForm, emergency_contact: e.target.value })} />
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => { setOpenPatient(false); resetPatientForm(); }}>Cancel</Button>
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
                    <TableHead>Bed</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Admission Date</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.length === 0 ? (
                    <TableRow><TableCell colSpan={7} className="text-center">No patients found</TableCell></TableRow>
                  ) : (
                    patients.map((patient) => (
                      <TableRow key={patient.patient_id}>
                        <TableCell className="font-medium">{patient.patient_name}</TableCell>
                        <TableCell>{patient.bed_number}</TableCell>
                        <TableCell>{patient.age}</TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>{patient.admission_date}</TableCell>
                        <TableCell>{patient.contact_number}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => editPatient(patient)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeletePatient(patient.patient_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Medications Tab */}
          <TabsContent value="medications" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{medications.length} total medications</p>
              <Dialog open={openMed} onOpenChange={(val) => { setOpenMed(val); if (!val) resetMedForm(); }}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" /> Add Medication</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingMed ? 'Edit Medication' : 'Add New Medication'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleMedSubmit} className="space-y-4">
                    <div>
                      <Label>Medication Name *</Label>
                      <Input value={medForm.medication_name} onChange={(e) => setMedForm({ ...medForm, medication_name: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Dosage *</Label>
                      <Input placeholder="e.g., 500mg" value={medForm.dosage} onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Form</Label>
                      <Select value={medForm.form} onValueChange={(val) => setMedForm({ ...medForm, form: val })}>
                        <SelectTrigger><SelectValue placeholder="Select form" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tablet">Tablet</SelectItem>
                          <SelectItem value="Capsule">Capsule</SelectItem>
                          <SelectItem value="Injection">Injection</SelectItem>
                          <SelectItem value="Syrup">Syrup</SelectItem>
                          <SelectItem value="Drops">Drops</SelectItem>
                          <SelectItem value="Cream">Cream</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => { setOpenMed(false); resetMedForm(); }}>Cancel</Button>
                      <Button type="submit">{editingMed ? 'Update' : 'Add'} Medication</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Medication Name</TableHead>
                    <TableHead>Dosage</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {medications.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center">No medications found</TableCell></TableRow>
                  ) : (
                    medications.map((med) => (
                      <TableRow key={med.medication_id}>
                        <TableCell className="font-medium">{med.medication_name}</TableCell>
                        <TableCell>{med.dosage}</TableCell>
                        <TableCell>{med.form}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => editMed(med)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteMed(med.medication_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Schedules Tab */}
          <TabsContent value="schedules" className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">{schedules.length} total schedules</p>
              <Dialog open={openSchedule} onOpenChange={(val) => { setOpenSchedule(val); if (!val) resetScheduleForm(); }}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" /> Add Schedule</Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingSchedule ? 'Edit Schedule' : 'Add New Schedule'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleScheduleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Patient *</Label>
                        <Select value={scheduleForm.patient_id} onValueChange={(val) => setScheduleForm({ ...scheduleForm, patient_id: val })} required>
                          <SelectTrigger><SelectValue placeholder="Select patient" /></SelectTrigger>
                          <SelectContent>
                            {patients.map((p) => (
                              <SelectItem key={p.patient_id} value={p.patient_id}>{p.patient_name} - Bed {p.bed_number}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Medication *</Label>
                        <Select value={scheduleForm.medication_id} onValueChange={(val) => setScheduleForm({ ...scheduleForm, medication_id: val })} required>
                          <SelectTrigger><SelectValue placeholder="Select medication" /></SelectTrigger>
                          <SelectContent>
                            {medications.map((m) => (
                              <SelectItem key={m.medication_id} value={m.medication_id}>{m.medication_name} ({m.dosage})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Route *</Label>
                        <Select value={scheduleForm.route_id} onValueChange={(val) => setScheduleForm({ ...scheduleForm, route_id: val })} required>
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
                        <Input type="time" value={scheduleForm.scheduled_time} onChange={(e) => setScheduleForm({ ...scheduleForm, scheduled_time: e.target.value })} required />
                      </div>
                      <div>
                        <Label>Frequency *</Label>
                        <Input placeholder="e.g., Daily, Twice daily" value={scheduleForm.frequency} onChange={(e) => setScheduleForm({ ...scheduleForm, frequency: e.target.value })} required />
                      </div>
                      <div>
                        <Label>Start Date *</Label>
                        <Input type="date" value={scheduleForm.start_date} onChange={(e) => setScheduleForm({ ...scheduleForm, start_date: e.target.value })} required />
                      </div>
                      <div>
                        <Label>End Date</Label>
                        <Input type="date" value={scheduleForm.end_date} onChange={(e) => setScheduleForm({ ...scheduleForm, end_date: e.target.value })} />
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={scheduleForm.is_active} onCheckedChange={(val) => setScheduleForm({ ...scheduleForm, is_active: val })} />
                        <Label>Active</Label>
                      </div>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => { setOpenSchedule(false); resetScheduleForm(); }}>Cancel</Button>
                      <Button type="submit">{editingSchedule ? 'Update' : 'Add'} Schedule</Button>
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
                  {schedules.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center">No schedules found</TableCell></TableRow>
                  ) : (
                    schedules.map((schedule) => (
                      <TableRow key={schedule.schedule_id}>
                        <TableCell className="font-medium">{schedule.patients?.patient_name}</TableCell>
                        <TableCell>{schedule.medications?.medication_name}</TableCell>
                        <TableCell>{schedule.routes_of_administration?.route_name}</TableCell>
                        <TableCell>{schedule.scheduled_time}</TableCell>
                        <TableCell>{schedule.frequency}</TableCell>
                        <TableCell>{schedule.start_date} {schedule.end_date && `- ${schedule.end_date}`}</TableCell>
                        <TableCell>
                          {schedule.is_active ? (
                            <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success">Active</span>
                          ) : (
                            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">Inactive</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => editSchedule(schedule)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteSchedule(schedule.schedule_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="nurses" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={openNurse} onOpenChange={(val) => { setOpenNurse(val); if (!val) resetNurseForm(); }}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" /> Add Nurse</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingNurse ? 'Edit Nurse' : 'Add Nurse'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleNurseSubmit} className="space-y-4">
                    <div>
                      <Label>Nurse Name *</Label>
                      <Input value={nurseForm.nurse_name} onChange={(e) => setNurseForm({ ...nurseForm, nurse_name: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Email *</Label>
                      <Input type="email" value={nurseForm.email} onChange={(e) => setNurseForm({ ...nurseForm, email: e.target.value })} required />
                    </div>
                    <div>
                      <Label>Department</Label>
                      <Select value={nurseForm.department_id} onValueChange={(val) => setNurseForm({ ...nurseForm, department_id: val })}>
                        <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d.department_id} value={d.department_id}>{d.department_name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Contact Number</Label>
                      <Input value={nurseForm.contact_number} onChange={(e) => setNurseForm({ ...nurseForm, contact_number: e.target.value })} />
                    </div>
                    <div>
                      <Label>Shift</Label>
                      <Select value={nurseForm.shift} onValueChange={(val) => setNurseForm({ ...nurseForm, shift: val })}>
                        <SelectTrigger><SelectValue placeholder="Select shift" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Morning">Morning</SelectItem>
                          <SelectItem value="Evening">Evening</SelectItem>
                          <SelectItem value="Night">Night</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => { setOpenNurse(false); resetNurseForm(); }}>Cancel</Button>
                      <Button type="submit">{editingNurse ? 'Update' : 'Add'}</Button>
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
                    <TableHead>Email</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {nurses.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center">No nurses found</TableCell></TableRow>
                  ) : (
                    nurses.map((nurse) => (
                      <TableRow key={nurse.nurse_id}>
                        <TableCell className="font-medium">{nurse.nurse_name}</TableCell>
                        <TableCell>{nurse.email}</TableCell>
                        <TableCell>{nurse.departments?.department_name || '-'}</TableCell>
                        <TableCell>{nurse.contact_number}</TableCell>
                        <TableCell>{nurse.shift}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => editNurse(nurse)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteNurse(nurse.nurse_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="departments" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={openDept} onOpenChange={(val) => { setOpenDept(val); if (!val) resetDeptForm(); }}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" /> Add Department</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingDept ? 'Edit Department' : 'Add Department'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleDeptSubmit} className="space-y-4">
                    <div>
                      <Label>Department Name *</Label>
                      <Input value={deptForm.department_name} onChange={(e) => setDeptForm({ department_name: e.target.value })} required />
                    </div>
                    <div className="flex gap-2 justify-end">
                      <Button type="button" variant="outline" onClick={() => { setOpenDept(false); resetDeptForm(); }}>Cancel</Button>
                      <Button type="submit">{editingDept ? 'Update' : 'Add'}</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department Name</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departments.length === 0 ? (
                    <TableRow><TableCell colSpan={2} className="text-center">No departments found</TableCell></TableRow>
                  ) : (
                    departments.map((dept) => (
                      <TableRow key={dept.department_id}>
                        <TableCell className="font-medium">{dept.department_name}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => editDept(dept)}><Edit className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteDept(dept.department_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
