import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/dashboards/ui/button';
import { Input } from '@/components/dashboards/ui/input';
import { Textarea } from '@/components/dashboards/ui/textarea';
import axios from 'axios';
import { apiUrl } from '@/utils/APIUrl';

const addDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const PrescriptionNew: React.FC = () => {
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const appointmentId = search.get('appointmentId') || '';

  const [diagnosis, setDiagnosis] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [expiry, setExpiry] = React.useState<string>(addDays(30));
  const [medications, setMedications] = React.useState<Array<{ medicationName: string; dosage: string; frequency: string; duration: string; quantity: number; instructions?: string }>>([
    { medicationName: '', dosage: '', frequency: '', duration: '', quantity: 1, instructions: '' },
  ]);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);

  const addMedicationRow = () => setMedications(prev => [...prev, { medicationName: '', dosage: '', frequency: '', duration: '', quantity: 1, instructions: '' }]);
  const updateMedication = (idx: number, key: string, value: any) => {
    setMedications(prev => prev.map((m, i) => (i === idx ? { ...m, [key]: value } : m)));
  };
  const removeMedication = (idx: number) => setMedications(prev => prev.filter((_, i) => i !== idx));

  const submit = async () => {
    if (!appointmentId) {
      setError('Missing appointmentId');
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const payload = {
        diagnosis: diagnosis || undefined,
        notes: notes || undefined,
        expiryDate: expiry,
        medications: medications.filter(m => m.medicationName && m.dosage && m.frequency && m.duration && m.quantity),
      };
      await axios.post(`${apiUrl}/prescriptions/consultation/${appointmentId}`, payload);
      navigate('/dashboard');
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save prescription');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 pt-24 md:pt-32 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">New Prescription</h1>
      {!appointmentId && <div className="text-red-600 text-sm mb-2">No appointment specified.</div>}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Diagnosis</label>
          <Input value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="e.g., Acute pulpitis" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="Additional notes" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Expiry Date</label>
          <Input type="date" value={expiry.slice(0,10)} onChange={e => setExpiry(new Date(e.target.value).toISOString())} />
        </div>
        <div className="space-y-2">
          {medications.map((m, idx) => (
            <div key={idx} className="border rounded p-3 grid grid-cols-2 gap-2">
              <Input placeholder="Medication" value={m.medicationName} onChange={e => updateMedication(idx, 'medicationName', e.target.value)} />
              <Input placeholder="Dosage" value={m.dosage} onChange={e => updateMedication(idx, 'dosage', e.target.value)} />
              <Input placeholder="Frequency" value={m.frequency} onChange={e => updateMedication(idx, 'frequency', e.target.value)} />
              <Input placeholder="Duration" value={m.duration} onChange={e => updateMedication(idx, 'duration', e.target.value)} />
              <Input type="number" min={1} placeholder="Quantity" value={m.quantity} onChange={e => updateMedication(idx, 'quantity', Number(e.target.value))} />
              <Input placeholder="Instructions (optional)" value={m.instructions || ''} onChange={e => updateMedication(idx, 'instructions', e.target.value)} />
              <div className="col-span-2 flex justify-end">
                {medications.length > 1 && (
                  <Button variant="outline" size="sm" onClick={() => removeMedication(idx)}>Remove</Button>
                )}
              </div>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addMedicationRow}>Add Medication</Button>
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button onClick={submit} disabled={saving || !appointmentId}>{saving ? 'Saving…' : 'Save Prescription'}</Button>
        </div>
      </div>
    </div>
  );
};

export default PrescriptionNew;
