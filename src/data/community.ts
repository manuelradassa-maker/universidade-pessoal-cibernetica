import {
  CommunityComment,
  CommunityPost,
  CommunityStore,
  PeerAccount,
  UserProfile,
  VitruvianPillar
} from '../types';

/**
 * COMUNIDADE & PARES — repositório real, sem dados fabricados.
 * ------------------------------------------------------------------
 * Regras de rigor:
 *  1. Não existe seed, nem posts, nem likes, nem comentários gerados.
 *  2. Cada publicação e cada comentário pertencem a uma conta real
 *     registada neste dispositivo (a lista de "pares" é essa lista).
 *  3. "Validações" (likes) = número de contas distintas que validaram.
 *     Nunca se incrementa o contador sem uma conta por trás.
 *  4. Publicações exigem evidência observável; comentários exigem
 *     conteúdo substantivo (o sistema recusa elogio vazio).
 */

const STORE_KEY = 'upc_community_v1';

const EMPTY_STORE: CommunityStore = { posts: [], peers: [] };

export const loadCommunity = (): CommunityStore => {
  if (typeof localStorage === 'undefined') return EMPTY_STORE;
  const raw = localStorage.getItem(STORE_KEY);
  if (!raw) return EMPTY_STORE;
  try {
    const parsed = JSON.parse(raw) as Partial<CommunityStore>;
    return {
      posts: Array.isArray(parsed.posts) ? parsed.posts : [],
      peers: Array.isArray(parsed.peers) ? parsed.peers : []
    };
  } catch {
    return EMPTY_STORE;
  }
};

export const saveCommunity = (store: CommunityStore): void => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORE_KEY, JSON.stringify(store));
};

export const peerFromUser = (user: UserProfile): PeerAccount => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  avatarType: user.avatarType,
  createdAt: user.createdAt
});

/** Regista/atualiza a conta real na lista de pares (identidade = fonte de verdade). */
export const registerPeer = (store: CommunityStore, user: UserProfile): CommunityStore => {
  const peer = peerFromUser(user);
  const peers = store.peers.some((p) => p.id === peer.id)
    ? store.peers.map((p) => (p.id === peer.id ? peer : p))
    : [...store.peers, peer];

  // Mantém nome/avatar coerentes em publicações e comentários já existentes.
  const posts = store.posts.map((post) => ({
    ...post,
    authorName: post.authorId === peer.id ? peer.name : post.authorName,
    authorAvatar: post.authorId === peer.id ? peer.avatar : post.authorAvatar,
    authorAvatarType: post.authorId === peer.id ? peer.avatarType : post.authorAvatarType,
    comments: post.comments.map((c) =>
      c.authorId === peer.id
        ? { ...c, authorName: peer.name, authorAvatar: peer.avatar, authorAvatarType: peer.avatarType }
        : c
    )
  }));

  const next = { posts, peers };
  saveCommunity(next);
  return next;
};

export const findPeer = (store: CommunityStore, userId: string): PeerAccount | undefined =>
  store.peers.find((p) => p.id === userId);

export const findPeerByEmail = (store: CommunityStore, email: string): PeerAccount | undefined =>
  store.peers.find((p) => p.email.toLowerCase() === email.trim().toLowerCase());

/* ------------------------------------------------------------------ */
/* Validação de rigor (a mesma regra que a interface anuncia)          */
/* ------------------------------------------------------------------ */

const EMPTY_PRAISE = [
  'boa',
  'bom',
  'top',
  'fixe',
  'muito bom',
  'parabens',
  'parabéns',
  'great',
  'nice',
  'well done',
  'obrigado',
  'gostei',
  'excelente trabalho',
  '+1',
  'amei'
];

export const validatePostInput = (input: {
  title: string;
  content: string;
  evidenceProof: string;
}): string[] => {
  const errors: string[] = [];
  if (input.title.trim().length < 8) {
    errors.push('Título demasiado curto: descreve a conquista ou o resultado em concreto.');
  }
  if (input.content.trim().length < 40) {
    errors.push(
      'Descrição insuficiente: o V8 rejeita autoajuda vazia. Explica o método aplicado, o atrito superado e o que mudou.'
    );
  }
  if (input.evidenceProof.trim().length < 8) {
    errors.push(
      'Falta a evidência observável (métrica, ficheiro, captura de ecrã ou registo datado). Sem isto, é apenas afirmação.'
    );
  }
  return errors;
};

export const validateCommentInput = (text: string): string[] => {
  const trimmed = text.trim().toLowerCase();
  const errors: string[] = [];
  if (trimmed.length < 15) {
    errors.push('Comentário demasiado curto para ser útil: acrescenta contexto, dado ou pergunta concreta.');
  }
  if (EMPTY_PRAISE.includes(trimmed)) {
    errors.push('Elogio vazio não conta como validação: descreve o que verificaste ou questiona o método.');
  }
  return errors;
};

/* ------------------------------------------------------------------ */
/* Mutações                                                            */
/* ------------------------------------------------------------------ */

export const relativeTime = (iso: string): string => {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return 'Data desconhecida';
  const diffMinutes = Math.floor((Date.now() - then) / 60000);
  if (diffMinutes < 1) return 'Agora mesmo';
  if (diffMinutes < 60) return `Há ${diffMinutes} min`;
  const hours = Math.floor(diffMinutes / 60);
  if (hours < 24) return `Há ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `Há ${days} dia${days === 1 ? '' : 's'}`;
  return new Date(iso).toLocaleDateString('pt-PT');
};

export interface NewPostInput {
  pillar: VitruvianPillar;
  title: string;
  content: string;
  evidenceType: CommunityPost['evidenceType'];
  evidenceProof: string;
}

export const createPost = (
  store: CommunityStore,
  author: PeerAccount,
  input: NewPostInput
): CommunityStore => {
  const now = new Date().toISOString();
  const post: CommunityPost = {
    id: `post_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    authorId: author.id,
    authorName: author.name,
    authorAvatar: author.avatar,
    authorAvatarType: author.avatarType,
    authorEmail: author.email,
    pillar: input.pillar,
    title: input.title.trim(),
    content: input.content.trim(),
    evidenceType: input.evidenceType,
    evidenceProof: input.evidenceProof.trim(),
    likes: 0,
    likedBy: [],
    comments: [],
    timestamp: relativeTime(now),
    createdAt: now
  };
  const next = { ...store, posts: [post, ...store.posts] };
  saveCommunity(next);
  return next;
};

/** Like/validação real: uma conta = um voto. Remover também é real. */
export const toggleLike = (store: CommunityStore, postId: string, userId: string): CommunityStore => {
  const posts = store.posts.map((post) => {
    if (post.id !== postId) return post;
    const alreadyValidated = post.likedBy.includes(userId);
    const likedBy = alreadyValidated
      ? post.likedBy.filter((id) => id !== userId)
      : [...post.likedBy, userId];
    return { ...post, likedBy, likes: likedBy.length };
  });
  const next = { ...store, posts };
  saveCommunity(next);
  return next;
};

export const addComment = (
  store: CommunityStore,
  postId: string,
  author: PeerAccount,
  text: string
): CommunityStore => {
  const now = new Date().toISOString();
  const comment: CommunityComment = {
    id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    authorId: author.id,
    authorName: author.name,
    authorAvatar: author.avatar,
    authorAvatarType: author.avatarType,
    authorEmail: author.email,
    text: text.trim(),
    timestamp: relativeTime(now),
    createdAt: now
  };
  const posts = store.posts.map((post) =>
    post.id === postId ? { ...post, comments: [...post.comments, comment] } : post
  );
  const next = { ...store, posts };
  saveCommunity(next);
  return next;
};

export const removeComment = (
  store: CommunityStore,
  postId: string,
  commentId: string,
  requesterId: string
): CommunityStore => {
  const posts = store.posts.map((post) =>
    post.id === postId
      ? {
          ...post,
          comments: post.comments.filter((c) => !(c.id === commentId && c.authorId === requesterId))
        }
      : post
  );
  const next = { ...store, posts };
  saveCommunity(next);
  return next;
};

export const removePost = (
  store: CommunityStore,
  postId: string,
  requesterId: string
): CommunityStore => {
  const posts = store.posts.filter((p) => !(p.id === postId && p.authorId === requesterId));
  const next = { ...store, posts };
  saveCommunity(next);
  return next;
};

/** Agrega atividade real por par (sem estimativas). */
export const peerActivity = (store: CommunityStore) =>
  store.peers.map((peer) => {
    const posts = store.posts.filter((p) => p.authorId === peer.id);
    const comments = store.posts.reduce(
      (total, p) => total + p.comments.filter((c) => c.authorId === peer.id).length,
      0
    );
    const validationsGiven = store.posts.reduce(
      (total, p) => total + (p.likedBy.includes(peer.id) ? 1 : 0),
      0
    );
    const validationsReceived = posts.reduce((total, p) => total + p.likes, 0);
    return { peer, posts: posts.length, comments, validationsGiven, validationsReceived };
  });

