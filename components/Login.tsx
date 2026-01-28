
import React, { useState } from 'react';

interface LoginProps {
  onLoginSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('******');
  const [captcha, setCaptcha] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!captcha) {
      setError('Please input captcha');
      return;
    }
    // Simple mock login
    onLoginSuccess();
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white">
      <div className="flex w-full max-w-6xl h-[600px] shadow-2xl rounded-2xl overflow-hidden border">
        {/* Left Side - Image Background */}
        <div className="hidden md:flex w-1/2 bg-[#4c78ff] p-12 flex-col justify-center items-center text-white relative">
           <img 
            src="https://picsum.photos/seed/login/800/600" 
            className="absolute inset-0 object-cover opacity-20"
            alt="bg"
           />
           <div className="z-10 text-center">
             <div className="w-64 h-64 mb-8">
                {/* SVG Mock of the character in screenshot */}
                <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="100" r="80" fill="white" fillOpacity="0.1" />
                  <rect x="60" y="80" width="80" height="60" rx="4" fill="white" />
                  <path d="M70 140 L130 140 L120 160 L80 160 Z" fill="#2c3e50" />
                </svg>
             </div>
             <h1 className="text-3xl font-bold mb-4">Welcome to Store Manage</h1>
             <p className="opacity-80">Efficient management for your enterprise needs</p>
           </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md mx-auto w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center md:text-left">Store Manage</h2>
            
            <div className="flex border-b mb-8">
              <button className="py-2 px-4 text-blue-600 border-b-2 border-blue-600 font-medium">Account login</button>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Username"
                />
              </div>

              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 11-8 0v4h8z"></path></svg>
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Password"
                />
                <button type="button" className="absolute right-3 top-3 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                </button>
              </div>

              <div className="flex gap-4">
                <div className="relative flex-1">
                   <span className="absolute left-3 top-3 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  </span>
                  <input
                    type="text"
                    value={captcha}
                    onChange={(e) => setCaptcha(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Captcha"
                  />
                </div>
                <div className="w-32 bg-gray-100 flex items-center justify-center rounded-md border border-gray-200 cursor-pointer overflow-hidden">
                   <span className="font-bold italic text-2xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-green-500 via-blue-500 to-purple-500 select-none">
                     NTRJ
                   </span>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button
                type="submit"
                className="w-full bg-[#4c78ff] hover:bg-blue-600 text-white font-medium py-3 rounded-md transition duration-200 shadow-lg shadow-blue-200"
              >
                Sign in
              </button>

              <p className="text-xs text-center text-gray-400 mt-8">
                Tip: For best results, we recommend using Google Chrome, Microsoft Edge (version 79.0.1072.62 or higher), or the 360 browser with speed mode enabled.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
