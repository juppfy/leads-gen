// Timestamp dependency removed (previously a Firestore Timestamp).
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Date | any; // Changed from Timestamp
  plan: 'free' | 'indiehacker' | 'business' | 'enterprise';
  searchCount: number;
}

export type Platform = 'reddit' | 'linkedin' | 'twitter';

export interface PlatformStatus {
  selected: boolean;
  status: string;
  resultsCount: number;
  errorMessage?: string;
}

export interface Search {
  id: string;
  userId: string;
  productUrl: string;
  status: 'pending' | 'analyzing' | 'searching' | 'complete' | 'failed';
  platforms: {
    reddit?: PlatformStatus;
    linkedin?: PlatformStatus;
    twitter?: PlatformStatus;
  };
  keywords: string[];
  websiteInfo: {
    title: string;
    cta: string;
    website_summary: string;
    target_market_analysis: string;
    preview_image: string;
    favicon: string;
  } | null;
  resultsCount: number;
  createdAt: Date | any;
  updatedAt: Date | any;
  errorMessage?: string;
}

export interface Conversation {
  id: string;
  platform: Platform;
  title: string;
  url: string;
  excerpt: string;
  author: string;
  subreddit?: string;
  keyword?: string;
  assessment?: string;
  engagement: {
    upvotes: number;
    comments: number;
  };
  relevanceScore: number | null;
  postedAt: Date | any;
  foundAt: Date | any;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (args: { email: string; password: string; name?: string }) => Promise<void>;
  signIn: (args: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}
