import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(email, password);
      
      if (success) {
        toast({
          title: 'Welcome back!',
          description: 'You have successfully logged in.',
        });
        navigate('/home');
      } else {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: 'Invalid email or password. Try demo@city.gov / demo123',
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-accent/5 to-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Link to="/" className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-3xl">🏙️</span>
          </div>
          <div>
            <h1 className="font-bold text-2xl">CivicHub</h1>
            <p className="text-sm text-muted-foreground">City Services Platform</p>
          </div>
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your civic services dashboard
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="demo@city.gov"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                <p className="font-medium mb-1">Demo Credentials:</p>
                <p>Email: demo@city.gov</p>
                <p>Password: demo123</p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </>
                )}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground smooth-transition">
            ← Back to home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
