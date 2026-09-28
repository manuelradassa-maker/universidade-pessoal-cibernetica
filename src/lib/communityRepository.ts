import type { CommunityComment, CommunityPost, UserProfile, VitruvianPillar } from '../types';
import { supabase } from './supabase';

export interface PublicCreatorProfile {
  userId: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string | null;
}
export interface PublicCreatorVideo {
  id: string;
  title: string;
  url: string;
  isShort: boolean;
  createdAt: string;
}

type ProfileRow = { user_id: string; username: string; display_name: string; bio: string; avatar_url: string | null };
type PostRow = { id: string; author_id: string; pillar: VitruvianPillar; title: string; content: string; evidence_type: CommunityPost['evidenceType']; evidence_proof: string; created_at: string };
type CommentRow = { id: string; post_id: string; author_id: string; text: string; created_at: string };

const requireSupabase = () => {
  if (!supabase) throw new Error('A comunidade pública requer a configuração do Supabase.');
  return supabase;
};

export const publicProfileUrl = (username: string): string =>
  import.meta.env.VITE_SUPABASE_URL
    ? `${import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '')}/functions/v1/public-profile?username=${encodeURIComponent(username)}`
    : `${window.location.origin}${import.meta.env.BASE_URL}u/${encodeURIComponent(username)}`;

export async function getPublicCreatorProfile(username: string): Promise<PublicCreatorProfile | null> {
  const client = requireSupabase();
  const { data, error } = await client.from('community_profiles')
    .select('user_id,username,display_name,bio,avatar_url').eq('username', username).maybeSingle<ProfileRow>();
  if (error) throw error;
  return data ? { userId: data.user_id, username: data.username, displayName: data.display_name, bio: data.bio, avatarUrl: data.avatar_url } : null;
}

export async function getPublicPosts(authorId?: string): Promise<CommunityPost[]> {
  const client = requireSupabase();
  let postQuery = client.from('community_posts')
    .select('id,author_id,pillar,title,content,evidence_type,evidence_proof,created_at')
    .order('created_at', { ascending: false }).limit(100);
  if (authorId) postQuery = postQuery.eq('author_id', authorId);
  const { data: postRows, error: postError } = await postQuery;
  if (postError) throw postError;
  const posts = (postRows ?? []) as PostRow[];
  if (posts.length === 0) return [];
  const postIds = posts.map((post) => post.id);
  const authorIds = [...new Set(posts.map((post) => post.author_id))];
  const [commentResult, likeResult] = await Promise.all([
    client.from('community_comments').select('id,post_id,author_id,text,created_at').in('post_id', postIds).order('created_at'),
    client.from('community_likes').select('post_id,user_id').in('post_id', postIds),
  ]);
  const firstError = commentResult.error || likeResult.error;
  if (firstError) throw firstError;
  const comments = (commentResult.data ?? []) as CommentRow[];
  const likes = (likeResult.data ?? []) as { post_id: string; user_id: string }[];
  const profileIds = [...new Set([...authorIds, ...comments.map((comment) => comment.author_id)])];
  const { data: profileRows, error: profileError } = await client.from('community_profiles')
    .select('user_id,username,display_name,bio,avatar_url').in('user_id', profileIds);
  if (profileError) throw profileError;
  const profiles = new Map<string, ProfileRow>(((profileRows ?? []) as ProfileRow[]).map((profile) => [profile.user_id, profile]));
  return posts.map((post) => {
    const author = profiles.get(post.author_id);
    const postComments: CommunityComment[] = comments.filter((comment) => comment.post_id === post.id).map((comment) => {
      const commentAuthor = profiles.get(comment.author_id);
      return {
        id: comment.id, authorId: comment.author_id, authorName: commentAuthor?.display_name ?? commentAuthor?.username ?? 'Utilizador',
        authorAvatar: commentAuthor?.avatar_url ?? '', authorAvatarType: 'emoji', authorEmail: '', text: comment.text,
        timestamp: comment.created_at, createdAt: comment.created_at,
      };
    });
    const likedBy = likes.filter((like) => like.post_id === post.id).map((like) => like.user_id);
    return {
      id: post.id, authorId: post.author_id, authorName: author?.display_name ?? author?.username ?? 'Utilizador',
      authorUsername: author?.username, authorAvatar: author?.avatar_url ?? '', authorAvatarType: 'emoji', authorEmail: '',
      pillar: post.pillar, title: post.title, content: post.content, evidenceType: post.evidence_type,
      evidenceProof: post.evidence_proof, likes: likedBy.length, likedBy, comments: postComments,
      timestamp: post.created_at, createdAt: post.created_at,
    };
  });
}

export async function getPublicCreatorVideos(authorId: string): Promise<PublicCreatorVideo[]> {
  const { data, error } = await requireSupabase().from('videos')
    .select('id,title,url,is_short,created_at').eq('published_by', authorId)
    .order('created_at', { ascending: false }).limit(60);
  if (error) throw error;
  return (data ?? []).map((video) => ({
    id: video.id, title: video.title, url: video.url,
    isShort: video.is_short, createdAt: video.created_at,
  }));
}

export async function savePublicProfile(user: UserProfile, displayName: string, bio: string): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from('community_profiles')
    .update({ display_name: displayName.trim(), bio: bio.trim(), updated_at: new Date().toISOString() })
    .eq('user_id', user.id);
  if (error) throw error;
}

export async function createPublicPost(userId: string, input: {
  pillar: VitruvianPillar; title: string; content: string; evidenceType: CommunityPost['evidenceType']; evidenceProof: string;
}): Promise<void> {
  const client = requireSupabase();
  const { error } = await client.from('community_posts').insert({
    author_id: userId, pillar: input.pillar, title: input.title.trim(), content: input.content.trim(),
    evidence_type: input.evidenceType, evidence_proof: input.evidenceProof.trim(),
  });
  if (error) throw error;
}

export async function removePublicPost(postId: string): Promise<void> {
  const { error } = await requireSupabase().from('community_posts').delete().eq('id', postId);
  if (error) throw error;
}

export async function setPostLike(postId: string, userId: string, alreadyLiked: boolean): Promise<void> {
  const client = requireSupabase();
  const result = alreadyLiked
    ? await client.from('community_likes').delete().eq('post_id', postId).eq('user_id', userId)
    : await client.from('community_likes').insert({ post_id: postId, user_id: userId });
  if (result.error) throw result.error;
}

export async function createPublicComment(postId: string, userId: string, text: string): Promise<void> {
  const { error } = await requireSupabase().from('community_comments').insert({ post_id: postId, author_id: userId, text: text.trim() });
  if (error) throw error;
}

export async function removePublicComment(commentId: string): Promise<void> {
  const { error } = await requireSupabase().from('community_comments').delete().eq('id', commentId);
  if (error) throw error;
}
