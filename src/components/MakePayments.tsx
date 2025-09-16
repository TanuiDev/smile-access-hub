import React, { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query'
import axios from 'axios'
import {apiUrl} from '@/utils/APIUrl.ts'
import { useToast } from '@/hooks/use-toast'
import { useLocation, useNavigate } from 'react-router-dom'

const DEFAULT_AMOUNT = 1; 

const MakePayments = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

    const { toast } = useToast()
    const navigate = useNavigate()
    const location = useLocation()
    const appointmentPayload = (location.state as any)?.appointmentPayload
    const amountFromState = (location.state as any)?.amount
    const amount = useMemo(() => amountFromState ?? DEFAULT_AMOUNT, [amountFromState])

    const {mutateAsync: initiate, isPending} = useMutation({
      mutationKey: ["make-payment"],
      mutationFn: async () => {
        const response = await axios.post(`${apiUrl}/mpesa/initiate`, {
          phoneNumber,
          amount,
        });
        return response.data;
      },
      onError: () => {
        toast({
          title: 'Payment failed',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
        setError('Payment failed. Please try again.');
      },
    })

    const pollPaymentStatus = async (checkoutRequestId: string, timeoutMs = 120000, intervalMs = 3000) => {
      const start = Date.now();
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const s = await axios.get(`${apiUrl}/mpesa/status`, { params: { checkoutRequestId }, withCredentials: true });
        const status = s.data?.data?.status;
        if (status === 'SUCCESS') return true;
        if (status === 'FAILED' || status === 'CANCELLED') throw new Error('Payment failed');
        if (Date.now() - start >= timeoutMs) throw new Error('Payment timeout');
        await new Promise(r => setTimeout(r, intervalMs));
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(false);
    try {
      const res = await initiate();
      const checkoutRequestId = res?.response?.CheckoutRequestID;
      if (!checkoutRequestId) throw new Error('Failed to initiate payment');
      toast({ title: 'Payment initiated', description: 'Check your phone and enter your M-Pesa PIN.' });
      await pollPaymentStatus(checkoutRequestId);
      setSuccess(true);

      if (appointmentPayload) {
        await axios.post(`${apiUrl}/appointments/create`, appointmentPayload, { withCredentials: true });
      }

      toast({ title: 'Payment successful', description: 'Your appointment has been booked.' });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err?.message || 'Payment failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center  min-h-[60vh] px-2  pt-24 md:pt-28 ">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-lg shadow-md p-6 flex flex-col gap-6"
      >
        <h2 className="text-2xl font-bold text-center mb-2">Make a Payment</h2>
        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="text"
            value={`KES ${amount}`}
            readOnly
            className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed text-lg font-semibold"
          />
        </div>
        <div>
          <label htmlFor="phoneNumber" className="block text-sm font-medium mb-1">
            Phone Number
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            placeholder="e.g. 0712345678"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
            pattern="[0-9]{10,15}"
            inputMode="numeric"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Pay Now'}
        </button>
        {success && (
          <div className="text-green-600 text-center font-medium">Payment successful!</div>
        )}
        {error && (
          <div className="text-red-600 text-center font-medium">{error}</div>
        )}
      </form>
    </div>
  );
};

export default MakePayments;
