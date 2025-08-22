import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

const Login = () => {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = String(formData.get('email') || '').trim()
    const password = String(formData.get('password') || '')

    if (!email || !password) {
      toast({
        title: 'Missing information',
        description: 'Please provide both email and password.',
        variant: 'destructive',
      })
      return
    }

    try {
      setIsSubmitting(true)
      await new Promise((r) => setTimeout(r, 800))
      toast({ title: 'Welcome back', description: 'Login successful.' })
    } catch (err) {
      toast({ title: 'Login failed', description: 'Please try again.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogle = async () => {
    toast({ title: 'Redirecting to Google…' })
    // Wire to your OAuth route here
  }

  return (
    <div className='pt-24 md:pt-28 px-4'>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Login to your Account</h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">Access your appointments and care securely.</p>
      </div>

      <div className='mx-auto w-full max-w-md'>
        <Card>
          <CardHeader>
            <CardTitle>Sign in</CardTitle>
            <CardDescription>Use your email and password, or continue with Google.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid gap-2'>
                <Label htmlFor='email'>Email</Label>
                <Input id='email' name='email' type='email' placeholder='you@example.com' required />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='password'>Password</Label>
                <div className='relative'>
                  <Input id='password' name='password' type={showPassword ? 'text' : 'password'} placeholder='••••••••' required className='pr-10' />
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    className='absolute right-1.5 top-1/2 h-8 w-8 -translate-y-1/2 text-muted-foreground'
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='h-4 w-4'>
                        <path d='M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.74-1.64 1.79-3.14 3.11-4.39M10.58 10.58A2 2 0 0 0 13.42 13.42M6.1 6.1 17.9 17.9M9.88 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8a11.65 11.65 0 0 1-2.24 3.19' />
                      </svg>
                    ) : (
                      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' className='h-4 w-4'>
                        <path d='M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z' />
                        <circle cx='12' cy='12' r='3' />
                      </svg>
                    )}
                  </Button>
                </div>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <label className='flex items-center gap-2'>
                  <input type='checkbox' name='remember' className='h-4 w-4 rounded border' />
                  <span>Remember me</span>
                </label>
                <a href='/forgot-password' className='text-primary underline-offset-4 hover:underline'>Forgot password?</a>
              </div>
              <Button type='submit' className='w-full' disabled={isSubmitting}>
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <div className='my-6 flex items-center gap-3'>
              <div className='h-px w-full bg-border' />
              <span className='text-xs text-muted-foreground'>or</span>
              <div className='h-px w-full bg-border' />
            </div>

            <Button type='button' variant='outline' className='w-full' onClick={handleGoogle}>
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' className='mr-2 h-4 w-4'>
                <path fill='#FFC107' d='M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C33.241,6.053,28.884,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z'/>
                <path fill='#FF3D00' d='M6.306,14.691l6.571,4.819C14.655,16.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657 C33.241,6.053,28.884,4,24,4C16.318,4,9.656,8.337,6.306,14.691z'/>
                <path fill='#4CAF50' d='M24,44c4.799,0,9.193-1.837,12.53-4.826l-5.787-4.893C28.651,35.188,26.427,36,24,36 c-5.202,0-9.619-3.327-11.283-7.964l-6.522,5.025C9.505,39.556,16.227,44,24,44z'/>
                <path fill='#1976D2' d='M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.07,5.607 c0.001-0.001,0.002-0.001,0.003-0.002l5.787,4.893C36.846,39.202,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z'/>
              </svg>
              Continue with Google
            </Button>

            <p className='mt-6 text-center text-sm text-muted-foreground'>
              Don’t have an account? <a className='text-primary underline-offset-4 hover:underline' href='/signup'>Sign up</a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login
