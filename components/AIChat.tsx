
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { X, Send, BrainCircuit, Loader2, User } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface Message {
  role: 'user' | 'model';
  content: string;
}

const AIChat: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { lang, user } = useApp();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: lang === 'en' ? "Hello! I am your Win Cash Pro AI Strategist. How can I help you win today?" : "হ্যালো! আমি আপনার উইন ক্যাশ প্রো এআই স্ট্র্যাটেজিস্ট। আজ আপনাকে জিততে কীভাবে সাহায্য করতে পারি?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: userMessage,
        config: {
          systemInstruction: `You are Win Cash Pro AI Strategy Assistant. 
          The user is playing a competitive Ludo cash game platform in Bangladesh.
          You help with Ludo strategies, platform questions, and general support.
          Current language: ${lang}. 
          Platform Details: 
          - Entry Fees: ৳12 to ৳500.
          - Signup Bonus: ৳12.
          - Referral Bonus: ৳15.
          - Commission: 6%.
          - Min Deposit/Withdraw: ৳10.
          Keep responses helpful, professional, and slightly enthusiastic.`,
          thinkingConfig: { thinkingBudget: 32768 } // Max thinking budget as requested
        },
      });

      const aiText = response.text || (lang === 'en' ? "I'm sorry, I couldn't process that. Please try again." : "দুঃখিত, আমি এটি প্রক্রিয়া করতে পারিনি। আবার চেষ্টা করুন।");
      setMessages(prev => [...prev, { role: 'model', content: aiText }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', content: lang === 'en' ? "Error connecting to AI assistant." : "এআই সহকারীর সাথে সংযোগ করতে ত্রুটি হয়েছে।" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-300">
      <div className="bg-indigo-900 w-full max-w-lg h-[80vh] rounded-t-[3rem] border-t border-x border-white/10 shadow-2xl flex flex-col animate-slide-up">
        {/* Header */}
        <div className="p-6 bg-indigo-800/50 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-electric rounded-2xl shadow-lg shadow-electric/20">
              <BrainCircuit className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bebas tracking-widest text-white">AI STRATEGIST</h2>
              <p className="text-[10px] text-emerald font-black uppercase tracking-widest flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald rounded-full animate-pulse" /> Thinking Mode Active
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-auto p-6 space-y-6 bg-indigo-950/20">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
              <div className={`max-w-[85%] flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${m.role === 'user' ? 'bg-indigo-600' : 'bg-electric'}`}>
                  {m.role === 'user' ? <User size={16} /> : <BrainCircuit size={16} />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-none' 
                  : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                }`}>
                  {m.content}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start animate-in fade-in">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-electric flex items-center justify-center">
                  <BrainCircuit size={16} />
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none flex items-center gap-3">
                  <Loader2 size={16} className="animate-spin text-electric" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-slate-500 animate-pulse">Thinking deeply...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-indigo-800/20 border-t border-white/10">
          <div className="relative">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={lang === 'en' ? "Ask anything..." : "কিছু জিজ্ঞাসা করুন..."}
              className="w-full bg-indigo-950 border border-white/10 rounded-2xl py-5 pl-6 pr-16 focus:outline-none focus:border-electric transition-all text-sm"
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-electric rounded-xl text-white active:scale-95 transition-all disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChat;
