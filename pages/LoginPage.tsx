
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Icon from '../components/Icon';

interface LoginPageProps {
  onLogin: (user: string, pass: string) => boolean;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [view, setView] = useState<'fingerprint' | 'credentials'>('fingerprint');

  useEffect(() => {
    if (view === 'fingerprint') {
      const timer = setTimeout(() => {
        // Simulate successful fingerprint scan after 1.5 seconds
        onLogin('Demson', 'Demson@123');
      }, 1500);

      // Cleanup the timer if the component unmounts or view changes
      return () => clearTimeout(timer);
    }
  }, [view, onLogin]);


  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onLogin(username, password);
    if (!success) {
      setError('Invalid username or password. Please try again.');
    }
  };

  const inputStyles = "w-full p-3 border bg-gray-50 border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-primary focus:border-transparent";
  const labelStyles = "block text-sm font-medium text-gray-700 mb-1";
      
  const FingerprintView = (
    <div className="text-center space-y-6 py-8">
      <Icon name="fingerprint" className="w-24 h-24 text-primary mx-auto animate-pulse-scan" />
      <h2 className="text-xl font-semibold text-gray-700">Waiting for fingerprint</h2>
      <p className="text-sm text-gray-500">Place your finger on the sensor</p>
      
      <div className="pt-4">
        <button
          onClick={() => setView('credentials')}
          className="w-full py-3 px-4 text-sm font-semibold text-primary bg-indigo-100 rounded-lg hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition"
        >
          Login with Credentials
        </button>
      </div>
    </div>
  );
      
  const CredentialsView = (
    <form onSubmit={handleCredentialSubmit} className="space-y-6">
      <div>
        <label htmlFor="username" className={labelStyles}>Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={inputStyles}
          required
          autoFocus
        />
      </div>
      <div>
        <label htmlFor="password" className={labelStyles}>Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputStyles}
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-100 p-3 rounded-lg text-center">{error}</p>
      )}

      <div>
        <button
          type="submit"
          className="w-full py-3 px-4 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-transform transform hover:scale-105"
        >
          Sign In
        </button>
      </div>
      <div className="text-center">
        <button type="button" onClick={() => setView('fingerprint')} className="text-sm font-medium text-primary hover:underline">
          Use Fingerprint
        </button>
      </div>
    </form>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <header className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-primary">Demson Manager</h1>
            <p className="mt-2 text-md text-gray-600">Please sign in to continue</p>
        </header>
        <Card className="animate-slide-in-up">
          {view === 'fingerprint' ? FingerprintView : CredentialsView}
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;