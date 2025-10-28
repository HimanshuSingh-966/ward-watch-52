import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Settings, Plus, Edit, Trash2 } from 'lucide-react';
import Layout from '@/components/Layout';

const Admin = () => {
  const [nurses, setNurses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [openNurse, setOpenNurse] = useState(false);
  const [openDept, setOpenDept] = useState(false);
  const [editingNurse, setEditingNurse] = useState<any>(null);
  const [editingDept, setEditingDept] = useState<any>(null);
  const { toast } = useToast();

  const [nurseForm, setNurseForm] = useState({
    nurse_name: '',
    department_id: '',
    contact_number: '',
    email: '',
    shift: '',
  });

  const [deptForm, setDeptForm] = useState({ department_name: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [nursesRes, deptsRes] = await Promise.all([
        supabase.from('nurses').select('*, departments(department_name)').order('nurse_name'),
        supabase.from('departments').select('*').order('department_name'),
      ]);

      if (nursesRes.error) throw nursesRes.error;
      if (deptsRes.error) throw deptsRes.error;

      setNurses(nursesRes.data || []);
      setDepartments(deptsRes.data || []);
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

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>

        <Tabs defaultValue="nurses">
          <TabsList>
            <TabsTrigger value="nurses">Nurses</TabsTrigger>
            <TabsTrigger value="departments">Departments</TabsTrigger>
          </TabsList>

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
