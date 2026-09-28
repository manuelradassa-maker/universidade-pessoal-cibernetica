import { FormEvent, useCallback, useEffect, useState } from 'react';
import { AppUser, invokeAccountAction, supabase } from '../lib/supabase';
import { LogOut, Plus, RefreshCw, Check, Layers, Sparkles, Clapperboard } from 'lucide-react';
import { LearnerJourney } from './LearnerJourney';
import { GroupsPanel } from './GroupsPanel';

type Company = { id: string; name: string; owner_id: string; status: string; created_at: string };
type Video = { id: string; title: string; url: string; company_id: string | null; is_short: boolean };

const inputClass = 'w-full rounded-xl border border-violet-100 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm text-violet-800 transition hover:border-violet-300 disabled:opacity-50';
const primaryClass = 'inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:opacity-50';

export function AuthScreen({ onAuthenticated }: { onAuthenticated: (user: AppUser) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      if (!supabase) throw new Error('A autenticação ainda não está configurada.');
      if (mode === 'signup') {
        const { data, error: signupError } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(), password,
          options: { data: { username: username.trim().toLowerCase(), registration_method: 'email' } },
        });
        if (signupError) {
          if (signupError.message.toLowerCase().includes('username')) throw new Error('Esse nome de utilizador já está em uso. Escolhe outro.');
          throw signupError;
        }
        if (!data.session) {
          setNotice('Conta criada. Confirma o email que enviámos e depois inicia sessão.');
          setMode('login'); return;
        }
        if (!data.user) throw new Error('Não foi possível encontrar a conta criada.');
        const { data: profile, error: profileError } = await supabase.from('users')
          .select('id, username, status, created_by').eq('id', data.user.id).single();
        if (profileError || !profile) throw new Error('A conta foi criada, mas o perfil ainda não ficou pronto. Confirma o email e inicia sessão.');
        onAuthenticated({ ...(profile as AppUser), email: data.user.email ?? undefined });
      } else if (email.includes('@')) {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        if (loginError || !data.user) throw new Error('Email ou palavra-passe incorretos.');
        const { data: profile, error: profileError } = await supabase.from('users')
          .select('id, username, status, created_by').eq('id', data.user.id).single();
        if (profileError || !profile || profile.status !== 'active') {
          await supabase.auth.signOut();
          throw new Error('Não foi possível abrir o perfil desta conta. Confirma o email ou contacta o suporte.');
        }
        onAuthenticated({ ...(profile as AppUser), email: data.user.email ?? undefined });
      } else {
        // Compatibilidade com contas antigas criadas antes do registo por email.
        const response = await invokeAccountAction<{ session: { access_token: string; refresh_token: string }; user: AppUser }>({ action: 'login', username: email, password });
        const { error: sessionError } = await supabase.auth.setSession(response.session);
        if (sessionError) throw sessionError;
        onAuthenticated(response.user);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível iniciar sessão.');
    } finally { setBusy(false); }
  };

  const tabClass = (active: boolean) => `flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${active ? 'bg-violet-700 text-white' : 'text-slate-500 hover:text-violet-800'}`;
  return <main className="auth-screen flex min-h-screen items-center justify-center bg-[#f7f5ff] px-4 py-8 text-slate-900">
    <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-3xl border border-violet-100 bg-white p-7 shadow-[0_24px_80px_-32px_rgba(91,33,182,.28)]">
      <div className="text-center"><p className="mb-2 font-mono text-xs uppercase text-violet-700">Universidade Pessoal Cibernética</p><h1 className="text-2xl font-bold">{mode === 'login' ? 'Iniciar sessão' : 'Criar conta'}</h1><p className="mt-2 text-sm text-slate-500">Aprende, partilha e evolui ao teu ritmo.</p></div>
      <div className="flex gap-2 rounded-xl bg-violet-50 p-1">
        <button type="button" onClick={() => { setMode('login'); setError(''); setNotice(''); }} className={tabClass(mode === 'login')}>Entrar</button>
        <button type="button" onClick={() => { setMode('signup'); setError(''); setNotice(''); }} className={tabClass(mode === 'signup')}>Criar conta</button>
      </div>
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">{notice}</p>}
      {error && <p role="alert" className="rounded-lg border border-violet-700 bg-violet-950 p-3 text-sm text-violet-200">{error}</p>}
      <label className="block space-y-1.5 text-sm">{mode === 'signup' ? 'Email' : 'Email ou nome de utilizador'}<input autoComplete={mode === 'login' ? 'username' : 'email'} required type={mode === 'signup' ? 'email' : 'text'} value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} placeholder={mode === 'signup' ? 'tu@gmail.com' : 'Email ou nome de utilizador'} /></label>
      {mode === 'signup' && <label className="block space-y-1.5 text-sm">Nome de utilizador único<input autoComplete="username" required minLength={3} maxLength={32} pattern="[a-zA-Z0-9_.-]+" value={username} onChange={(event) => setUsername(event.target.value)} className={inputClass} placeholder="ex.: maria.silva" /></label>}
      <label className="block space-y-1.5 text-sm">Palavra-passe<input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'login' ? undefined : 8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} /></label>
      <button disabled={busy} className={`${primaryClass} w-full`} type="submit">{busy ? 'A verificar...' : mode === 'login' ? 'Entrar' : 'Criar conta'}</button>
    </form>
  </main>;
}
export function RoleDashboard({ user, onLogout }: { user: AppUser; onLogout: () => void }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoCompany, setVideoCompany] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [isShort, setIsShort] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [workspace, setWorkspace] = useState<'journey' | 'manage' | 'shorts'>('journey');

  const loadData = useCallback(async () => {
    if (!supabase) return;
    const [companyResult, videoResult] = await Promise.all([
      supabase.from('companies').select('id,name,owner_id,status,created_at').order('created_at', { ascending: false }),
      supabase.from('videos').select('id,title,url,company_id,is_short').order('created_at', { ascending: false }),
    ]);
    const firstError = companyResult.error || videoResult.error;
    if (firstError) setError(firstError.message);
    setCompanies((companyResult.data || []) as Company[]);
    setVideos((videoResult.data || []) as Video[]);
  }, []);

  useEffect(() => { void Promise.resolve().then(loadData); }, [loadData]);
  const run = async (operation: () => Promise<void>) => {
    setBusy(true); setError(''); setNotice('');
    try { await operation(); await loadData(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'A operação falhou.'); }
    finally { setBusy(false); }
  };

  const createCompany = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      if (!supabase) throw new Error('Supabase não está configurado.');
      const { error: insertError } = await supabase.from('companies').insert({ name: companyName, owner_id: user.id, owner_role: 'student' });
      if (insertError) throw insertError;
      setCompanyName(''); setNotice('Empresa adicionada.');
    });
  };

  const createVideo = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      if (!supabase) throw new Error('Supabase nÃ£o estÃ¡ configurado.');
      let publishedUrl = videoUrl.trim();
      let uploadedPath: string | null = null;
      if (videoFile) {
        if (!['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'].includes(videoFile.type)) throw new Error('Formato não suportado. Usa MP4, WebM, MOV ou OGG.');
        if (videoFile.size > 100 * 1024 * 1024) throw new Error('O vídeo tem de ter menos de 100 MB.');
        const safeName = videoFile.name.replace(/[^a-zA-Z0-9._-]/g, '-');
        const path = `${user.id}/${crypto.randomUUID()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from('public-videos').upload(path, videoFile, { contentType: videoFile.type, upsert: false });
        if (uploadError) throw uploadError;
        uploadedPath = path;
        publishedUrl = supabase.storage.from('public-videos').getPublicUrl(path).data.publicUrl;
      }
      if (!publishedUrl) throw new Error('Escolhe um vídeo do dispositivo ou cola um link.');
      const { error: insertError } = await supabase.from('videos').insert({ title: videoTitle, url: publishedUrl, published_by: user.id, company_id: videoCompany || null, is_short: isShort });
      if (insertError) {
        if (uploadedPath) await supabase.storage.from('public-videos').remove([uploadedPath]);
        throw insertError;
      }
      setVideoTitle(''); setVideoUrl(''); setVideoCompany(''); setVideoFile(null); setIsShort(false); setNotice('Vídeo publicado.');
    });
  };

  const changePassword = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      if (!supabase) throw new Error('Supabase não está configurado.');
      if (user.email) {
        const { error: verificationError } = await supabase.auth.signInWithPassword({ email: user.email, password: currentPassword });
        if (verificationError) throw new Error('A palavra-passe atual está incorreta.');
        const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
        if (updateError) throw updateError;
      } else {
        await invokeAccountAction({ action: 'change-password', current_password: currentPassword, new_password: newPassword });
      }
      setCurrentPassword(''); setNewPassword(''); setNotice('A tua palavra-passe foi atualizada.');
    });
  };

  return <div className="app-shell min-h-screen bg-[#f7f5ff] text-slate-900">
    <header className="app-header border-b border-violet-100 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><p className="font-mono text-xs uppercase text-violet-700">Universidade Pessoal Cibernética</p><h1 className="text-xl font-semibold">{user.username}</h1></div>
        <div className="flex gap-2">{workspace === 'manage' && <button className={buttonClass} onClick={() => void loadData()} title="Atualizar"><RefreshCw size={16} /></button>}<button className={buttonClass} onClick={onLogout}><LogOut size={16} /> Terminar sessão</button></div>
      </div>
      <nav className="app-nav mt-4 flex flex-wrap gap-2" aria-label="Navegação principal">
        <button onClick={() => setWorkspace('journey')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${workspace === 'journey' ? 'bg-violet-700 text-white' : 'border border-violet-100 text-slate-500 hover:text-violet-800'}`}><Sparkles size={15} /> Minha Jornada</button>
        <button onClick={() => setWorkspace('manage')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${workspace === 'manage' ? 'bg-violet-700 text-white' : 'border border-violet-100 text-slate-500 hover:text-violet-800'}`}><Layers size={15} /> Empresas e grupos</button>
        <button onClick={() => setWorkspace('shorts')} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${workspace === 'shorts' ? 'bg-violet-700 text-white' : 'border border-violet-100 text-slate-500 hover:text-violet-800'}`}><Clapperboard size={15} /> Shorts</button>
      </nav>
    </header>
    <main className={`app-main mx-auto max-w-6xl space-y-8 px-5 py-8 ${workspace === 'shorts' ? 'shorts-main' : ''}`}>
      {workspace === 'journey' && <LearnerJourney user={user} />}
      {workspace === 'shorts' && <section className="shorts-feed" aria-label="Feed de vídeos curtos">{videos.filter((video) => video.is_short).map((video) => <article key={video.id} className="shorts-reel"><video src={video.url} controls playsInline preload="metadata" className="shorts-video" /><div className="shorts-caption"><span className="shorts-tag">SHORT · DESENVOLVIMENTO PESSOAL</span><h2>{video.title}</h2></div></article>)}{videos.every((video) => !video.is_short) && <div className="shorts-empty"><p className="shorts-tag">SHORTS</p><h2>A tua próxima ideia pode começar aqui.</h2><p>A comunidade ainda não publicou vídeos curtos. Quando alguém publicar, aparecem neste feed.</p><button onClick={() => setWorkspace('manage')}>Publicar o primeiro vídeo</button></div>}</section>}
      {workspace === 'manage' && <>
      {error && <p role="alert" className="rounded-lg border border-violet-700 bg-violet-950 p-3 text-sm text-violet-200">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-emerald-800 bg-emerald-950/50 p-3 text-sm text-emerald-200">{notice}</p>}

      <form onSubmit={changePassword} className="max-w-xl space-y-3 border-b border-zinc-800 pb-6">
        <h2 className="text-lg font-semibold">Alterar a minha palavra-passe</h2>
        <input required type="password" autoComplete="current-password" className={inputClass} placeholder="Palavra-passe atual" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
        <input required minLength={8} type="password" autoComplete="new-password" className={inputClass} placeholder="Nova palavra-passe (mínimo 8 caracteres)" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} />
        <button className={primaryClass} disabled={busy}><Check size={16} /> Guardar palavra-passe</button>
      </form>

      <section className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={createCompany} className="space-y-3 border-b border-violet-100 pb-6"><h2 className="text-lg font-semibold">Adicionar empresa</h2><div className="flex gap-2"><input required minLength={2} maxLength={120} className={inputClass} placeholder="Nome da empresa" value={companyName} onChange={(event) => setCompanyName(event.target.value)} /><button className={primaryClass} disabled={busy}><Plus size={16} /> Criar</button></div></form>
        <section><h2 className="mb-3 text-lg font-semibold">Empresas</h2><div className="space-y-2">{companies.map((company) => <div key={company.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 py-2"><span>{company.name} <span className="ml-2 text-xs uppercase text-zinc-400">{company.status}</span></span></div>)}{companies.length === 0 && <p className="text-sm text-zinc-500">Sem empresas acessíveis.</p>}</div></section>
      </section>

      <section className="grid gap-8 border-b border-zinc-800 pb-8 lg:grid-cols-2">
        <form onSubmit={createVideo} className="space-y-3"><h2 className="text-lg font-semibold">Publicar vídeo</h2><input required className={inputClass} placeholder="Título" value={videoTitle} onChange={(event) => setVideoTitle(event.target.value)} /><label className="block space-y-1 text-sm text-slate-600">Carregar vídeo (máx. 100 MB)<input type="file" accept="video/mp4,video/webm,video/quicktime,video/ogg" key={videoFile?.name ?? "empty"} className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-violet-100 file:px-3 file:py-2 file:font-semibold file:text-violet-800`} onChange={(event) => setVideoFile(event.target.files?.[0] ?? null)} /></label><input type="url" className={inputClass} placeholder="Ou colar um link de vídeo" value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} /><select className={inputClass} value={videoCompany} onChange={(event) => setVideoCompany(event.target.value)}><option value="">Conteúdo geral</option>{companies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select><label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={isShort} onChange={(event) => setIsShort(event.target.checked)} className="size-4 accent-violet-700" />Publicar também na aba Shorts</label><button className={primaryClass} disabled={busy}><Plus size={16} /> Publicar</button></form>
        <GroupsPanel user={user} />
      </section>

      <section><h2 className="mb-3 text-lg font-semibold">Vídeos disponíveis</h2><div className="grid gap-3 md:grid-cols-2">{videos.filter((video) => !video.is_short).map((video) => <article key={video.id} className="rounded-lg border border-zinc-800 p-4"><h3 className="font-semibold">{video.title}</h3><a className="mt-2 inline-block text-sm text-violet-700 underline" href={video.url} target="_blank" rel="noreferrer">Abrir vídeo</a></article>)}{videos.filter((video) => !video.is_short).length === 0 && <p className="text-sm text-zinc-500">Ainda não há vídeos disponíveis.</p>}</div></section>
      </>}
    </main>
  </div>;
}
