import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';

export default function App() {
  const [email, setEmail] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserEmail(data.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });

    if (error) {
      alert(error.message);
    } else {
      alert('Confira seu e-mail para entrar.');
    }

    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (userEmail) {
    return (
      <main style={{ padding: 32 }}>
        <h1>Você está logado</h1>
        <p>{userEmail}</p>
        <button onClick={handleLogout}>Sair</button>
      </main>
    );
  }

  return (
    <main style={{ padding: 32 }}>
      <h1>Login</h1>
      <form onSubmit={handleLogin} style={{ display: 'grid', gap: 12, maxWidth: 320 }}>
        <input
          type="email"
          placeholder="seuemail@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Enviando...' : 'Entrar com magic link'}
        </button>
      </form>
    </main>
  );
}