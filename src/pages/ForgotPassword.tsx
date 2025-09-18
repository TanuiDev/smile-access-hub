import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/dashboards/ui/card'
import { Input } from '@/components/dashboards/ui/input'
import { Button } from '@/components/dashboards/ui/button'
import { Label } from '@/components/dashboards/ui/label'
import { useToast } from '@/hooks/use-toast'
import { apiUrl } from '@/utils/APIUrl'

const ForgotPassword = () => {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailAddress: email })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed')
      toast({ title: 'Check your email', description: 'We sent a reset link if the email exists.' })
    } catch (err: any) {
      toast({ title: 'Email not found', description: err?.message || 'Enter the correct email', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='pt-24 md:pt-28 px-4'>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Forgot password</h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">Enter your email to get a reset link.</p>
      </div>

      <div className='mx-auto w-full max-w-md'>
        <Card>
          <CardHeader>
            <CardTitle>Reset password</CardTitle>
            <CardDescription>We will email you a reset link.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid gap-2'>
                <Label htmlFor='email'>Email address</Label>
                <Input id='email' type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='you@example.com' required />
              </div>
              <Button type='submit' className='w-full' disabled={isSubmitting}>
                {isSubmitting ? 'Sending…' : 'Send reset link'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPassword


