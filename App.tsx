
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
import { PlayerLevel, Transaction } from './types';

const AppContent: React.FC = () => {
  const { isLoggedIn, user, setUser, lang, addTransaction } = useApp();
  const t = translations[lang];

  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');

  const handleAuth = () => {
    // Admin Login Check
    if (phone === '01577378394' && password === 'AnAmFJAaj@1') {
      setUser({
        id: 'admin_1',
        phone,
        username: 'Admin',
        customId: 'ADMIN001',
        cashBalance: 0,
        bonusBalance: 0,
        referralCode: 'ADMINPRO',
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
      setOtpSent(true);
      return;
    }

    // Normal User Flow
    const generatedUserId = `LUDO${Math.floor(1000 + Math.random() * 9000)}`;
    const newUser = {
      id: Math.random().toString(36).substr(2, 9),
      phone,
      username: `User_${phone.substr(-4)}`,
      customId: generatedUserId,
      cashBalance: isLogin ? 100 : 0, // Initial balance
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

    // If registered with referral code, simulate bonus
    if (!isLogin && referralCode.length > 3) {
      newUser.bonusBalance = 15;
      alert(t.referralBonusMsg);
    }

    setUser(newUser);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-slate-800 p-8 rounded-[2.5rem] border border-slate-700 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center font-bebas text-4xl mx-auto mb-6 shadow-xl shadow-amber-500/20">W</div>
            <h1 className="text-3xl font-bebas text-center tracking-widest mb-2">{isLogin ? t.login : t.register}</h1>
            <p className="text-slate-400 text-center text-sm mb-8">Premium Cash Gaming Experience</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.phone}</label>
                <input 
                  type="tel" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 transition-colors text-white"
                />
              </div>

              {phone === '01577378394' ? (
                <div className="space-y-2 animate-in slide-in-from-top-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest text-amber-500">Admin Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-900 border border-amber-500 rounded-xl px-4 py-3 focus:outline-none text-white"
                  />
                </div>
              ) : (
                <>
                  {otpSent && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.otp}</label>
                      <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="123456"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-white"
                      />
                    </div>
                  )}
                  {!isLogin && !otpSent && (
                    <div className="space-y-2 animate-in slide-in-from-top-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.referralCode}</label>
                      <input 
                        type="text" 
                        value={referralCode}
                        onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                        placeholder="ABCD12"
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-500 text-white"
                      />
                    </div>
                  )}
                </>
              )}

              <button 
                onClick={handleAuth}
                className="w-full bg-amber-500 hover:bg-amber-600 py-4 rounded-xl font-bebas text-2xl tracking-widest transition-all shadow-lg shadow-amber-500/20 active:scale-95 mt-4"
              >
                {otpSent || phone === '01577378394' ? 'Confirm' : 'Send OTP'}
              </button>

              <p className="text-center text-slate-500 text-xs pt-4">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button 
                  onClick={() => { setIsLogin(!isLogin); setOtpSent(false); }}
                  className="ml-2 text-amber-500 font-bold hover:underline"
                >
                  {isLogin ? t.register : t.login}
                </button>
              </p>
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl"></div>
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
