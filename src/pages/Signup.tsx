import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/dashboards/ui/card'
import { Input } from '@/components/dashboards/ui/input'
import { Button } from '@/components/dashboards/ui/button'
import { Label } from '@/components/dashboards/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import {apiUrl} from '@/utils/APIUrl.ts'

const Signup = () => {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  type SignupPayload = {
    firstName: string;
    lastName: string;
    userName: string;
    emailAddress: string;
    phoneNumber: string;
    address: string;
    city: string;
    state: string;
    dateOfBirth: string;
    password: string;
    role: string;
  };

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["user Register"],
    mutationFn: async (payload: SignupPayload) => {
      const response = await axios.post(`${apiUrl}/auth/register`, payload);
      return response.data;
    },
    onSuccess: () => {
      toast({ title: 'Account created', description: 'Welcome to DentaLink!' });
      navigate("/login");
    },
    onError: () => {
      toast({
        title: 'Registration failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    const payload = {
      firstName: String(formData.get('firstName') || '').trim(),
      lastName: String(formData.get('lastName') || '').trim(),
      userName: String(formData.get('userName') || '').trim(),
      emailAddress: String(formData.get('emailAddress') || '').trim(),
      phoneNumber: String(formData.get('phoneNumber') || '').trim(),
      address: String(formData.get('address') || '').trim(),
      city: String(formData.get('city') || '').trim(),
      state: String(formData.get('state') || '').trim(),
      dateOfBirth: String(formData.get('dateOfBirth') || '').trim(),
      password: String(formData.get('password') || ''),
      role: String(formData.get('role') || '').trim() || 'PATIENT',
    }

    if (!payload.firstName || !payload.lastName || !payload.emailAddress || !payload.password) {
      toast({ title: 'Missing information', description: 'Please complete required fields.', variant: 'destructive' })
      return
    }

    const confirmPassword = String(formData.get('confirmPassword') || '')
    if (payload.password !== confirmPassword) {
      toast({ title: 'Passwords do not match', description: 'Please confirm your password.', variant: 'destructive' })
      return
    }

    try {
      setIsSubmitting(true);
      await mutateAsync(payload);
      form.reset();
    } catch (err) {
      toast({ title: 'Signup failed', description: 'Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='pt-24 md:pt-28 px-4'>
      <div className='mb-10 text-center'>
        <h1 className='text-3xl font-bold tracking-tight md:text-4xl'>Create your account</h1>
        <p className='mt-2 text-sm text-muted-foreground md:text-base'>Join DentaLink to access your care, anywhere.</p>
      </div>

      <div className='mx-auto w-full max-w-3xl'>
        <Card>
          <CardHeader>
            <CardTitle>Sign up</CardTitle>
            <CardDescription>Fill in your details to get started.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-5'>
              <div className='grid gap-4 md:grid-cols-2'>
                <div className='grid gap-2'>
                  <Label htmlFor='firstName'>First name</Label>
                  <Input id='firstName' name='firstName' placeholder='John' required />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='lastName'>Last name</Label>
                  <Input id='lastName' name='lastName' placeholder='Doe' required />
                </div>
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <div className='grid gap-2'>
                  <Label htmlFor='userName'>Username</Label>
                  <Input id='userName' name='userName' placeholder='BrianTanui' />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='emailAddress'>Email address</Label>
                  <Input id='emailAddress' name='emailAddress' type='email' placeholder='brian@example.com' required />
                </div>
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <div className='grid gap-2'>
                  <Label htmlFor='phoneNumber'>Phone number</Label>
                  <Input id='phoneNumber' name='phoneNumber' type='tel' placeholder='5559876543' />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='dateOfBirth'>Date of birth</Label>
                  <Input id='dateOfBirth' name='dateOfBirth' type='date' />
                </div>
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <div className='grid gap-2'>
                  <Label htmlFor='address'>Address</Label>
                  <Input id='address' name='address' placeholder='456 Patient Avenue' />
                </div>
                <div className='grid gap-2'>
                  <Label htmlFor='city'>City</Label>
                  <Input id='city' name='city' placeholder='Houston' />
                </div>
              </div>

              <div className='grid gap-4 md:grid-cols-2'>
                <div className='grid gap-2'>
                  <Label htmlFor='state'>State</Label>
                  <Input id='state' name='state' placeholder='TX' />
                </div>
                
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='password'>Password</Label>
                <Input id='password' name='password' type='password' placeholder='password123' required />
                <p className='text-xs text-muted-foreground'>Use at least 8 characters.</p>
              </div>

              <div className='grid gap-2'>
                <Label htmlFor='confirmPassword'>Confirm password</Label>
                <Input id='confirmPassword' name='confirmPassword' type='password' placeholder='password123' required />
              </div>

              <Button type='submit' className='w-full' disabled={isSubmitting}>
                {isSubmitting ? 'Creating account…' : 'Create account'}
              </Button>

              <p className='text-center text-sm text-muted-foreground'>
                Already have an account? <a className='text-primary underline-offset-4 hover:underline' href='/login'>Log in</a>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Signup
