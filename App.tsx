
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import GameRoom from './pages/GameRoom';
import Games from './pages/Games';
import { translations } from './translations';
import { PlayerLevel, User } from './types';
import { Languages } from 'lucide-react';

const AppContent: React.FC = () => {
  const { isLoggedIn, user, setUser, allUsers, setAllUsers, lang, setLang, addNotification } = useApp();
  const t = translations[lang];

  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');

  const toggleLanguage = () => {
    setLang(lang === 'bn' ? 'en' : 'bn');
  };

  const handleAuth = () => {
    setError('');
    
    // Super Admin Credentials
    if (phone === '01577378394' && password === 'AnAmFJAaj@1') {
      setUser({
        id: 'admin_1',
        phone,
        username: 'Super Admin',
        customId: 'ADMIN-PRO-MASTER',
        cashBalance: 0,
        bonusBalance: 0,
        referralCode: 'SUPERSYSTEM',
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        level: PlayerLevel.SUPERMAN,
        referralCount: 0,
        totalReferralBonus: 0,
        isAdmin: true,
        status: 'active',
        referrals: []
      });
      return;
    }

    if (!otpSent) {
      if (!phone || phone.length < 11) {
        setError(lang === 'en' ? 'Please enter a valid phone number' : 'সঠিক ফোন নম্বর লিখুন');
        return;
      }
      setOtpSent(true);
      return;
    }

    const existingUser = allUsers.find(u => u.phone === phone);

    if (existingUser) {
      if (existingUser.status === 'banned') {
        setError(t.bannedError);
        return;
      }
      setUser(existingUser);
    } else {
      const generatedUserId = `LUDO${Math.floor(1000 + Math.random() * 9000)}`;
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        phone,
        username: `User_${phone.substr(-4)}`,
        customId: generatedUserId,
        cashBalance: 0, 
        bonusBalance: 12,
        referralCode: Math.random().toString(36).substr(2, 6).toUpperCase(),
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        level: PlayerLevel.SILVER,
        referralCount: 0,
        totalReferralBonus: 0,
        status: 'active' as const,
        referrals: []
      };

      if (!isLogin && referralCode.length > 3) {
        newUser.bonusBalance += 15; 
      }

      setAllUsers(prev => [...prev, newUser]);
      setUser(newUser);
      
      setTimeout(() => {
        addNotification(newUser.id, lang === 'en' ? "Welcome! You've received a ৳12 signup bonus." : "স্বাগতম! আপনি ১২৳ সাইনআপ বোনাস পেয়েছেন।");
      }, 1000);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden relative font-sans">
        {/* Background Gradients */}
        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-accent/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-secondary/10 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Top Language Toggle for Auth Screen */}
        <div className="absolute top-8 right-8 z-[50]">
           <button 
             onClick={toggleLanguage} 
             className="px-4 py-2.5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all active:scale-95 flex items-center gap-2 backdrop-blur-md"
           >
             <Languages size={18} className="text-brand-accent" />
             <span className="text-[10px] font-black uppercase tracking-wider text-white">
               {lang === 'bn' ? 'English' : 'বাংলা'}
             </span>
           </button>
        </div>

        <div className="w-full max-w-md z-10 animate-slide-up">
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-brand-dark border border-white/10 rounded-3xl flex items-center justify-center font-bebas text-5xl mx-auto mb-6 shadow-2xl transform rotate-3 relative">
              <div className="absolute inset-0 bg-brand-accent/20 blur-xl rounded-full"></div>
              <span className="relative z-10 text-brand-accent">W</span>
            </div>
            <h1 className="text-4xl font-bebas tracking-wide text-white">WIN CASH PRO</h1>
            <p className="text-slate-500 font-bold tracking-widest text-[9px] mt-3 uppercase">{lang === 'en' ? 'The Professional Arena' : 'পেশাদার এরিনা'}</p>
          </div>

          <div className="bg-brand-dark p-8 rounded-[3rem] border border-white/5 shadow-2xl space-y-8">
            <div className="flex bg-brand-black p-1.5 rounded-2xl border border-white/5">
              <button 
                onClick={() => { setIsLogin(true); setOtpSent(false); setError(''); }}
                className={`flex-1 py-3 text-center font-bebas text-xl tracking-wide transition-all rounded-xl ${isLogin ? 'bg-brand-accent text-brand-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                {t.login}
              </button>
              <button 
                onClick={() => { setIsLogin(false); setOtpSent(false); setError(''); }}
                className={`flex-1 py-3 text-center font-bebas text-xl tracking-wide transition-all rounded-xl ${!isLogin ? 'bg-brand-accent text-brand-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
              >
                {t.register}
              </button>
            </div>

            {error && (
              <div className="bg-brand-secondary/10 border border-brand-secondary/30 p-4 rounded-2xl text-brand-secondary text-[11px] font-bold text-center animate-in fade-in">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider ml-1">{t.phone}</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full bg-brand-black border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-accent transition-all text-white font-bold tracking-wide"
                />
              </div>

              {phone === '01577378394' ? (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-[9px] font-black text-brand-accent uppercase tracking-wider ml-1">Secure Admin Key</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-brand-black border border-brand-accent/50 rounded-2xl px-6 py-4 focus:outline-none focus:ring-1 focus:ring-brand-accent text-white font-mono"
                  />
                </div>
              ) : (
                <>
                  {otpSent && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider ml-1">{t.otp}</label>
                      <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-brand-black border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-accent text-white tracking-[0.3em] font-black text-center text-xl"
                      />
                    </div>
                  )}
                  {!isLogin && !otpSent && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider ml-1">{t.referralCode}</label>
                      <input 
                        type="text" 
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        placeholder="OPTIONAL"
                        className="w-full bg-brand-black border border-white/10 rounded-2xl px-6 py-4 focus:outline-none focus:border-brand-accent text-white font-bold uppercase tracking-wider"
                      />
                    </div>
                  )}
                </>
              )}

              <button 
                onClick={handleAuth}
                className="w-full bg-brand-accent text-brand-black py-5 rounded-2xl font-bebas text-2xl tracking-wide transition-all shadow-xl shadow-brand-accent/10 active:scale-95 mt-4 btn-premium"
              >
                {otpSent || phone === '01577378394' ? (lang === 'en' ? 'CONTINUE' : 'চালিয়ে যান') : (lang === 'en' ? 'VERIFY' : 'যাচাই করুন')}
              </button>
            </div>
          </div>
          
          <p className="text-center text-slate-600 text-[9px] font-black mt-12 tracking-widest uppercase">
            © 2024 WIN CASH PRO ARENA.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/game" element={<GameRoom />} />
          <Route path="/games" element={<Games />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
