import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Input from '@/common/Input';
import Button from '@/common/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    await login(email, password);
    setIsSubmitting(false);
  };


  return (
    <>
      <Head>
        <title>Login | Glowison ERP</title>
      </Head>
      <div className="min-h-screen flex w-full bg-gray-50">
        
        {/* Left Side: Graphic */}
        <div className="hidden lg:flex w-1/2 relative bg-primary-900 items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="/login-bg.jpg" 
              alt="Glowison ERP"
              className="opacity-90 w-full h-full object-cover object-center"
            />
          </div>
          <div className="relative z-10 p-12 text-white text-center">
            <h1 className="text-5xl font-serif font-bold mb-4 tracking-tight">Welcome to Glowison ERP</h1>
            <p className="text-lg font-serif font-light text-white/80 max-w-md mx-auto">
              Streamline your business operations.
            </p>
          </div>
          {/* Glassmorphism overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-900/60 to-transparent mix-blend-multiply z-0"></div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 mt-2">Please enter your details to sign in.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@glowison.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                variant="solid"
                className="w-full justify-center py-2.5 text-base shadow-lg shadow-primary-600/20"
                disabled={isSubmitting}
                isLoading={isSubmitting}
              >
                Sign in
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
