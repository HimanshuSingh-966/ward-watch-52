import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Stethoscope, Plus, Edit, Trash2 } from 'lucide-react';
import Layout from '@/components/Layout';

type Procedure = {
  procedure_id: string;
  procedure_name: string;
  description: string;
  duration?: string;
};

const Procedures = () => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Procedure | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    procedure_name: '',
    description: '',
    duration: '',
  });

  useEffect(() => {
    fetchProcedures();
  }, []);

  const fetchProcedures = async () => {
    try {
      const { data, error } = await supabase
        .from('procedures')
        .select('*')
        .order('procedure_name');

      if (error) throw error;
      setProcedures(data || []);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingItem) {
        const { error } = await supabase
          .from('procedures')
          .update(formData)
          .eq('procedure_id', editingItem.procedure_id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Procedure updated successfully' });
      } else {
        const { error } = await supabase.from('procedures').insert([formData]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Procedure added successfully' });
      }

      setOpen(false);
      resetForm();
      fetchProcedures();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this procedure?')) return;
    try {
      const { error } = await supabase.from('procedures').delete().eq('procedure_id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Procedure deleted successfully' });
      fetchProcedures();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (item: Procedure) => {
    setEditingItem(item);
    setFormData({
      procedure_name: item.procedure_name,
      description: item.description,
      duration: item.duration || '',
    });
    setOpen(true);
  };

  const resetForm = () => {
    setFormData({ procedure_name: '', description: '', duration: '' });
    setEditingItem(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Procedure Management</h1>
          </div>
          <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Procedure</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Procedure' : 'Add New Procedure'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Procedure Name *</Label>
                  <Input 
                    placeholder="e.g., Dressing Change, IV Insertion"
                    value={formData.procedure_name} 
                    onChange={(e) => setFormData({ ...formData, procedure_name: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <Label>Description *</Label>
                  <Textarea 
                    placeholder="Brief description of the procedure"
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <Label>Duration (Optional)</Label>
                  <Input 
                    placeholder="e.g., 15 minutes, 30 min"
                    value={formData.duration} 
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })} 
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
                  <Button type="submit">{editingItem ? 'Update' : 'Add'} Procedure</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Procedure Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
              ) : procedures.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center">No procedures found</TableCell></TableRow>
              ) : (
                procedures.map((item) => (
                  <TableRow key={item.procedure_id}>
                    <TableCell className="font-medium">{item.procedure_name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.duration || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.procedure_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

export default Procedures;
