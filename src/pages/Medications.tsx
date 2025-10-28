import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Pill, Plus, Edit, Trash2 } from 'lucide-react';
import Layout from '@/components/Layout';

type Medication = {
  medication_id: string;
  medication_name: string;
  dosage: string;
  form: string;
};

const Medications = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    medication_name: '',
    dosage: '',
    form: '',
  });

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .order('medication_name');

      if (error) throw error;
      setMedications(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMed) {
        const { error } = await supabase
          .from('medications')
          .update(formData)
          .eq('medication_id', editingMed.medication_id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Medication updated successfully' });
      } else {
        const { error } = await supabase.from('medications').insert([formData]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Medication added successfully' });
      }

      setOpen(false);
      resetForm();
      fetchMedications();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medication?')) return;
    try {
      const { error } = await supabase.from('medications').delete().eq('medication_id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Medication deleted successfully' });
      fetchMedications();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (med: Medication) => {
    setEditingMed(med);
    setFormData({
      medication_name: med.medication_name,
      dosage: med.dosage,
      form: med.form,
    });
    setOpen(true);
  };

  const resetForm = () => {
    setFormData({ medication_name: '', dosage: '', form: '' });
    setEditingMed(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Medication Management</h1>
          </div>
          <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Medication</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingMed ? 'Edit Medication' : 'Add New Medication'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Medication Name *</Label>
                  <Input value={formData.medication_name} onChange={(e) => setFormData({ ...formData, medication_name: e.target.value })} required />
                </div>
                <div>
                  <Label>Dosage *</Label>
                  <Input placeholder="e.g., 500mg" value={formData.dosage} onChange={(e) => setFormData({ ...formData, dosage: e.target.value })} required />
                </div>
                <div>
                  <Label>Form *</Label>
                  <Input placeholder="e.g., Tablet, Injection, Syrup" value={formData.form} onChange={(e) => setFormData({ ...formData, form: e.target.value })} required />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
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
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
              ) : medications.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center">No medications found</TableCell></TableRow>
              ) : (
                medications.map((med) => (
                  <TableRow key={med.medication_id}>
                    <TableCell className="font-medium">{med.medication_name}</TableCell>
                    <TableCell>{med.dosage}</TableCell>
                    <TableCell>{med.form}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(med)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(med.medication_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

export default Medications;
