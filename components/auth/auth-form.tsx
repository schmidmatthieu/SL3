'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

interface AuthFormProps {
  isRegister?: boolean
}

export function AuthForm({ isRegister = false }: AuthFormProps) {
  const { login, register } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(event.currentTarget)
      
      if (isRegister) {
        await register({
          email: formData.get('email') as string,
          password: formData.get('password') as string,
          firstName: formData.get('firstName') as string,
          lastName: formData.get('lastName') as string,
        })
        toast({
          title: 'Account created!',
          description: 'You have successfully registered.',
        })
      } else {
        await login({
          email: formData.get('email') as string,
          password: formData.get('password') as string,
        })
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
        })
      }
      
      // Attendre un court instant pour que l'état soit mis à jour
      setTimeout(() => {
        router.push('/events')
        router.refresh()
      }, 100)
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-[380px]">
      <CardHeader>
        <CardTitle>{isRegister ? 'Create an account' : 'Login'}</CardTitle>
        <CardDescription>
          {isRegister
            ? 'Enter your information below to create your account'
            : 'Enter your email below to login to your account'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit}>
        <CardContent className="space-y-4">
          {isRegister && (
            <>
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="John"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Doe"
                  required
                  disabled={isLoading}
                />
              </div>
            </>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="m@example.com"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isLoading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isRegister ? 'Create account' : 'Login'}
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            type="button"
            disabled={isLoading}
            asChild
          >
            <Link href={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Already have an account?' : 'Create an account'}
            </Link>
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}