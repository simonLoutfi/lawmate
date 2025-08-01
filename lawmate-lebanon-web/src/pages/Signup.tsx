import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '@/lib/firebase'; 


type UserType = 'user' | 'lawyer' | 'mokhtar';

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'user' as UserType,
    businessName: '',
    licenseNumber: '',
    barAssociation: '',
    mokhtarOffice: '',
    phone: '',
    specialties: '',
    languages: '',
    pricePerSession: '',
    experience: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

    const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError('');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      // Optionally send result.user info to your backend here
      navigate('/dashboard');
    } catch (error: any) {
      setError('Failed to sign up with Google. Please try again.');
      console.error('Google signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.userType === 'mokhtar' && !formData.mokhtarOffice) {
      setError('Office information is required for mokhtars');
      return;
    }

    try {
      setIsLoading(true);
      
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
        businessName: formData.businessName,
        ...(formData.userType === 'lawyer' && {
          barAssociation: formData.barAssociation,
          phone: formData.phone,
          specialties: formData.specialties,
          languages: formData.languages,
          pricePerSession: formData.pricePerSession,
          experience: formData.experience,
        }),
        ...(formData.userType === 'mokhtar' && {
          mokhtarOffice: formData.mokhtarOffice,
        }),
      };

      await register(userData);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lawmate-light to-white flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md sm:max-w-lg">
        {/* Logo */}
        <div className="text-center mb-4 sm:mb-6">
          <Link to="/" className="flex items-center justify-center space-x-2">
            <div className="w-10 h-10 bg-lawmate-blue rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">LM</span>
            </div>
            <span className="text-2xl font-semibold text-lawmate-blue">LawMate</span>
          </Link>
          <h2 className="text-xl sm:text-2xl font-bold text-lawmate-blue mt-2 sm:mt-4">
            Create your account
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Start your free trial today
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-center text-lawmate-blue text-lg sm:text-xl">
              Sign up
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    name="firstName"
                    type="text" 
                    placeholder="First name" 
                    value={formData.firstName} 
                    onChange={handleChange} 
                    required 
                    disabled={isLoading}
                    className="text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName"
                    type="text" 
                    placeholder="Last name" 
                    value={formData.lastName} 
                    onChange={handleChange} 
                    required 
                    disabled={isLoading}
                    className="text-sm sm:text-base"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email" 
                  placeholder="Enter your email" 
                  value={formData.email} 
                  onChange={handleChange} 
                  required 
                  disabled={isLoading}
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userType">Account Type</Label>
                <select
                  id="userType"
                  name="userType"
                  value={formData.userType}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-md text-sm sm:text-base"
                  disabled={isLoading}
                >
                  <option value="user">Regular User</option>
                  <option value="lawyer">Lawyer</option>
                  <option value="mokhtar">Mokhtar</option>
                </select>
              </div>

              {formData.userType === 'lawyer' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="text"
                      placeholder="Phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialties">Specialties</Label>
                    <Input
                      id="specialties"
                      name="specialties"
                      type="text"
                      placeholder="e.g. Commercial Law"
                      value={formData.specialties}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="languages">Languages</Label>
                    <Input
                      id="languages"
                      name="languages"
                      type="text"
                      placeholder="e.g. Arabic, English"
                      value={formData.languages}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                      className="text-sm sm:text-base"
                    />
                  </div>
                </>
              )}

              {formData.userType === 'mokhtar' && (
                <div className="space-y-2">
                  <Label htmlFor="mokhtarOffice">Office Location</Label>
                  <Input 
                    id="mokhtarOffice" 
                    name="mokhtarOffice"
                    type="text" 
                    placeholder="Your office location" 
                    value={formData.mokhtarOffice} 
                    onChange={handleChange} 
                    required
                    disabled={isLoading}
                    className="text-sm sm:text-base"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name (Optional)</Label>
                <Input 
                  id="businessName" 
                  name="businessName"
                  type="text" 
                  placeholder="Your business name" 
                  value={formData.businessName} 
                  onChange={handleChange} 
                  disabled={isLoading}
                  className="text-sm sm:text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input 
                  id="password" 
                  name="password"
                  type="password" 
                  placeholder="Create a password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  disabled={isLoading}
                  className="text-sm sm:text-base"
                />
                <p className="text-xs text-gray-500">
                  Must be at least 8 characters with letters and numbers
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type="password" 
                  placeholder="Confirm your password" 
                  value={formData.confirmPassword} 
                  onChange={handleChange} 
                  required 
                  disabled={isLoading}
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="flex items-start space-x-2">
                <input 
                  type="checkbox" 
                  className="mt-1" 
                  required 
                  disabled={isLoading}
                />
                <p className="text-xs sm:text-sm text-gray-600">
                  I agree to the{' '}
                  <Link to="/terms" className="text-lawmate-blue hover:underline">Terms</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-lawmate-blue hover:underline">Privacy Policy</Link>
                </p>
              </div>

              <div className="pt-3 sm:pt-4">
<div className="flex justify-center">
  <Button
    type="submit"
    // className="font-medium py-2 px-4 rounded-md transition-colors text-white bg-lawmate-blue hover:bg-lawmate-blue-dark"
  >
    {isLoading ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Creating Account...
      </>
    ) : 'Create Account'}
  </Button>
</div>


              </div>
            </form>
<div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full mt-4 border-gray-300" 
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continue with Google
              </Button>
            </div>
            <div className="mt-5 sm:mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-lawmate-blue hover:underline font-semibold">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-4 sm:mt-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3 mb-3">
            <p className="text-xs sm:text-sm text-green-700">
              🎉 <strong>14-day free trial</strong> - No credit card required
            </p>
          </div>
          <p className="text-xs sm:text-sm text-gray-500">
            Start generating contracts immediately after signup
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;