import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          setLocation('/login?error=auth_callback_failed');
          return;
        }

        if (data.session) {
          console.log('Auth callback successful:', data.session);
          setLocation('/dashboard');
        } else {
          setLocation('/login');
        }
      } catch (err) {
        console.error('Unexpected auth callback error:', err);
        setLocation('/login?error=unexpected_error');
      }
    };

    handleAuthCallback();
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Confirming your account...</p>
      </div>
    </div>
  );
}
