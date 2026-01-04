import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';

const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        variant: 'destructive',
        title: 'Passwords do not match',
        description: 'Please make sure both passwords are identical.',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Password too short',
        description: 'Password must be at least 6 characters long.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const success = await signup(email, password, name);
      
      if (success) {
        toast({
          title: 'Account created!',
          description: 'Welcome to Jan Awaaz. Redirecting to your dashboard...',
        });
        navigate('/home');
      } else {
        toast({
          variant: 'destructive',
          title: 'Signup failed',
          description: 'This email is already registered. Please try logging in.',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex flex-col md:flex-row min-h-screen"
      >
        {/* Left: form */}
        <div className="w-full md:w-1/2 flex items-center justify-center bg-white p-4 sm:p-6">
          <div className="w-full max-w-md">
            <Link to="/" className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-transparent flex items-center justify-center overflow-hidden">
                <img src="/awaaz logo .png" alt="Jan Awaaz logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-semibold">Jan Awaaz</h1>
                <p className="text-xs sm:text-sm text-gray-500">City Services Platform</p>
              </div>
            </Link>

            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-md">
              <h2 className="text-xl sm:text-2xl font-bold mb-1">Create Account</h2>
              <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">Join Jan Awaaz to report issues and engage with your community</p>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
                <div>
                  <Label htmlFor="name" className="text-sm text-gray-700">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-green-500 focus:ring-1 focus:ring-green-100"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm text-gray-700">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-green-500 focus:ring-1 focus:ring-green-100"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm text-gray-700">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-green-500 focus:ring-1 focus:ring-green-100"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-sm text-gray-700">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="mt-2 w-full rounded-lg border border-gray-200 px-4 py-3 focus:border-green-500 focus:ring-1 focus:ring-green-100"
                  />
                </div>

                <div>
                  <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 text-white rounded-lg py-3 font-medium transition-shadow shadow-sm" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </div>

                <p className="text-sm text-center text-gray-500">Already have an account? <Link to="/login" className="text-green-600 font-medium">Sign in</Link></p>
              </form>
            </div>
          </div>
        </div>

        {/* Right: decorative panel */}
        <div className="w-full md:w-1/2 hidden md:flex items-center justify-center bg-gradient-to-br from-green-700 to-green-400 p-8">
          <div className="max-w-lg text-white text-center px-6">
            <h3 className="text-3xl font-extrabold mb-4">Join your community</h3>
            <p className="mb-6 opacity-90">Create an account to report and track city issues, and collaborate with neighbors.</p>
            <div className="w-full h-64 relative">
              <svg viewBox="0 0 600 400" className="w-full h-full opacity-90">
                <defs>
                  <linearGradient id="g2" x1="0" x2="1">
                    <stop offset="0" stopColor="#10b981" />
                    <stop offset="1" stopColor="#047857" />
                  </linearGradient>
                </defs>
                <rect x="0" y="0" width="600" height="400" rx="24" fill="url(#g2)" opacity="0.0" />
                <circle cx="120" cy="80" r="60" fill="#059669" opacity="0.18" />
                <rect x="320" y="120" rx="32" ry="32" width="220" height="120" fill="#047857" opacity="0.18" />
                <ellipse cx="260" cy="260" rx="100" ry="60" fill="#059669" opacity="0.12" />
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
