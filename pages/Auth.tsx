import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Loader2, Sparkles, Mail, Lock, User, AlertCircle, RefreshCw, ChevronRight, ExternalLink, CheckCircle2, UserPlus } from 'lucide-react';
import { supabase } from '../services/supabase';

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isServerBlock, setIsServerBlock] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setIsServerBlock(false);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            }
          }
        });
        
        if (signUpError) throw signUpError;

        // If user is created but no session, confirmation is still ON in Supabase
        if (data.user && !data.session) {
          setIsServerBlock(true);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({ 
          email: email.trim().toLowerCase(), 
          password 
        });
        
        if (signInError) {
          const msg = signInError.message.toLowerCase();
          // Only trigger server block for actual confirmation issues
          if (msg.includes('confirmed') || msg.includes('verification')) {
            setIsServerBlock(true);
          } else {
            throw signInError;
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setIsServerBlock(false);
    setError(null);
    setLoading(false);
  };

  const staggerClass = (index: number) => 
    `transition-all duration-700 ease-out delay-[${index * 100}ms] ${isMounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`;

  return (
    <div className="fixed inset-0 bg-[#0F1115] z-[100] flex flex-col px-7 justify-center overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[40%] bg-[#00db9a]/[0.02] blur-[100px] rounded-full" />
      </div>
      
      <div className="w-full max-w-[340px] mx-auto flex flex-col">
        {/* Logo Icon */}
        <div className={`flex justify-center mb-6 ${staggerClass(0)}`}>
          <div className="relative w-12 h-12 bg-[#1C1F26] rounded-[20px] border border-white/10 flex items-center justify-center shadow-2xl">
             <div className="absolute inset-0 bg-[#00db9a] rounded-[20px] blur-[15px] opacity-10 animate-pulse" />
             <Sparkles size={20} className="text-[#00db9a]" />
          </div>
        </div>
        
        {/* Header Text */}
        <div className={`text-center mb-6 ${staggerClass(1)}`}>
          <h1 className="text-2xl font-black text-white tracking-tighter mb-1">
            {isSignUp ? 'New Studio' : 'Creator Login'}
          </h1>
          <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">
            Production Pipeline Node
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAuth} className={`space-y-3 relative z-10 ${staggerClass(2)}`}>
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/5 rounded-[32px] p-4 pb-5 space-y-3 shadow-2xl">
            
            {isServerBlock ? (
              <div className="space-y-4 py-2 animate-in fade-in zoom-in-95">
                <div className="bg-[#00db9a]/5 border border-[#00db9a]/10 rounded-2xl p-5 flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-[#00db9a]/10 rounded-full flex items-center justify-center mb-3">
                    <AlertCircle size={20} className="text-[#00db9a]" />
                  </div>
                  <h4 className="text-[#00db9a] text-[11px] font-black uppercase tracking-widest mb-3">Check Confirmation</h4>
                  
                  <div className="text-left w-full space-y-3 mb-5">
                    <p className="text-zinc-400 text-[10px] leading-relaxed">
                      If you already turned it OFF and clicked <b>SAVE</b>, this specific email might be stuck.
                    </p>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                       <p className="text-white text-[10px] font-bold mb-1">Recommended Fix:</p>
                       <p className="text-zinc-500 text-[10px]">Click "Join Now" and use a <b>new email address</b> to test the direct entry.</p>
                    </div>
                  </div>

                  <a 
                    href="https://supabase.com/dashboard" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center space-x-2 text-[#00db9a] text-[10px] font-black uppercase tracking-widest hover:underline mb-2"
                  >
                    <span>Supabase Dashboard</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
                
                <button 
                  type="button"
                  onClick={handleReset}
                  className="w-full bg-white text-black h-[52px] rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-xl"
                >
                  <RefreshCw size={14} />
                  <span>I fixed it, Login now</span>
                </button>
              </div>
            ) : (
              <>
                {isSignUp && (
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#00db9a] transition-colors">
                      <User size={14} />
                    </div>
                    <input 
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full auth-input rounded-2xl h-[48px] pl-11 pr-4 outline-none font-bold text-white transition-all text-[13px] placeholder:text-zinc-700"
                    />
                  </div>
                )}

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#00db9a] transition-colors">
                    <Mail size={14} />
                  </div>
                  <input 
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full auth-input rounded-2xl h-[48px] pl-11 pr-4 outline-none font-bold text-white transition-all text-[13px] placeholder:text-zinc-700"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#00db9a] transition-colors">
                    <Lock size={14} />
                  </div>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full auth-input rounded-2xl h-[48px] pl-11 pr-11 outline-none font-bold text-white transition-all text-[13px] tracking-tight placeholder:text-zinc-700"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {error && !isServerBlock && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start space-x-2">
                     <AlertCircle size={14} className="text-red-500 flex-shrink-0 mt-0.5" />
                     <p className="text-red-400 text-[10px] font-bold leading-tight uppercase tracking-tight">{error}</p>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full neon-btn h-[52px] rounded-[20px] font-black text-sm flex items-center justify-center space-x-2 active:scale-95 transition-all disabled:opacity-50 mt-1"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : (isSignUp ? 'Create Hub' : 'Enter Studio')}
                </button>
              </>
            )}

            <p className="text-center text-[10px] font-black pt-2 text-zinc-600 uppercase tracking-widest">
              {isSignUp ? 'Existing user?' : "New creator?"}{' '}
              <button 
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); handleReset(); }}
                className="text-[#00db9a] ml-1"
              >
                {isSignUp ? 'Sign In' : 'Join Now'}
              </button>
            </p>
          </div>
        </form>

        <div className={`mt-8 text-center opacity-20 ${staggerClass(3)}`}>
          <p className="text-[7px] font-black text-zinc-600 uppercase tracking-[0.4em]">CreatorFlow Production Node V1.2.9</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;