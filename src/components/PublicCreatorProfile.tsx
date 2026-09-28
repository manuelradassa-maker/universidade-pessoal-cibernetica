import { useEffect, useState } from 'react';
import { BookOpen, CalendarDays, Heart, MessageCircle, UserRound } from 'lucide-react';
import type { CommunityPost } from '../types';
import { getPublicCreatorProfile, getPublicPosts, getPublicCreatorVideos, type PublicCreatorProfile, type PublicCreatorVideo } from '../lib/communityRepository';

export function PublicCreatorProfile({ username }: { username: string }) {
  const [profile, setProfile] = useState<PublicCreatorProfile | null>(null);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [videos, setVideos] = useState<PublicCreatorVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const nextProfile = await getPublicCreatorProfile(username);
        if (!nextProfile) { if (active) setError('Este perfil público não existe.'); return; }
        const [nextPosts, nextVideos] = await Promise.all([
          getPublicPosts(nextProfile.userId), getPublicCreatorVideos(nextProfile.userId),
        ]);
        if (active) { setProfile(nextProfile); setPosts(nextPosts); setVideos(nextVideos); }
      } catch (caught) {
        if (active) setError(caught instanceof Error ? caught.message : 'Não foi possível carregar o perfil.');
      } finally { if (active) setLoading(false); }
    })();
    return () => { active = false; };
  }, [username]);

  return <main className="min-h-screen bg-[#f7f5ff] px-4 py-8 text-slate-900 md:px-8 md:py-14">
    <article className="mx-auto max-w-3xl">
      <header className="overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm">
        <div className="h-2 bg-gradient-to-r from-violet-700 via-violet-500 to-transparent" />
        <div className="flex flex-col gap-5 p-6 md:flex-row md:items-center md:p-9">
          <div className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border border-violet-100 bg-violet-100 text-violet-800">{profile?.avatarUrl ? <img src={profile.avatarUrl} alt="" className="size-full object-cover" /> : <UserRound size={30} />}</div>
          <div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-[.2em] text-violet-700">Perfil de criador</p><h1 className="mt-2 break-words text-3xl font-semibold">{profile?.displayName ?? username}</h1><p className="mt-1 text-sm text-slate-500">@{profile?.username ?? username}</p>{profile?.bio && <p className="mt-4 max-w-2xl whitespace-pre-wrap text-sm leading-6 text-slate-700">{profile.bio}</p>}</div>
          <div className="flex gap-4 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><BookOpen size={14} /> {posts.length + videos.length} publicações</span></div>
        </div>
      </header>

      {videos.length > 0 && <section className="mt-8"><div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-700">Vídeos</p><h2 className="mt-1 text-xl font-semibold">Vídeos de {profile?.displayName ?? username}</h2></div><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{videos.map((video) => <article key={video.id} className="overflow-hidden rounded-2xl border border-violet-100 bg-white p-3 shadow-sm"><video src={video.url} controls playsInline preload="metadata" className={`${video.isShort ? 'aspect-[9/16]' : 'aspect-video'} w-full rounded-xl bg-slate-950 object-contain`} /><h3 className="px-1 pt-3 text-sm font-semibold text-slate-900">{video.title}</h3>{video.isShort && <span className="px-1 text-xs font-semibold text-violet-700">Short</span>}</article>)}</div></section>}

      <section className="mt-8 space-y-4">
        <div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-slate-500">Publicações</p><h2 className="mt-1 text-xl font-semibold">Trabalho partilhado</h2></div></div>
        {loading && <p className="rounded-xl border border-violet-100 p-5 text-sm text-slate-600">A carregar perfil...</p>}
        {error && <p role="alert" className="rounded-xl border border-violet-800 bg-violet-950/40 p-4 text-sm text-violet-200">{error}</p>}
        {!loading && !error && posts.length === 0 && videos.length === 0 && <p className="rounded-2xl border border-dashed border-violet-100 p-8 text-center text-sm text-slate-500">Ainda não há publicações neste perfil.</p>}
        {posts.map((post) => <article key={post.id} className="rounded-2xl border border-violet-100 bg-white p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-xs font-medium uppercase tracking-wider text-violet-800">{post.pillar.replace('_', ' & ')} · {post.evidenceType}</p><p className="inline-flex items-center gap-1.5 text-xs text-slate-500"><CalendarDays size={13} />{new Date(post.createdAt).toLocaleDateString('pt-PT')}</p></div>
          <h3 className="mt-3 text-xl font-semibold">{post.title}</h3><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{post.content}</p>
          <div className="mt-4 rounded-xl border-l-2 border-emerald-700 bg-emerald-950/15 px-4 py-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Evidência declarada</p><p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">{post.evidenceProof}</p></div>
          <footer className="mt-4 flex gap-4 border-t border-violet-100 pt-3 text-xs text-slate-500"><span className="inline-flex items-center gap-1.5"><Heart size={14} /> {post.likes}</span><span className="inline-flex items-center gap-1.5"><MessageCircle size={14} /> {post.comments.length}</span></footer>
        </article>)}
      </section>
    </article>
  </main>;
}

export default PublicCreatorProfile;
