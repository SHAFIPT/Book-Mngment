import React, { useState } from 'react';
import { BookOpen, Eye, EyeOff, Mail, Lock, User, Users, ShoppingCart, Star, ArrowRight, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuth from '../hooks/useAuth';
import DashboardRouter from '../routes/DashboardRouter';

const BookStoreApp = () => {
  const { handleLogin, handleRegister } = useAuth();
  const [currentView, setCurrentView] = useState('landing');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role : 'RETAIL'
  });

  const handleLoginSubmit = async () => {
    if (!loginForm.email || !loginForm.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const res = await handleLogin({
      email: loginForm.email,
      password: loginForm.password,
    });
    setLoading(false);

    if (res.success) {
      toast.success('Login successful!');
      setCurrentView('dashboard'); 
    } else {
      toast.error(res.message || 'Login failed');
    }
  };

  const handleRegisterSubmit = async () => {
    const { name, email, password, confirmPassword, role } = registerForm;
  
    if (!name || !email || !password || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }
  
    if (password !== confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
  
    setLoading(true);
    const res = await handleRegister({
      name,
      email,
      password,
      confirmPassword,
      role: role as 'AUTHOR' | 'RETAIL' // Capitalized role
    });
    setLoading(false);
  
    if (res.success) {
      toast.success('Registration successful! Please log in.');
      setCurrentView('login');
    } else {
      toast.error(res.message || 'Registration failed');
    }
  };

  
    

  // Move components outside to prevent re-creation on each render
  const renderNavBar = () => (
    <nav className="absolute top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-amber-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentView('landing')}>
            <BookOpen className="h-8 w-8 text-amber-600" />
            <span className="text-xl font-bold text-gray-800">BookVault</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <button 
              onClick={() => setCurrentView('login')}
              className="text-gray-700 hover:text-amber-600 transition-colors font-medium"
            >
              Sign In
            </button>
            <button 
              onClick={() => setCurrentView('register')}
              className="bg-amber-600 text-white px-6 py-2 rounded-full hover:bg-amber-700 transition-colors font-medium"
            >
              Get Started
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-amber-600"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-amber-100 shadow-lg">
            <div className="px-4 py-4 space-y-3">
              <button 
                onClick={() => {
                  setCurrentView('login');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left text-gray-700 hover:text-amber-600 transition-colors font-medium py-2"
              >
                Sign In
              </button>
              <button 
                onClick={() => {
                  setCurrentView('register');
                  setIsMenuOpen(false);
                }}
                className="block w-full bg-amber-600 text-white px-6 py-3 rounded-full hover:bg-amber-700 transition-colors font-medium text-center"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  const renderLandingPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {renderNavBar()}
      
      {/* Hero Section */}
      <div className="relative pt-16 pb-20 sm:pt-24 sm:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-screen">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-2 mb-6">
                <Star className="h-5 w-5 text-amber-500 fill-current" />
                <Star className="h-5 w-5 text-amber-500 fill-current" />
                <Star className="h-5 w-5 text-amber-500 fill-current" />
                <Star className="h-5 w-5 text-amber-500 fill-current" />
                <Star className="h-5 w-5 text-amber-500 fill-current" />
                <span className="text-sm text-gray-600 ml-2">Trusted by 50K+ readers</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Your Gateway to
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-red-600 block">
                  Literary Adventures
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Discover, purchase, and collect your favorite books. Join thousands of readers 
                and authors in our vibrant literary community.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => setCurrentView('register')}
                  className="group bg-gradient-to-r from-amber-600 to-red-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
                >
                  Start Reading Today
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => setCurrentView('login')}
                  className="border-2 border-amber-600 text-amber-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-amber-600 hover:text-white transition-all duration-300"
                >
                  Sign In
                </button>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">10K+</div>
                  <div className="text-sm text-gray-600">Books Available</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">5K+</div>
                  <div className="text-sm text-gray-600">Active Authors</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900">50K+</div>
                  <div className="text-sm text-gray-600">Happy Readers</div>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative">
              <div className="relative z-10 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-amber-100">
                <div className="space-y-6">
                  {/* Mock Book Cards */}
                  <div className="flex space-x-4 overflow-hidden">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex-shrink-0 w-32 h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                        <div className="p-3 h-full flex flex-col justify-between text-white text-xs">
                          <div>
                            <div className="font-bold mb-1">Book Title {i}</div>
                            <div className="opacity-75">By Author {i}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">₹{200 + i * 100}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center space-x-3">
                      <ShoppingCart className="h-6 w-6 text-green-600" />
                      <div>
                        <div className="font-semibold text-green-800">Recent Purchase</div>
                        <div className="text-sm text-green-600">"The Great Adventure" - ₹450</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full opacity-80 animate-pulse"></div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-gradient-to-br from-pink-400 to-red-500 rounded-full opacity-60 animate-bounce"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoginPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="h-10 w-10 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-800">BookVault</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
          <p className="text-gray-600">Sign in to continue your reading journey</p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-indigo-100">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded text-indigo-600 focus:ring-indigo-500" />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="button"
              onClick={handleLoginSubmit}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Sign In
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => setCurrentView('register')}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Sign up
              </button>
            </p>
          </div>

          <button
            onClick={() => setCurrentView('landing')}
            className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  const renderRegisterPage = () => (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <BookOpen className="h-10 w-10 text-emerald-600" />
            <span className="text-2xl font-bold text-gray-800">BookVault</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Join BookVault</h2>
          <p className="text-gray-600">Create your account and start exploring</p>
        </div>

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-emerald-100">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  value={registerForm.role}
                  onChange={(e) => setRegisterForm({...registerForm, role: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 appearance-none"
                >
                  <option value="RETAIL">📚 Reader (Buy Books)</option>
                  <option value="AUTHOR">✍️ Author (Sell Books)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={registerForm.confirmPassword}
                  onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input type="checkbox" required className="rounded text-emerald-600 focus:ring-emerald-500" />
              <span className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-emerald-600 hover:text-emerald-800 font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-emerald-600 hover:text-emerald-800 font-medium">
                  Privacy Policy
                </a>
              </span>
            </div>

            <button
              type="button"
              onClick={handleRegisterSubmit}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Create Account
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => setCurrentView('login')}
                className="text-emerald-600 hover:text-emerald-800 font-semibold"
              >
                Sign in
              </button>
            </p>
          </div>

          <button
            onClick={() => setCurrentView('landing')}
            className="w-full mt-4 text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="font-sans relative">
      {/* Loading Spinner Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="w-16 h-16 border-4 border-white border-dashed rounded-full animate-spin"></div>
        </div>
      )}
  
      {/* Page View */}
      {currentView === 'landing' && renderLandingPage()}
      {currentView === 'login' && renderLoginPage()}
      {currentView === 'register' && renderRegisterPage()}
      {currentView === 'dashboard' && <DashboardRouter />}
      
    </div>
  );
};

export default BookStoreApp;