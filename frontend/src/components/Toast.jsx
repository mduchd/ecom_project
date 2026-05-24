import { useState, useEffect } from 'react';

export const toast = {
  success: (msg) => window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'success', msg } })),
  error: (msg) => window.dispatchEvent(new CustomEvent('toast', { detail: { type: 'error', msg } })),
};

export function Toaster() {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const id = Date.now() + Math.random();
      setMessages(prev => [...prev, { id, ...e.detail }]);
      setTimeout(() => setMessages(prev => prev.filter(m => m.id !== id)), 3000);
    };
    window.addEventListener('toast', handler);
    return () => window.removeEventListener('toast', handler);
  }, []);

  return (
    <div className="fixed top-24 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
      {messages.map(m => (
        <div key={m.id} className={`
          flex items-center gap-4 px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-2
          animate-toast-in transition-all
          ${m.type === 'success' 
            ? 'bg-blue-600 border-blue-400 text-white' 
            : 'bg-red-600 border-red-400 text-white'}
        `}>
          <div className="flex-shrink-0 bg-white/20 w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner">
             {m.type === 'success' ? '🎉' : '❌'}
          </div>
          <div className="flex flex-col">
            <span className="font-black text-[11px] opacity-70 mb-0.5 text-vi">
               {m.type === 'success' ? 'Thông báo' : 'Cảnh báo'}
            </span>
            <span className="text-sm font-bold leading-tight text-vi">{m.msg}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
