import React, { useState } from 'react';
import type {
  CommunityPost,
  CommunityStore,
  PeerAccount,
  UserProfile,
  VitruvianPillar,
} from '../types';
import {
  loadCommunity,
  createPost,
  toggleLike,
  removePost,
  peerFromUser,
} from '../data/community';

type EvidenceType = CommunityPost['evidenceType'];

interface CommunityFeedProps {
  user: UserProfile | null;
  initialPosts?: CommunityPost[];
}

/** Defaults that keep the community feed self-contained (no extra deps). */
const DEFAULT_PILLAR: VitruvianPillar = 'mente';
const DEFAULT_EVIDENCE: EvidenceType = 'reflexao';

/**
 * Human-readable date WITHOUT external deps.
 * `date-fns` is not installed in this project, so we use the platform's
 * Intl API. Already-human timestamps (e.g. "Ha 5 min", "Agora mesmo") are
 * passed through unchanged.
 */
const formatTimestamp = (value: string): string => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value || 'data desconhecida';
  }
  return parsed.toLocaleString('pt-PT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const CommunityFeed = ({ user, initialPosts = [] }: CommunityFeedProps) => {
  const [store, setStore] = useState<CommunityStore>(() => {
    const loaded = loadCommunity();
    const seed = initialPosts ?? [];
    const seen = new Set(loaded.posts.map((p) => p.id));
    return {
      posts: [...loaded.posts, ...seed.filter((p) => !seen.has(p.id))],
      peers: loaded.peers,
    };
  });

  const [newPost, setNewPost] = useState('');
  const [newEvidence, setNewEvidence] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPost.trim() || !newEvidence.trim()) return;

    const author: PeerAccount = peerFromUser(user);
    const input = {
      pillar: DEFAULT_PILLAR,
      title: newPost.trim().slice(0, 80),
      content: newPost.trim(),
      evidenceType: DEFAULT_EVIDENCE,
      evidenceProof: newEvidence.trim(),
    };

    setStore((prev) => createPost(prev, author, input));
    setNewPost('');
    setNewEvidence('');
  };

  const handleLike = (postId: string) => {
    if (!user) return;
    setStore((prev) => toggleLike(prev, postId, user.id));
  };

  const handleDelete = (postId: string) => {
    if (!user) return;
    setStore((prev) => removePost(prev, postId, user.id));
  };

  const posts = store.posts;
  const isOwner = (post: CommunityPost) => post.authorId === user?.id;

  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-muted">Authentique-se para partilhar publicacoes com evidencia.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Post Creator - SELF-CONTAINED (zero external deps) */}
      <div className="border rounded-lg p-4 bg-white/5 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex items-start space-x-3">
            {/* INLINE AVATAR (initials - no import needed) */}
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
              {user.name?.charAt(0)?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 space-y-2">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="What's on your mind? Share something real..."
                className="w-full min-h-[80px] rounded border p-3 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                value={newEvidence}
                onChange={(e) => setNewEvidence(e.target.value)}
                placeholder="Add evidence (link, data, experience)..."
                className="w-full rounded border p-3 bg-white/90 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                disabled={!newPost.trim() || !newEvidence.trim()}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                Share with Evidence
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Posts List - SELF-CONTAINED */}
      <section aria-label="Publicacoes reais" className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="border rounded-lg p-4 bg-white/5 backdrop-blur-sm">
            <div className="flex items-start space-x-3 mb-3">
              {/* INLINE AVATAR (no import needed) */}
              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                {post.authorName?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{post.authorName}</h3>
                    <p className="text-sm text-muted">{formatTimestamp(post.timestamp)}</p>
                  </div>
                  {isOwner(post) && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="text-sm text-error hover:text-error-dark"
                    >
                      Delete
                    </button>
                  )}
                </div>

                {/* INLINE EVIDENTIAL BLOCKQUOTE (no import needed) */}
                <blockquote className="border-l-4 border-blue-500 pl-4 italic mb-4">
                  {post.content}
                  <footer className="mt-2 block text-xs text-muted">
                    Evidence: {post.evidenceProof}
                  </footer>
                </blockquote>

                <div className="flex items-center space-x-4 pt-3 border-t">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-1 text-sm hover:text-blue-600 ${
                      post.likedBy.includes(user.id) ? 'text-blue-600' : 'text-muted'
                    }`}
                  >
                    ❤ {post.likes}
                  </button>

                  <span className="text-xs text-muted">
                    {post.likedBy.length} people found this evidence-based
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted">Be the first to share something real with evidence!</p>
          </div>
        )}
      </section>
    </div>
  );
};
