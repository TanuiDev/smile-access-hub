
import  { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { apiUrl } from '@/utils/APIUrl';

type AppointmentPayload = {
  appointmentDate: string;
  timeSlot: string;
  duration: number;
  appointmentType: 'VIDEO_CHAT' | 'IN_PERSON';
  conditionDescription: string;
  patientAge: number;
  conditionDuration: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  notes: string;
};


type AppointmentForm = {
  appointmentDate: string;
  timeSlot: string;
  duration: number | string;
  appointmentType: 'VIDEO_CHAT' | 'IN_PERSON';
  conditionDescription: string;
  patientAge: string | number;
  conditionDuration: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  notes: string;
};

const initialForm: AppointmentForm = {
  appointmentDate: '',
  timeSlot: '',
  duration: 30,
  appointmentType: 'VIDEO_CHAT',
  conditionDescription: '',
  patientAge: '',
  conditionDuration: '',
  severity: 'LOW',
  notes: '',
};

const Appointment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState<AppointmentForm>({ ...initialForm });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  const { mutate: submitAppointment, isPending } = useMutation({
    mutationKey: ['book-appointment'],
    mutationFn: async (formData: AppointmentPayload) => {
      const response = await axios.post(`${apiUrl}/appointments/create`, formData, {
        withCredentials: true, 
      });
      return response.data;
    },
    onSuccess: (data) => {
      setSuccess('Appointment booked successfully!');
      setSubmitting(false);
  setForm({ ...initialForm });
      navigate('/dashboard');
    },
    onError: (err) => {
      setError('Failed to book appointment');
      setSubmitting(false);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    const amount = 1; // TODO: compute from form/services
    const payload: AppointmentPayload = {
      ...form,
      patientAge: Number(form.patientAge),
      duration: Number(form.duration),
      appointmentType: form.appointmentType as 'VIDEO_CHAT' | 'IN_PERSON',
      severity: form.severity as 'LOW' | 'MEDIUM' | 'HIGH',
    };
    // Send user to payment page with appointment data
    navigate('/pay', { state: { appointmentPayload: payload, amount } });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50  pt-24 md:pt-28 px-4">
      <form
        className="w-full max-w-lg bg-white p-8 rounded-lg shadow-md space-y-4"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">Book Appointment</h2>

       


        
        <div>
          <label className="block text-sm font-medium mb-1">Appointment Date</label>
          <input
            type="date"
            name="appointmentDate"
            value={form.appointmentDate}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          />
        </div>

      
        <div>
          <label className="block text-sm font-medium mb-1">Time Slot</label>
          <input
            type="time"
            name="timeSlot"
            value={form.timeSlot}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          />
        </div>

        
        <div>
          <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
          <input
            type="number"
            name="duration"
            min="10"
            max="120"
            value={form.duration}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          />
        </div>

       
        <div>
          <label className="block text-sm font-medium mb-1">Appointment Type</label>
          <select
            name="appointmentType"
            value={form.appointmentType}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          >
            <option value="VIDEO_CHAT">Video Chat</option>
            <option value="IN_PERSON">In Person</option>
          </select>
        </div>

        {/* Condition Description */}
        <div>
          <label className="block text-sm font-medium mb-1">Condition Description</label>
          <textarea
            name="conditionDescription"
            value={form.conditionDescription}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            rows={2}
          />
        </div>

        {/* Patient Age */}
        <div>
          <label className="block text-sm font-medium mb-1">Patient Age</label>
          <input
            type="number"
            name="patientAge"
            min="0"
            value={form.patientAge}
            onChange={handleChange}
            required
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          />
        </div>

        {/* Condition Duration */}
        <div>
          <label className="block text-sm font-medium mb-1">Condition Duration</label>
          <input
            type="text"
            name="conditionDuration"
            value={form.conditionDuration}
            onChange={handleChange}
            required
            placeholder="e.g. 1 week"
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          />
        </div>

        {/* Severity */}
        <div>
          <label className="block text-sm font-medium mb-1">Severity</label>
          <select
            name="severity"
            value={form.severity}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring"
            rows={2}
          />
        </div>

        {/* Feedback */}
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition disabled:opacity-50"
        >
          {submitting ? 'Redirecting…' : 'Continue to Payment'}
        </button>
      </form>
    </div>
  );
};

export default Appointment;
