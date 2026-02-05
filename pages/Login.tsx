import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { authService } from '../services/authService';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentUser, showNotification } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate inputs
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      showNotification("Please enter your email", "error");
      return;
    }
    
    if (!password) {
      showNotification("Please enter your password", "error");
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await authService.loginWithEmail(trimmedEmail, password);
      
      if (result.success && result.user) {
        await setCurrentUser(result.user);
        showNotification("Welcome back!", "success");
        navigate('/');
      } else {
        showNotification(result.error || "Login failed", "error");
      }
    } catch (error) {
      console.error('Login error:', error);
      showNotification("An unexpected error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    try {
      const result = await authService.signInWithGoogle();
      
      if (result.success && result.user) {
        await setCurrentUser(result.user);
        showNotification("Welcome back!", "success");
        navigate('/');
      } else {
        showNotification(result.error || "Google sign-in failed", "error");
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      showNotification("An unexpected error occurred. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex items-center justify-center px-4 pt-28 pb-20 relative min-h-screen"
        style={{
          backgroundImage: 'url(https://lh3.googleusercontent.com/aida-public/AB6AXuAExjVBNTAU34dcReSW8zqqd_uUq_5bWmdixQnygpdTUY8uCJ6_uYoR8oK32laM8lR56WK0DGxS4CBb48JhjyziPKOwlSGaTVlTHKtswzebnmwYf_LfTyM5H2EkAam_6swIOk8Zbi-p-AhYkYZjlyGiZMboWfirdOyg13Ma89PI9JF5goCNbbogE8rhaxPaL9vYYE_VG2-F_yyvJN0ESik1RSrEwOcvSWevL3Fh_rLVzbaMovpvqPk25QVKEtyePE9jnB134ecb)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal/90 via-deep-charcoal/85 to-charcoal/95 backdrop-blur-[2px]"></div>
        <div className="relative z-10 w-full max-w-2xl bg-charcoal/50 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 md:p-20 shadow-2xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">Login</h1>
            <p className="text-gray-400 text-base font-light">Join the sustainable textile marketplace</p>
          </div>
          <form className="space-y-12" onSubmit={handleLogin}>
            <div className="space-y-10">
              <div className="group relative border-b border-gray-600 focus-within:border-white transition-colors duration-300">
                <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1 font-semibold" htmlFor="email">Email Address</label>
                <input
                  className="w-full bg-transparent border-none px-0 py-3 text-white placeholder-gray-700 focus:ring-0 text-lg transition-all"
                  id="email"
                  placeholder="you@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="group relative border-b border-gray-600 focus-within:border-white transition-colors duration-300">
                <div className="flex justify-between items-end">
                  <label className="block text-[10px] uppercase tracking-[0.2em] text-gray-500 mb-1 font-semibold" htmlFor="password">Password</label>
                  <a className="text-[10px] uppercase tracking-widest text-gray-500 hover:text-white transition-colors mb-1" href="#">Forgot?</a>
                </div>
                <input
                  className="w-full bg-transparent border-none px-0 py-3 text-white placeholder-gray-700 focus:ring-0 text-lg transition-all"
                  id="password"
                  placeholder="••••••••••••"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="pt-6">
              <button 
                className="w-full bg-white text-slate-900 font-bold py-5 rounded-xl text-lg hover:bg-gray-200 transition-all duration-300 shadow-xl disabled:opacity-50 disabled:cursor-not-allowed" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
              
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-charcoal/50 text-gray-400 uppercase tracking-wider text-xs">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full bg-transparent border-2 border-white/20 text-white font-semibold py-4 rounded-xl text-base hover:bg-white/10 hover:border-white/40 transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Sign in with Google
              </button>

              <div className="text-center mt-10">
                <p className="text-gray-400 text-sm">
                  Don't have an account?
                  <Link to="/signup" className="text-white font-medium hover:text-primary transition-colors ml-1">Sign Up</Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Login;