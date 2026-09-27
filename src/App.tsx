import { useEffect, useState } from 'react';
import { AuthScreen, RoleDashboard } from './components/RoleDashboard';
import { PublicCreatorProfile } from './components/PublicCreatorProfile';
import { AppUser, supabase, supabaseConfigured } from './lib/supabase';
import './App.css';

function publicUsernameFromPath(): string | null {
  const base = import.meta.env.BASE_URL;
  const redirect = new URLSearchParams(window.location.search).get('__redirect');
  if (redirect) window.history.replaceState(null, '', redirect);
  const currentPath = window.location.pathname;
  const path = currentPath.startsWith(base)
    ? `/${currentPath.slice(base.length)}`
    : currentPath;
  const match = path.match(/^\/u\/([^/]+)\/?$/);
  if (!match) return null;
  try { return decodeURIComponent(match[1]); } catch { return null; }
}

export function App() {
  const publicUsername = publicUsernameFromPath();
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(!publicUsername && supabaseConfigured);

  useEffect(() => {
    if (publicUsername || !supabase) return;
    const client = supabase;
    let active = true;
    const loadUser = async () => {
      const { data: { session } } = await client.auth.getSession();
      if (!session) {
        if (active) setLoading(false);
        return;
      }
      const { data, error } = await client.from('users')
        .select('id, username, role, status, created_by').eq('id', session.user.id).single();
      if (!active) return;
      if (error || !data || data.status !== 'active') {
        await client.auth.signOut();
        setUser(null);
      } else {
        setUser(data as AppUser);
      }
      setLoading(false);
    };
    void loadUser();
    const { data: listener } = client.auth.onAuthStateChange((_event, session) => {
      if (!session) setUser(null);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, [publicUsername]);

  if (publicUsername) return <PublicCreatorProfile username={publicUsername} />;
  if (loading) return <main className="flex min-h-screen items-center justify-center bg-black text-zinc-300">A verificar sessão...</main>;
  if (!user) return <AuthScreen onAuthenticated={setUser} />;
  return <RoleDashboard user={user} onLogout={() => void supabase?.auth.signOut()} />;
}

export default App;
