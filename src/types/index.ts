
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
    type: 'book' | 'movie' | 'music' | 'quote' | 'thought';
    title?: string;
    author?: string;
    year?: number;
  };
  openToDiscussion: boolean;
  tags: string[];
  createdAt: string;
  reactions: {
    felt_that: number;
    mind_blown: number;
    still_thinking: number;
    changed_me: number;
  };
  isScheduled?: boolean;
  releaseAt?: string;
  releaseCondition?: {
    requiredReplies?: number;
    releaseDate?: string;
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
    felt_that: number;
    mind_blown: number;
    still_thinking: number;
    changed_me: number;
  };
}

export type ReactionType = 'felt_that' | 'mind_blown' | 'still_thinking' | 'changed_me';

export interface Notification {
  id: string;
  type: "reaction" | "reply" | "thread" | "like";
  entity_type: string;
  entity_id: string;
  message?: string | null;
  is_read: boolean;
  created_at: string;
  actor_id?: string | null;
  user_id?: string;
}
