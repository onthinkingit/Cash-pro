
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Wallet from './pages/Wallet';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import GameRoom from './pages/GameRoom';
import { translations } from './translations';
import { PlayerLevel } from './types';

const AppContent: React.FC = () => {
  const { isLoggedIn, user, setUser, lang } = useApp();
  const t = translations[lang];

  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleAuth = () => {
    if (phone === '01577378394' && password === 'AnAmFJAaj@1') {
      setUser({
        id: 'admin_1',
        phone,
        username: 'Admin',
        customId: 'ADMIN001',
        cashBalance: 1000,
        bonusBalance: 500,
        referralCode: 'ADMINPRO',
        matchesPlayed: 150,
        wins: 120,
        losses: 30,
        level: PlayerLevel.SUPERMAN,
        referralCount: 45,
        totalReferralBonus: 675,
        isAdmin: true,
        status: 'active',
        referrals: []
      });
      return;
    }

    if (!otpSent) {
      setOtpSent(true);
      return;
    }

    const generatedUserId = `LUDO${Math.floor(1000 + Math.random() * 9000)}`;
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      phone,
      username: `User_${phone.substr(-4)}`,
      customId: generatedUserId,
      cashBalance: isLogin ? 100 : 0,
      bonusBalance: 0,
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
      newUser.bonusBalance = 15;
      alert(t.referralBonusMsg);
    }

    setUser(newUser);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden">
        {/* Background Accents */}
        <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-full max-w-md z-10 animate-slide-up">
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-600 rounded-3xl flex items-center justify-center font-bebas text-6xl mx-auto mb-4 shadow-2xl shadow-orange-500/30 transform rotate-3">
              W
            </div>
            <h1 className="text-5xl font-bebas tracking-[0.2em] text-white">WIN CASH PRO</h1>
            <p className="text-slate-400 font-medium tracking-widest text-xs mt-2 uppercase">Earn while you play</p>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-700/50 shadow-2xl space-y-6">
            <div className="flex gap-4 mb-4">
              <button 
                onClick={() => { setIsLogin(true); setOtpSent(false); }}
                className={`flex-1 pb-4 text-center font-bebas text-2xl tracking-widest transition-all border-b-2 ${isLogin ? 'text-amber-500 border-amber-500' : 'text-slate-500 border-transparent'}`}
              >
                {t.login}
              </button>
              <button 
                onClick={() => { setIsLogin(false); setOtpSent(false); }}
                className={`flex-1 pb-4 text-center font-bebas text-2xl tracking-widest transition-all border-b-2 ${!isLogin ? 'text-amber-500 border-amber-500' : 'text-slate-500 border-transparent'}`}
              >
                {t.register}
              </button>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t.phone}</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-white font-medium"
                />
              </div>

              {phone === '01577378394' ? (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-[10px] font-bold text-amber-500/70 uppercase tracking-widest ml-1">Secure Admin Key</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/50 border border-amber-500/50 rounded-2xl px-5 py-4 focus:outline-none focus:ring-1 focus:ring-amber-500 text-white font-mono"
                  />
                </div>
              ) : (
                <>
                  {otpSent && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t.otp}</label>
                      <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-amber-500 text-white tracking-[0.5em] font-bold text-center"
                      />
                    </div>
                  )}
                  {!isLogin && !otpSent && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{t.referralCode}</label>
                      <input 
                        type="text" 
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        placeholder="OPTIONAL"
                        className="w-full bg-slate-950/50 border border-slate-700 rounded-2xl px-5 py-4 focus:outline-none focus:border-amber-500 text-white font-bold uppercase tracking-widest"
                      />
                    </div>
                  )}
                </>
              )}

              <button 
                onClick={handleAuth}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 py-5 rounded-2xl font-bebas text-3xl tracking-widest text-white transition-all shadow-xl shadow-orange-500/20 active:scale-[0.98] mt-4"
              >
                {otpSent || phone === '01577378394' ? 'AUTHENTICATE' : 'GET VERIFIED'}
              </button>
            </div>
          </div>
          
          <p className="text-center text-slate-500 text-xs mt-8 tracking-widest font-medium">
            © 2024 WIN CASH PRO. ALL RIGHTS RESERVED.
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
