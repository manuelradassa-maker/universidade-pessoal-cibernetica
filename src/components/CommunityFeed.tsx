import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Heart, MessageCircle, Send, Trash2, UserRound, ExternalLink } from 'lucide-react';
import type { CommunityPost, UserProfile, VitruvianPillar } from '../types';
import { validateCommentInput, validatePostInput } from '../data/community';
import { createPublicComment, createPublicPost, getPublicCreatorProfile, getPublicPosts, publicProfileUrl, removePublicComment, removePublicPost, savePublicProfile, setPostLike } from '../lib/communityRepository';

const pillars: { id: VitruvianPillar; label: string }[] = [
  { id: 'mente', label: 'Mente' }, { id: 'intelecto', label: 'Intelecto' },
  { id: 'corpo_acao', label: 'Corpo & Ação' }, { id: 'proposito', label: 'Propósito' },
];
const fieldClass = 'w-full rounded-xl border border-zinc-700 bg-black/40 px-3.5 py-3 text-sm text-white outline-none focus:border-red-500';

export function CommunityFeed({ user }: { user: UserProfile | null; initialPosts?: CommunityPost[] }) {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [displayName, setDisplayName] = useState(user?.name ?? '');
  const [bio, setBio] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [evidence, setEvidence] = useState('');
  const [pillar, setPillar] = useState<VitruvianPillar>('mente');
  const [evidenceType, setEvidenceType] = useState<CommunityPost['evidenceType']>('resultado');
  const [commentsDraft, setCommentsDraft] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const userId = user?.id;
  const username = user?.name;

  const refresh = useCallback(async () => {
    try {
      const [nextPosts, ownProfile] = await Promise.all([
        getPublicPosts(), username ? getPublicCreatorProfile(username) : Promise.resolve(null),
      ]);
      setPosts(nextPosts);
      if (ownProfile && userId === ownProfile.userId) {
        setDisplayName(ownProfile.displayName);
        setBio(ownProfile.bio);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Não foi possível carregar a comunidade.');
    } finally { setLoading(false); }
  }, [userId, username]);

  useEffect(() => { void Promise.resolve().then(refresh); }, [refresh]);

  const run = async (operation: () => Promise<void>, successMessage: string) => {
    setBusy(true); setError(''); setNotice('');
    try { await operation(); await refresh(); setNotice(successMessage); }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'A operação falhou.'); }
    finally { setBusy(false); }
  };

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    if (!displayName.trim()) { setError('Indica o nome público do teu perfil.'); return; }
    void run(() => savePublicProfile(user, displayName, bio), 'Perfil público guardado.');
  };

  const submitPost = (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;
    const issues = validatePostInput({ title, content, evidenceProof: evidence });
    if (issues.length) { setError(issues.join(' ')); return; }
    void run(async () => {
      await createPublicPost(user.id, { title, content, evidenceProof: evidence, pillar, evidenceType });
      setTitle(''); setContent(''); setEvidence('');
    }, 'Publicação visível no perfil e no feed público.');
  };

  const submitComment = (event: FormEvent, post: CommunityPost) => {
    event.preventDefault();
    if (!user) return;
    const text = commentsDraft[post.id] ?? '';
    const issues = validateCommentInput(text);
    if (issues.length) { setError(issues.join(' ')); return; }
    void run(async () => {
      await createPublicComment(post.id, user.id, text);
      setCommentsDraft((previous) => ({ ...previous, [post.id]: '' }));
    }, 'Comentário publicado.');
  };

  const profileLink = user ? publicProfileUrl(user.name) : '';

  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
    <main className="min-w-0 space-y-5">
      <header className="rounded-2xl border border-zinc-800 bg-gradient-to-br from-[#15151d] to-black p-5 md:p-6"><p className="text-xs font-semibold uppercase tracking-[.18em] text-red-400">Comunidade pública</p><h2 className="mt-2 text-2xl font-semibold text-white">Ideias, trabalho e evidência</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">As publicações são reais e pertencem a contas autenticadas. O feed começa vazio e só mostra conteúdo publicado por pessoas.</p></header>
      {error && <p role="alert" className="rounded-xl border border-red-800 bg-red-950/40 p-3 text-sm text-red-200">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-800 bg-emerald-950/30 p-3 text-sm text-emerald-200">{notice}</p>}
      {user && <form onSubmit={submitPost} className="space-y-3 rounded-2xl border border-zinc-800 bg-[#111116] p-4 md:p-5">
        <div><h3 className="font-semibold text-white">Nova publicação</h3><p className="mt-1 text-xs text-zinc-500">Conta o que fizeste e como se pode verificar. Não afirmes progresso sem evidência.</p></div>
        <input className={fieldClass} required minLength={8} maxLength={120} placeholder="Título concreto" value={title} onChange={(event) => setTitle(event.target.value)} />
        <textarea className={fieldClass} required minLength={40} maxLength={5000} rows={4} placeholder="O que aconteceu, que método usaste e o que aprendeste?" value={content} onChange={(event) => setContent(event.target.value)} />
        <div className="grid gap-3 sm:grid-cols-2"><select className={fieldClass} value={pillar} onChange={(event) => setPillar(event.target.value as VitruvianPillar)}>{pillars.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><select className={fieldClass} value={evidenceType} onChange={(event) => setEvidenceType(event.target.value as CommunityPost['evidenceType'])}><option value="resultado">Resultado</option><option value="projeto">Projeto</option><option value="habito">Hábito</option><option value="reflexao">Reflexão</option></select></div>
        <input className={fieldClass} required minLength={8} maxLength={1000} placeholder="Evidência: métrica, resultado, artefacto ou contexto verificável" value={evidence} onChange={(event) => setEvidence(event.target.value)} />
        <button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"><Send size={15} /> Publicar</button>
      </form>}

      {loading && <p className="py-8 text-center text-sm text-zinc-500">A carregar publicações…</p>}
      {!loading && posts.length === 0 && <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center"><p className="font-medium text-zinc-300">Ainda não existem publicações.</p><p className="mt-1 text-sm text-zinc-500">Quando alguém publicar, o conteúdo aparece aqui.</p></div>}
      {posts.map((post) => <article key={post.id} className="space-y-4 rounded-2xl border border-zinc-800 bg-[#111116] p-4 md:p-5">
        <header className="flex items-start justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><div className="grid size-10 shrink-0 place-items-center rounded-full bg-red-950 text-red-200">{post.authorAvatar ? <img src={post.authorAvatar} alt="" className="size-10 rounded-full object-cover" /> : <UserRound size={18} />}</div><div className="min-w-0"><a className="font-semibold text-white hover:text-red-300" href={post.authorUsername ? publicProfileUrl(post.authorUsername) : '#'}>{post.authorName}</a><p className="text-xs text-zinc-500">{new Date(post.createdAt).toLocaleString('pt-PT')} · {pillars.find((entry) => entry.id === post.pillar)?.label}</p></div></div>
          {user?.id === post.authorId && <button type="button" disabled={busy} onClick={() => void run(() => removePublicPost(post.id), 'Publicação removida.')} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-800 hover:text-red-300" aria-label="Apagar publicação"><Trash2 size={16} /></button>}
        </header>
        <div><h3 className="text-lg font-semibold text-white">{post.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{post.content}</p></div>
        <div className="rounded-xl border-l-2 border-emerald-600 bg-emerald-950/15 px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Evidência declarada · {post.evidenceType}</p><p className="mt-1 whitespace-pre-wrap text-sm text-zinc-300">{post.evidenceProof}</p></div>
        <div className="flex items-center gap-4 border-t border-zinc-800 pt-3"><button type="button" disabled={!user || busy} onClick={() => void run(() => setPostLike(post.id, user!.id, post.likedBy.includes(user!.id)), 'Validação atualizada.')} className={`inline-flex items-center gap-1.5 text-sm ${post.likedBy.includes(user?.id ?? '') ? 'text-red-300' : 'text-zinc-400 hover:text-white'}`}><Heart size={16} fill={post.likedBy.includes(user?.id ?? '') ? 'currentColor' : 'none'} /> {post.likes}</button><span className="inline-flex items-center gap-1.5 text-sm text-zinc-500"><MessageCircle size={16} /> {post.comments.length}</span></div>
        <div className="space-y-3">{post.comments.map((comment) => <div key={comment.id} className="flex justify-between gap-3 border-l border-zinc-700 pl-3"><div><p className="text-xs font-semibold text-zinc-300">{comment.authorName}<span className="ml-2 font-normal text-zinc-600">{new Date(comment.createdAt).toLocaleString('pt-PT')}</span></p><p className="mt-1 whitespace-pre-wrap text-sm text-zinc-400">{comment.text}</p></div>{user?.id === comment.authorId && <button type="button" disabled={busy} onClick={() => void run(() => removePublicComment(comment.id), 'Comentário removido.')} aria-label="Apagar comentário" className="self-start p-1 text-zinc-600 hover:text-red-300"><Trash2 size={14} /></button>}</div>)}
          {user && <form onSubmit={(event) => submitComment(event, post)} className="flex gap-2"><input className={fieldClass} minLength={15} maxLength={2000} required placeholder="Escreve um comentário útil ou uma pergunta concreta" value={commentsDraft[post.id] ?? ''} onChange={(event) => setCommentsDraft((previous) => ({ ...previous, [post.id]: event.target.value }))} /><button disabled={busy} className="rounded-xl border border-zinc-700 px-3 text-zinc-300 hover:border-red-500 disabled:opacity-50" aria-label="Enviar comentário"><Send size={15} /></button></form>}
        </div>
      </article>)}
    </main>

    {user && <aside className="space-y-4"><form onSubmit={saveProfile} className="space-y-3 rounded-2xl border border-zinc-800 bg-[#111116] p-4"><div><h3 className="font-semibold text-white">O teu perfil de criador</h3><p className="mt-1 text-xs text-zinc-500">Público para todos, independentemente do cargo. Só o nome e a descrição abaixo são publicados.</p></div><label className="block text-xs text-zinc-400">Nome público<input className={`${fieldClass} mt-1`} required minLength={1} maxLength={60} value={displayName} onChange={(event) => setDisplayName(event.target.value)} /></label><label className="block text-xs text-zinc-400">Descrição<textarea className={`${fieldClass} mt-1`} maxLength={500} rows={4} value={bio} onChange={(event) => setBio(event.target.value)} placeholder="O que estudas, crias ou partilhas?" /></label><button disabled={busy} className="w-full rounded-xl border border-zinc-700 px-3 py-2 text-sm text-white hover:border-red-500 disabled:opacity-50">Guardar perfil</button><a href={profileLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-red-300 hover:text-red-200">Abrir perfil público <ExternalLink size={13} /></a></form></aside>}
  </div>;
}

export default CommunityFeed;
