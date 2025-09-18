import React, { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/dashboards/ui/card'
import { Input } from '@/components/dashboards/ui/input'
import { Button } from '@/components/dashboards/ui/button'
import { Label } from '@/components/dashboards/ui/label'
import { useToast } from '@/hooks/use-toast'
import { apiUrl } from '@/utils/APIUrl'
import { useNavigate, useSearchParams } from 'react-router-dom'

const ResetPassword = () => {
  const { toast } = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = useMemo(() => params.get('token') || '', [params])
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!token) {
      toast({ title: 'Invalid link', description: 'Reset link is missing.', variant: 'destructive' })
      return
    }
    if (password.length < 6) {
      toast({ title: 'Weak password', description: 'Use at least 6 characters.', variant: 'destructive' })
      return
    }
    if (password !== confirm) {
      toast({ title: 'Passwords do not match', description: 'Re-enter to confirm.', variant: 'destructive' })
      return
    }
    setIsSubmitting(true)
    try {
      const res = await fetch(`${apiUrl}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.message || 'Failed')
      toast({ title: 'Password reset', description: 'You can now log in.' })
      navigate('/login')
    } catch (err: any) {
      const message = err?.message || ''
      const expired = message.toLowerCase().includes('expired')
      toast({ title: expired ? 'Link expired' : 'Reset failed', description: expired ? 'Request a new reset link.' : message || 'Try requesting a new link.', variant: 'destructive' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='pt-24 md:pt-28 px-4'>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Set a new password</h1>
        <p className="mt-2 text-sm text-muted-foreground md:text-base">Enter and confirm your new password.</p>
      </div>

      <div className='mx-auto w-full max-w-md'>
        <Card>
          <CardHeader>
            <CardTitle>New password</CardTitle>
            <CardDescription>Make sure it’s something strong.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid gap-2'>
                <Label htmlFor='password'>Password</Label>
                <Input id='password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='••••••••' required />
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='confirm'>Confirm password</Label>
                <Input id='confirm' type='password' value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder='••••••••' required />
              </div>
              <Button type='submit' className='w-full' disabled={isSubmitting}>
                {isSubmitting ? 'Updating…' : 'Reset password'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ResetPassword


