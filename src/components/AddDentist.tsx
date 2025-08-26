import React, { useState } from 'react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '@/utils/APIUrl.ts';
import { useMutation } from '@tanstack/react-query'

interface DentistFormData {
  // User fields
  emailAddress: string;
  firstName: string;
  lastName: string;
  userName: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  password: string;
  dateOfBirth: string;
  // Dentist specific fields
  dentistId: string;
  specialization: string;
  education: string;
  experience: string;
  bio: string;
  availability: string;
  hourlyRate: string;
}

const AddDentist = () => {
  const [formData, setFormData] = useState<DentistFormData>({
    emailAddress: '',
    firstName: '',
    lastName: '',
    userName: '',
    phoneNumber: '',
    address: '',
    city: '',
    state: '',
    password: '',
    dateOfBirth: '',
    dentistId: '',
    specialization: '',
    education: '',
    experience: '',
    bio: '',
    availability: '',
    hourlyRate: ''
  });
  const { toast } = useToast()
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const { mutate, isPending } = useMutation({
    mutationKey: ["add Dentist"],
    mutationFn: async (data: DentistFormData) => {
      // Only send required fields for dentist registration by ADMIN
const payload = {
  firstName: data.firstName,
  lastName: data.lastName,
  emailAddress: data.emailAddress,
  userName: data.userName,
  password: data.password,
  address: data.address,
  city: data.city,
  state: data.state,
  phoneNumber: data.phoneNumber,
  dateOfBirth: data.dateOfBirth,
  role: 'DENTIST',
  dentistId: data.dentistId,
  specialization: data.specialization,
  education: data.education,
  experience: data.experience,
  bio: data.bio,
  availability: data.availability,
  hourlyRate: data.hourlyRate
};

      const response = await axios.post(`${apiUrl}/auth/register`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Dentist registered successfully!',
        variant: 'default',
      });
      navigate('/dashboard');
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        toast({
          title: 'Registration failed',
          description: error.response?.data?.message || 'Please check the form and try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'An error occurred',
          description: 'Please try again later.',
          variant: 'destructive',
        });
      }
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Optionally, check for admin role here (UI-level guard)
    // if (!userIsAdmin) return;
    mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Register New Dentist</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Email</label>
            <input
              type="email"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        {/* User Account Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Username</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        {/* Address Information */}
        <div>
          <label className="block mb-1">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        {/* Professional Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">License Number</label>
            <input
              type="text"
              name="dentistId"
              value={formData.dentistId}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Date of Birth</label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Specialization</label>
            <input
              type="text"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-1">Years of Experience</label>
            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block mb-1">Education</label>
          <input
            type="text"
            name="education"
            value={formData.education}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1">Availability</label>
            <input
              type="text"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="e.g., Mon-Fri 9AM-5PM"
            />
          </div>
          <div>
            <label className="block mb-1">Hourly Rate ($)</label>
            <input
              type="number"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
        >
          Register Dentist
        </button>
      </form>
    </div>
  );
};

export default AddDentist;
