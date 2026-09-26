import { FormEvent, useCallback, useEffect, useState } from 'react';
import { AppRole, AppUser, invokeAccountAction, supabase } from '../lib/supabase';
import { LogOut, Plus, RefreshCw, Check, X, Copy, ExternalLink, Trash2, GripVertical } from 'lucide-react';

type Company = { id: string; name: string; owner_id: string; owner_role: AppRole; status: string; created_at: string };
type Video = { id: string; title: string; url: string; company_id: string | null };
type ManagedUser = { id: string; username: string; role: AppRole; status: string };
type AccessCode = { id: string; code: string; role: AppRole; company_id: string | null; label: string | null; use_count: number; revoked_at: string | null; created_at: string };
type PortfolioBlock = { id: string; type: 'text' | 'image' | 'video' | 'links' | 'list'; title?: string; body?: string; url?: string; items?: string[] };

const toEmbedUrl = (url: string): string => {
  const youtubeId = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/)?.[1];
  if (youtubeId) return `https://www.youtube-nocookie.com/embed/${youtubeId}`;
  const vimeoId = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1];
  if (vimeoId) return `https://player.vimeo.com/video/${vimeoId}`;
  return url;
};

const inputClass = 'w-full rounded-lg border border-zinc-700 bg-black/50 px-3 py-2 text-sm text-white outline-none focus:border-red-500';
const buttonClass = 'inline-flex items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 transition hover:border-red-500 disabled:opacity-50';
const primaryClass = 'inline-flex items-center justify-center gap-2 rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50';

export function AuthScreen({ onAuthenticated }: { onAuthenticated: (user: AppUser) => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (!supabase) throw new Error('Define VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY para ativar a autenticação.');
      const response = mode === 'login'
        ? await invokeAccountAction<{ session: { access_token: string; refresh_token: string }; user: AppUser }>({
            action: 'login', username, password,
          })
        : await invokeAccountAction<{ session: { access_token: string; refresh_token: string }; user: AppUser }>({
            action: 'redeem-code', code, username, password,
          });
      const { error: sessionError } = await supabase.auth.setSession(response.session);
      if (sessionError) throw sessionError;
      onAuthenticated(response.user);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível iniciar sessão.');
    } finally {
      setBusy(false);
    }
  };

  const tabClass = (active: boolean) =>
    `flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition ${active ? 'bg-red-700 text-white' : 'text-zinc-400 hover:text-white'}`;

  return <main className="flex min-h-screen items-center justify-center bg-black px-4 py-8 text-white">
    <form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-2xl border border-red-900 bg-[#0d0d12] p-7 shadow-2xl">
      <div className="text-center"><p className="mb-2 font-mono text-xs uppercase text-red-400">Universidade Pessoal Cibernética</p><h1 className="text-2xl font-bold">{mode === 'login' ? 'Iniciar sessão' : 'Criar conta'}</h1></div>
      <div className="flex gap-2 rounded-xl bg-black/40 p-1">
        <button type="button" onClick={() => { setMode('login'); setError(''); }} className={tabClass(mode === 'login')}>Entrar</button>
        <button type="button" onClick={() => { setMode('signup'); setError(''); }} className={tabClass(mode === 'signup')}>Criar conta</button>
      </div>
      {mode === 'signup' && <p className="rounded-lg border border-zinc-700 bg-black/40 p-3 text-sm text-zinc-400">Tens um código de acesso? Escolhe aqui o teu username e a tua senha.</p>}
      {error && <p role="alert" className="rounded-lg border border-red-700 bg-red-950 p-3 text-sm text-red-200">{error}</p>}
      {mode === 'signup' && <label className="block space-y-1.5 text-sm">Código de acesso<input autoComplete="off" required value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} className={`${inputClass} uppercase`} /></label>}
      <label className="block space-y-1.5 text-sm">Username<input autoComplete="username" required minLength={3} maxLength={32} pattern="[a-zA-Z0-9_.-]+" value={username} onChange={(event) => setUsername(event.target.value)} className={inputClass} /></label>
      <label className="block space-y-1.5 text-sm">Password<input autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required minLength={mode === 'login' ? undefined : 8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className={inputClass} /></label>
      <button disabled={busy} className={`${primaryClass} w-full`} type="submit">{busy ? 'A verificar...' : mode === 'login' ? 'Entrar' : 'Criar conta e entrar'}</button>
    </form>
  </main>;
}

export function PublicPortfolio({ username }: { username: string }) {
  const [portfolio, setPortfolio] = useState<{ username: string; content: PortfolioBlock[] } | null>(null);
  const [error, setError] = useState(supabase ? '' : 'Supabase não está configurado.');
  useEffect(() => {
    if (!supabase) return;
    void supabase.rpc('get_public_admin_portfolio', { p_username: username }).then(({ data, error: rpcError }) => {
      if (rpcError || !data) setError('Portfólio não encontrado.');
      else setPortfolio(data as { username: string; content: PortfolioBlock[] });
    });
  }, [username]);
  return <main className="min-h-screen bg-[#09090d] px-5 py-12 text-white"><article className="mx-auto max-w-4xl">
    {error ? <p>{error}</p> : !portfolio ? <p>A carregar portfólio...</p> : <>
      <header className="mb-10 border-b border-zinc-800 pb-6"><p className="font-mono text-xs uppercase text-red-400">Portfólio profissional</p><h1 className="mt-2 text-4xl font-bold">{portfolio.username}</h1></header>
      <div className="space-y-8">{portfolio.content.map((block) => <PortfolioBlockView key={block.id} block={block} />)}</div>
    </>}
  </article></main>;
}

function PortfolioBlockView({ block }: { block: PortfolioBlock }) {
  const embedUrl = toEmbedUrl(block.url || '');
  const canEmbed = embedUrl.includes('youtube-nocookie.com/embed/') || embedUrl.includes('player.vimeo.com/video/');
  if (block.type === 'image') return <figure>{block.title && <h2 className="mb-3 text-xl font-semibold">{block.title}</h2>}<img className="max-h-[70vh] rounded-lg object-contain" src={block.url} alt={block.title || ''} /></figure>;
  if (block.type === 'video') return <section><h2 className="mb-3 text-xl font-semibold">{block.title}</h2>{canEmbed ? <iframe title={block.title || 'Vídeo'} src={embedUrl} className="aspect-video w-full rounded-lg" allowFullScreen /> : <a className="text-red-300 underline" href={block.url} target="_blank" rel="noreferrer">Ver vídeo</a>}</section>;
  if (block.type === 'links') return <section><h2 className="mb-3 text-xl font-semibold">{block.title}</h2><ul className="space-y-2">{(block.items || []).map((item) => { const [name, url] = item.split('|'); return <li key={item}><a className="text-red-300 underline" href={url} target="_blank" rel="noreferrer">{name || url}</a></li>; })}</ul></section>;
  if (block.type === 'list') return <section><h2 className="mb-3 text-xl font-semibold">{block.title}</h2><ul className="list-inside list-disc space-y-1 text-zinc-300">{(block.items || []).map((item) => <li key={item}>{item}</li>)}</ul></section>;
  return <section><h2 className="mb-2 text-2xl font-semibold">{block.title}</h2><p className="whitespace-pre-wrap leading-7 text-zinc-300">{block.body}</p></section>;
}

export function RoleDashboard({ user, onLogout }: { user: AppUser; onLogout: () => void }) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [managedUsers, setManagedUsers] = useState<ManagedUser[]>([]);
  const [companyName, setCompanyName] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoCompany, setVideoCompany] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newRole, setNewRole] = useState<'partner' | 'student'>('partner');
  const [studentCompany, setStudentCompany] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [portfolio, setPortfolio] = useState<PortfolioBlock[]>([]);
  const [accessCodes, setAccessCodes] = useState<AccessCode[]>([]);
  const [codeCompany, setCodeCompany] = useState('');
  const [codeRole, setCodeRole] = useState<'partner' | 'student'>('student');
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    if (!supabase) return;
    const [companyResult, videoResult, userResult] = await Promise.all([
      supabase.from('companies').select('id,name,owner_id,owner_role,status,created_at').order('created_at', { ascending: false }),
      supabase.from('videos').select('id,title,url,company_id').order('created_at', { ascending: false }),
      supabase.from('users').select('id,username,role,status').order('created_at', { ascending: false }),
    ]);
    const firstError = companyResult.error || videoResult.error || userResult.error;
    if (firstError) setError(firstError.message);
    setCompanies((companyResult.data || []) as Company[]);
    setVideos((videoResult.data || []) as Video[]);
    setManagedUsers((userResult.data || []) as ManagedUser[]);
  }, []);

  useEffect(() => { void Promise.resolve().then(loadData); }, [loadData]);
  useEffect(() => {
    if (!temporaryPassword) return;
    const timeout = window.setTimeout(() => setTemporaryPassword(''), 60_000);
    return () => window.clearTimeout(timeout);
  }, [temporaryPassword]);
  useEffect(() => {
    if (user.role !== 'admin' || !supabase) return;
    void (async () => {
      const { data } = await supabase.from('admin_portfolios').select('content').eq('admin_id', user.id).maybeSingle();
      if (data?.content) setPortfolio(data.content as PortfolioBlock[]);
    })();
  }, [user.id, user.role]);

  const run = async (operation: () => Promise<void>) => {
    setBusy(true); setError(''); setNotice(''); setTemporaryPassword('');
    try { await operation(); await loadData(); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'A operação falhou.'); }
    finally { setBusy(false); }
  };

  const loadCodes = useCallback(async () => {
    if (!supabase || user.role === 'student') return;
    try {
      const result = await invokeAccountAction<{ codes: AccessCode[] }>({ action: 'list-codes' });
      setAccessCodes(result.codes || []);
    } catch {
      // Listing codes is best-effort: a failure here must not break the dashboard.
    }
  }, [user.role]);

  useEffect(() => { void Promise.resolve().then(loadCodes); }, [loadCodes]);

  const createAdmin = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      const result = await invokeAccountAction<{ username: string }>({
        action: 'create-admin', username: newAdminUsername, password: newAdminPassword,
      });
      setNewAdminUsername(''); setNewAdminPassword('');
      setNotice(`Administrador "${result.username}" criado. Entrega-lhe o username e a senha que definiste.`);
    });
  };

  const createCode = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      const result = await invokeAccountAction<{ code: string; reused: boolean }>({
        action: 'create-code', role: codeRole,
        company_id: codeRole === 'student' ? codeCompany : undefined,
      });
      await loadCodes();
      setNotice(result.reused
        ? `Código existente reutilizado: ${result.code}`
        : `Código criado: ${result.code} — entrega à pessoa. Ela escolhe username e senha.`);
    });
  };

  const revokeCode = (code: string) => void run(async () => {
    await invokeAccountAction({ action: 'revoke-code', code });
    await loadCodes();
    setNotice(`Código ${code} revogado. Já não cria contas.`);
  });

  const createCompany = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      if (!supabase) throw new Error('Supabase não está configurado.');
      const { error: insertError } = await supabase.from('companies').insert({ name: companyName, owner_id: user.id, owner_role: user.role });
      if (insertError) throw insertError;
      setCompanyName(''); setNotice(user.role === 'partner' ? 'Pedido de empresa enviado para aprovação.' : 'Empresa criada e aprovada.');
    });
  };

  const createAccount = (event: FormEvent, role: 'partner' | 'student' = newRole) => {
    event.preventDefault();
    void run(async () => {
      const result = await invokeAccountAction<{ password: string }>({ action: 'create-account', username: newUsername, role, company_id: role === 'student' ? studentCompany : undefined });
      setTemporaryPassword(result.password); setNewUsername(''); setNotice('Conta criada. Copie a senha temporária agora; não será mostrada novamente.');
    });
  };

  const createVideo = (event: FormEvent) => {
    event.preventDefault();
    void run(async () => {
      if (!supabase) throw new Error('Supabase não está configurado.');
      const { error: insertError } = await supabase.from('videos').insert({ title: videoTitle, url: videoUrl, published_by: user.id, company_id: videoCompany || null });
      if (insertError) throw insertError;
      setVideoTitle(''); setVideoUrl(''); setVideoCompany(''); setNotice('Vídeo publicado.');
    });
  };

  const reviewCompany = (companyId: string, status: 'approved' | 'rejected') => void run(async () => {
    if (!supabase) throw new Error('Supabase não está configurado.');
    const { error: updateError } = await supabase.from('companies').update({ status }).eq('id', companyId);
    if (updateError) throw updateError;
  });

  const resetPassword = (targetId: string) => void run(async () => {
    const result = await invokeAccountAction<{ password: string }>({ action: 'reset-password', user_id: targetId });
    setTemporaryPassword(result.password); setNotice('Nova senha temporária criada. Copie agora; não será mostrada novamente.');
  });

  const savePortfolio = () => void run(async () => {
    if (!supabase) throw new Error('Supabase não está configurado.');
    const { error: saveError } = await supabase.from('admin_portfolios').upsert({ admin_id: user.id, content: portfolio, updated_at: new Date().toISOString() }, { onConflict: 'admin_id' });
    if (saveError) throw saveError;
    setNotice('Portfólio guardado.');
  });

  const uploadPortfolioImage = (file?: File) => {
    if (!file) return;
    void run(async () => {
      if (!supabase) throw new Error('Supabase não está configurado.');
      if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) {
        throw new Error('Escolha uma imagem PNG, JPEG, WEBP ou GIF até 5 MB.');
      }
      const extension = file.name.split('.').pop()?.toLowerCase() || 'img';
      const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage.from('admin-portfolio').upload(path, file, { upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('admin-portfolio').getPublicUrl(path);
      setPortfolio((blocks) => [...blocks, { id: crypto.randomUUID(), type: 'image', title: file.name, url: data.publicUrl }]);
      setNotice('Imagem adicionada ao portfólio. Guarde as alterações para publicar.');
    });
  };

  const addBlock = (type: PortfolioBlock['type']) => setPortfolio((blocks) => [...blocks, { id: crypto.randomUUID(), type, title: '', body: '', url: '', items: [] }]);
  const updateBlock = (id: string, patch: Partial<PortfolioBlock>) => setPortfolio((blocks) => blocks.map((block) => block.id === id ? { ...block, ...patch } : block));
  const moveBlock = (from: number, to: number) => setPortfolio((blocks) => { const next = [...blocks]; const [block] = next.splice(from, 1); next.splice(to, 0, block); return next; });

  const canCreateStudent = user.role === 'partner' || user.role === 'admin';
  const ownedApprovedCompanies = companies.filter((company) => company.owner_id === user.id && company.status === 'approved');
  const roleLabel = user.role === 'admin' ? 'Admin' : user.role === 'partner' ? 'Partner' : 'Student';
  const publicPortfolioUrl = `${window.location.origin}${import.meta.env.BASE_URL}portfolio/${encodeURIComponent(user.username)}`;

  return <div className="min-h-screen bg-[#09090d] text-white">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-black/60 px-5 py-4">
      <div><p className="font-mono text-xs uppercase text-red-400">Painel {roleLabel}</p><h1 className="text-xl font-semibold">{user.username}</h1></div>
      <div className="flex gap-2"><button className={buttonClass} onClick={() => void loadData()} title="Atualizar"><RefreshCw size={16} /></button><button className={buttonClass} onClick={onLogout}><LogOut size={16} /> Terminar sessão</button></div>
    </header>
    <main className="mx-auto max-w-6xl space-y-8 px-5 py-8">
      {error && <p role="alert" className="rounded-lg border border-red-700 bg-red-950 p-3 text-sm text-red-200">{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-emerald-800 bg-emerald-950/50 p-3 text-sm text-emerald-200">{notice}</p>}
      {temporaryPassword && <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-700 bg-amber-950/50 p-4"><p><span className="block text-xs uppercase text-amber-300">Senha temporária, visível apenas agora</span><code className="text-lg font-bold tracking-widest">{temporaryPassword}</code></p><span className="flex gap-2"><button className={buttonClass} onClick={() => void navigator.clipboard.writeText(temporaryPassword)}><Copy size={15} /> Copiar</button><button className={buttonClass} onClick={() => setTemporaryPassword('')} aria-label="Ocultar senha temporária"><X size={15} /></button></span></div>}

      {user.role !== 'student' && <section className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={createCompany} className="space-y-3 border-b border-zinc-800 pb-6"><h2 className="text-lg font-semibold">{user.role === 'admin' ? 'Criar empresa' : 'Pedir aprovação de empresa'}</h2><div className="flex gap-2"><input required minLength={2} maxLength={120} className={inputClass} placeholder="Nome da empresa" value={companyName} onChange={(event) => setCompanyName(event.target.value)} /><button className={primaryClass} disabled={busy}><Plus size={16} /> Criar</button></div></form>
        <section><h2 className="mb-3 text-lg font-semibold">Empresas</h2><div className="space-y-2">{companies.map((company) => <div key={company.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 py-2"><span>{company.name} <span className="ml-2 text-xs uppercase text-zinc-400">{company.status}</span></span>{user.role === 'admin' && company.owner_role === 'partner' && company.status === 'pending' && <span className="flex gap-2"><button className={buttonClass} onClick={() => reviewCompany(company.id, 'approved')}><Check size={15} /> Aprovar</button><button className={buttonClass} onClick={() => reviewCompany(company.id, 'rejected')}><X size={15} /> Rejeitar</button></span>}</div>)}{companies.length === 0 && <p className="text-sm text-zinc-500">Sem empresas acessíveis.</p>}</div></section>
      </section>}

      {user.role === 'admin' && <section className="grid gap-8 border-b border-zinc-800 pb-8 lg:grid-cols-2">
        <form onSubmit={createVideo} className="space-y-3"><h2 className="text-lg font-semibold">Publicar vídeo</h2><input required className={inputClass} placeholder="Título" value={videoTitle} onChange={(event) => setVideoTitle(event.target.value)} /><input required type="url" className={inputClass} placeholder="https://..." value={videoUrl} onChange={(event) => setVideoUrl(event.target.value)} /><select className={inputClass} value={videoCompany} onChange={(event) => setVideoCompany(event.target.value)}><option value="">Conteúdo geral</option>{ownedApprovedCompanies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select><button className={primaryClass} disabled={busy}><Plus size={16} /> Publicar</button></form>
        <form onSubmit={createAccount} className="space-y-3"><h2 className="text-lg font-semibold">Criar conta</h2><select className={inputClass} value={newRole} onChange={(event) => setNewRole(event.target.value as 'partner' | 'student')}><option value="partner">Partner</option><option value="student">Student</option></select><input required minLength={3} maxLength={32} pattern="[a-zA-Z0-9_.-]+" className={inputClass} placeholder="Username" value={newUsername} onChange={(event) => setNewUsername(event.target.value)} />{newRole === 'student' && <select required className={inputClass} value={studentCompany} onChange={(event) => setStudentCompany(event.target.value)}><option value="">Escolher empresa aprovada</option>{ownedApprovedCompanies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select>}<button className={primaryClass} disabled={busy}><Plus size={16} /> Criar conta</button></form>
      </section>}

      {user.role === 'admin' && <section className="max-w-2xl space-y-4 border-b border-zinc-800 pb-8">
        <div><h2 className="text-lg font-semibold">Novo administrador</h2><p className="text-sm text-zinc-400">Define tu o username e a senha do novo admin. Não há código de acesso: só um admin existente pode criar outro, e a senha que definires é a dele, definitiva.</p></div>
        <form onSubmit={createAdmin} className="space-y-3">
          <input required minLength={3} maxLength={32} pattern="[a-zA-Z0-9_.-]+" className={inputClass} placeholder="Username do novo admin" autoComplete="off" value={newAdminUsername} onChange={(event) => setNewAdminUsername(event.target.value)} />
          <input required minLength={8} type="password" className={inputClass} placeholder="Senha (mínimo 8 caracteres)" autoComplete="new-password" value={newAdminPassword} onChange={(event) => setNewAdminPassword(event.target.value)} />
          <button className={primaryClass} disabled={busy}><Plus size={16} /> Criar administrador</button>
        </form>
      </section>}

      {user.role !== 'student' && <section className="max-w-2xl space-y-4 border-b border-zinc-800 pb-8">
        <div><h2 className="text-lg font-semibold">Códigos de acesso</h2><p className="text-sm text-zinc-400">Gera um código e entrega-o à pessoa. Ela entra em "Criar conta", escolhe o próprio username e senha, e fica criada com o papel e a empresa que definiste aqui. O código não se gasta: podes reutilizá-lo.</p></div>
        <form onSubmit={createCode} className="space-y-3">
          <select className={inputClass} value={codeRole} onChange={(event) => setCodeRole(event.target.value as 'partner' | 'student')}>
            <option value="student">Estudante</option>
            {user.role === 'admin' && <option value="partner">Partner</option>}
          </select>
          {codeRole === 'student' && <select required className={inputClass} value={codeCompany} onChange={(event) => setCodeCompany(event.target.value)}>
            <option value="">Escolher empresa aprovada</option>
            {ownedApprovedCompanies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}
          </select>}
          <button className={primaryClass} disabled={busy || (codeRole === 'student' && (!codeCompany || !ownedApprovedCompanies.length))}><Plus size={16} /> Gerar código</button>
        </form>
        {accessCodes.length > 0 && <div className="space-y-2">{accessCodes.map((entry) => <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 py-2">
          <span className="font-mono text-sm">
            {entry.code}
            <span className="ml-3 text-xs uppercase text-zinc-500">{entry.role} · {entry.use_count} {entry.use_count === 1 ? 'registo' : 'registos'}{entry.revoked_at ? ' · revogado' : ''}</span>
          </span>
          <span className="flex gap-2">
            <button className={buttonClass} onClick={() => void navigator.clipboard?.writeText(entry.code)}><Copy size={15} /> Copiar</button>
            {!entry.revoked_at && <button className={buttonClass} onClick={() => revokeCode(entry.code)}><X size={15} /> Revogar</button>}
          </span>
        </div>)}</div>}
      </section>}

      {user.role === 'partner' && <section className="max-w-xl space-y-3 border-b border-zinc-800 pb-8"><h2 className="text-lg font-semibold">Adicionar estudante</h2><p className="text-sm text-zinc-400">Só é possível depois da aprovação da empresa.</p><form onSubmit={(event) => createAccount(event, 'student')} className="space-y-3"><input required minLength={3} maxLength={32} pattern="[a-zA-Z0-9_.-]+" className={inputClass} placeholder="Username" value={newUsername} onChange={(event) => setNewUsername(event.target.value)} /><select required className={inputClass} value={studentCompany} onChange={(event) => setStudentCompany(event.target.value)}><option value="">Empresa aprovada</option>{ownedApprovedCompanies.map((company) => <option key={company.id} value={company.id}>{company.name}</option>)}</select><button className={primaryClass} disabled={busy || !canCreateStudent || !ownedApprovedCompanies.length}><Plus size={16} /> Criar estudante</button></form></section>}

      {user.role !== 'student' && <section className="space-y-3 border-b border-zinc-800 pb-8"><h2 className="text-lg font-semibold">Contas geridas</h2>{managedUsers.filter((account) => account.id !== user.id).map((account) => <div key={account.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 py-2"><span>{account.username} <span className="ml-2 text-xs uppercase text-zinc-500">{account.role} · {account.status}</span></span><button className={buttonClass} onClick={() => resetPassword(account.id)}><RefreshCw size={15} /> Gerar nova senha</button></div>)}</section>}

      {user.role === 'admin' && <section className="space-y-4 border-b border-zinc-800 pb-8"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">Portfólio público</h2><a href={publicPortfolioUrl} target="_blank" rel="noreferrer" className="text-sm text-red-300 underline">{publicPortfolioUrl} <ExternalLink className="inline" size={13} /></a></div><button onClick={savePortfolio} className={primaryClass} disabled={busy}>Guardar portfólio</button></div><div className="flex flex-wrap gap-2">{(['text', 'image', 'video', 'links', 'list'] as const).map((type) => <button key={type} onClick={() => addBlock(type)} className={buttonClass}><Plus size={15} /> {type === 'text' ? 'Texto' : type === 'image' ? 'Imagem' : type === 'video' ? 'Vídeo' : type === 'links' ? 'Links' : 'Lista'}</button>)}</div><div className="space-y-3">{portfolio.map((block, index) => <div key={block.id} draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', String(index))} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const from = Number(event.dataTransfer.getData('text/plain')); if (Number.isInteger(from)) moveBlock(from, index); }} className="space-y-2 rounded-lg border border-zinc-800 bg-black/30 p-4"><div className="flex items-center justify-between text-xs uppercase text-zinc-500"><span><GripVertical className="mr-2 inline" size={15} />{block.type}</span><button className="text-red-300" onClick={() => setPortfolio((blocks) => blocks.filter((entry) => entry.id !== block.id))} title="Remover bloco"><Trash2 size={15} /></button></div><input className={inputClass} placeholder="Título" value={block.title || ''} onChange={(event) => updateBlock(block.id, { title: event.target.value })} />{block.type === 'text' ? <textarea className={inputClass} rows={4} placeholder="Texto" value={block.body || ''} onChange={(event) => updateBlock(block.id, { body: event.target.value })} /> : block.type === 'image' || block.type === 'video' ? <input className={inputClass} placeholder="URL da imagem ou vídeo" value={block.url || ''} onChange={(event) => updateBlock(block.id, { url: event.target.value })} /> : <textarea className={inputClass} rows={4} placeholder={block.type === 'links' ? 'Um por linha: Nome|https://url' : 'Um item por linha'} value={(block.items || []).join('\n')} onChange={(event) => updateBlock(block.id, { items: event.target.value.split('\n').filter(Boolean) })} />}</div>)}</div></section>}

      {user.role === 'admin' && <section className="border-b border-zinc-800 pb-8"><label className={`${buttonClass} cursor-pointer`}><Plus size={15} /> Carregar imagem para o portfólio<input className="sr-only" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => { uploadPortfolioImage(event.target.files?.[0]); event.currentTarget.value = ''; }} /></label><p className="mt-2 text-xs text-zinc-500">PNG, JPEG, WEBP ou GIF até 5 MB. A imagem fica pública no portfólio.</p></section>}
      <section><h2 className="mb-3 text-lg font-semibold">{user.role === 'student' ? 'Conteúdo da empresa' : 'Vídeos disponíveis'}</h2><div className="grid gap-3 md:grid-cols-2">{videos.map((video) => <article key={video.id} className="rounded-lg border border-zinc-800 p-4"><h3 className="font-semibold">{video.title}</h3><a className="mt-2 inline-block text-sm text-red-300 underline" href={video.url} target="_blank" rel="noreferrer">Abrir vídeo</a></article>)}{videos.length === 0 && <p className="text-sm text-zinc-500">Ainda não há vídeos disponíveis.</p>}</div></section>
    </main>
  </div>;
}
