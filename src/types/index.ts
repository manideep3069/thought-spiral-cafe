
export interface User {
  id: string;
  name: string;
  age?: number;
  gender?: string;
  country?: string;
  avatar?: string;
  tags: string[];
  about?: string;
  showProfile: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  mediaMetadata?: {
    type: 'book' | 'movie' | 'music' | 'quote';
    title?: string;
    author?: string;
    year?: number;
  };
  openToDiscussion: boolean;
  tags: string[];
  createdAt: string;
  reactions: {
    like: number;
    love: number;
    wow: number;
    sad: number;
    angry: number;
  };
}

export interface Reply {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  parentReplyId?: string;
  createdAt: string;
  reactions: {
    like: number;
    love: number;
    wow: number;
    sad: number;
    angry: number;
  };
}

export type ReactionType = 'like' | 'love' | 'wow' | 'sad' | 'angry';
