import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import Input from '@/common/Input';
import Button from '@/common/Button';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPassword = password.trim();

    if (!sanitizedEmail || !sanitizedPassword) {
      toast.error('Email and password are required');
      return;
    }

    const maliciousRegex = /[<>'";\\?]/;
    if (maliciousRegex.test(sanitizedEmail) || maliciousRegex.test(sanitizedPassword)) {
      toast.error("Input contains invalid characters");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      toast.error('Please enter a valid email address');
      return;
    }

    if (sanitizedPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    await login(sanitizedEmail, sanitizedPassword);
    setIsSubmitting(false);
  };


  return (
    <>
      <Head>
        <title>Login | Glowison ERP</title>
      </Head>
      <div 
        className="min-h-screen flex w-full bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url('/colorful_flowers_dark_background.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        
        {/* Login Form */}
        <div className="w-full relative z-10 flex items-center justify-center p-6 sm:p-12">
          <div className="w-full max-w-md backdrop-blur-xs bg-white/10 p-8 rounded-3xl shadow-2xl border border-white/20">
            <div className="mb-10 text-center">
              <h2 className="text-3xl font-bold text-white drop-shadow-lg">Welcome back</h2>
              <p className="text-white/80 mt-2 font-medium">Please enter your details to sign in.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-white/90 mb-1">Email</label>
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
                <label className="block text-sm font-medium text-white/90 mb-1">Password</label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" aria-hidden="true" />
                    ) : (
                      <Eye className="h-5 w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 bg-white/20"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-white/90">
                    Remember me
                  </label>
                </div>
              </div>

              <Button
                type="submit"
                variant="solid"
                className="w-full justify-center py-3 text-base font-bold shadow-xl hover:shadow-2xl transition-all"
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
