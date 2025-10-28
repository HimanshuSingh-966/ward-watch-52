import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { FlaskConical, Plus, Edit, Trash2 } from 'lucide-react';
import Layout from '@/components/Layout';

type Investigation = {
  investigation_id: string;
  investigation_name: string;
  description: string;
  normal_range?: string;
};

const Investigations = () => {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Investigation | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    investigation_name: '',
    description: '',
    normal_range: '',
  });

  useEffect(() => {
    fetchInvestigations();
  }, []);

  const fetchInvestigations = async () => {
    try {
      const { data, error } = await supabase
        .from('investigations')
        .select('*')
        .order('investigation_name');

      if (error) throw error;
      setInvestigations(data || []);
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
          .from('investigations')
          .update(formData)
          .eq('investigation_id', editingItem.investigation_id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Investigation updated successfully' });
      } else {
        const { error } = await supabase.from('investigations').insert([formData]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Investigation added successfully' });
      }

      setOpen(false);
      resetForm();
      fetchInvestigations();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this investigation?')) return;
    try {
      const { error } = await supabase.from('investigations').delete().eq('investigation_id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Investigation deleted successfully' });
      fetchInvestigations();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleEdit = (item: Investigation) => {
    setEditingItem(item);
    setFormData({
      investigation_name: item.investigation_name,
      description: item.description,
      normal_range: item.normal_range || '',
    });
    setOpen(true);
  };

  const resetForm = () => {
    setFormData({ investigation_name: '', description: '', normal_range: '' });
    setEditingItem(null);
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold">Investigation Management</h1>
          </div>
          <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) resetForm(); }}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> Add Investigation</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingItem ? 'Edit Investigation' : 'Add New Investigation'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Investigation Name *</Label>
                  <Input 
                    placeholder="e.g., CBC, Blood Test, X-Ray"
                    value={formData.investigation_name} 
                    onChange={(e) => setFormData({ ...formData, investigation_name: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <Label>Description *</Label>
                  <Textarea 
                    placeholder="Brief description of the investigation"
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                    required 
                  />
                </div>
                <div>
                  <Label>Normal Range (Optional)</Label>
                  <Input 
                    placeholder="e.g., 120-140 mg/dL"
                    value={formData.normal_range} 
                    onChange={(e) => setFormData({ ...formData, normal_range: e.target.value })} 
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => { setOpen(false); resetForm(); }}>Cancel</Button>
                  <Button type="submit">{editingItem ? 'Update' : 'Add'} Investigation</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Investigation Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Normal Range</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center">Loading...</TableCell></TableRow>
              ) : investigations.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center">No investigations found</TableCell></TableRow>
              ) : (
                investigations.map((item) => (
                  <TableRow key={item.investigation_id}>
                    <TableCell className="font-medium">{item.investigation_name}</TableCell>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{item.normal_range || '-'}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}><Edit className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.investigation_id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
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

export default Investigations;
