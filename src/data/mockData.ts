
import { User, Post, Reply } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user1',
    name: 'MidnightThinker',
    age: 28,
    gender: 'Female',
    country: 'Canada',
    avatar: '/avatars/avatar1.png',
    tags: ['philosophy', 'books', 'art', 'music'],
    about: 'Lover of deep conversations and starry nights. Always questioning, rarely answering.',
    showProfile: true,
    createdAt: '2023-06-15T10:30:00Z',
  },
  {
    id: 'user2',
    name: 'WanderingPoet',
    age: 34,
    gender: 'Male',
    country: 'Ireland',
    avatar: '/avatars/avatar2.png',
    tags: ['poetry', 'travel', 'history', 'nature'],
    about: 'Words are my compass, stories my map. Let\'s get lost together.',
    showProfile: true,
    createdAt: '2023-05-20T14:20:00Z',
  },
  {
    id: 'user3',
    name: 'QuietObserver',
    age: 22,
    gender: 'Non-binary',
    country: 'Japan',
    avatar: '/avatars/avatar3.png',
    tags: ['sci-fi', 'technology', 'anime', 'gaming'],
    about: 'Watching, learning, absorbing. I speak when it matters.',
    showProfile: false,
    createdAt: '2023-07-10T09:15:00Z',
  }
];

export const mockPosts: Post[] = [
  {
    id: 'post1',
    title: 'The Art of Listening',
    content: 'In our rush to respond, we often forget to truly listen. What if we approached every conversation as if it were a piece of music, with pauses, crescendos, and subtle notes to appreciate?',
    authorId: 'user1',
    mediaMetadata: {
      type: 'quote',
      author: 'Epictetus',
      title: 'Nature has given us one tongue, but two ears, that we may hear from others twice as much as we speak.',
    },
    openToDiscussion: true,
    tags: ['philosophy', 'mindfulness'],
    createdAt: '2023-08-15T11:30:00Z',
    reactions: {
      felt_that: 24,
      mind_blown: 12,
      still_thinking: 5,
      changed_me: 0
    }
  },
  {
    id: 'post2',
    title: 'Parallel Universes and Quantum Choices',
    content: 'Each decision we make splits our reality into multiple branches. In one universe, you didn\'t read this post. In another, you\'re about to write a reply that will change my thinking forever.',
    authorId: 'user3',
    mediaMetadata: {
      type: 'literature',
      title: 'The Hidden Reality',
      author: 'Brian Greene',
      year: 2011,
    },
    openToDiscussion: true,
    tags: ['science', 'quantum physics', 'philosophy'],
    createdAt: '2023-08-10T15:45:00Z',
    reactions: {
      felt_that: 18,
      mind_blown: 7,
      still_thinking: 15,
      changed_me: 0
    }
  },
  {
    id: 'post3',
    title: 'The Beauty of Impermanence',
    content: 'Cherry blossoms fall\nMoments passing, never still\nBeauty in release',
    authorId: 'user2',
    mediaMetadata: {
      type: 'quote',
      author: 'Matsuo Basho',
      title: 'In this world we walk on the roof of hell, gazing at flowers.',
    },
    openToDiscussion: true,
    tags: ['poetry', 'haiku', 'philosophy'],
    createdAt: '2023-08-05T19:20:00Z',
    reactions: {
      felt_that: 32,
      mind_blown: 21,
      still_thinking: 8,
      changed_me: 5
    }
  }
];

export const mockReplies: Reply[] = [
  {
    id: 'reply1',
    content: 'This reminds me of how music requires both sound and silence to create meaning. Perhaps conversation is the same - the spaces between words hold as much significance as the words themselves.',
    authorId: 'user2',
    postId: 'post1',
    createdAt: '2023-08-15T13:45:00Z',
    reactions: {
      felt_that: 8,
      mind_blown: 3,
      still_thinking: 1,
      changed_me: 0
    }
  },
  {
    id: 'reply2',
    content: 'I\'ve been practicing "generous listening" lately - where you assume the speaker has something valuable to say and you listen with genuine curiosity rather than waiting for your turn to talk. It\'s completely changed my relationships.',
    authorId: 'user3',
    postId: 'post1',
    createdAt: '2023-08-15T14:20:00Z',
    reactions: {
      felt_that: 12,
      mind_blown: 5,
      still_thinking: 0,
      changed_me: 0
    }
  },
  {
    id: 'reply3',
    content: 'That\'s a fascinating approach. Do you find it difficult to maintain that level of presence in every conversation?',
    authorId: 'user1',
    postId: 'post1',
    parentReplyId: 'reply2',
    createdAt: '2023-08-15T15:05:00Z',
    reactions: {
      felt_that: 4,
      mind_blown: 1,
      still_thinking: 0,
      changed_me: 0
    }
  }
];

// Helper function to get user by ID
export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

// Helper function to get post by ID
export const getPostById = (id: string): Post | undefined => {
  return mockPosts.find(post => post.id === id);
};

// Helper function to get replies for a post
export const getRepliesForPost = (postId: string): Reply[] => {
  return mockReplies.filter(reply => reply.postId === postId);
};

// Helper function to get nested replies
export const getNestedReplies = (replyId: string): Reply[] => {
  return mockReplies.filter(reply => reply.parentReplyId === replyId);
};
