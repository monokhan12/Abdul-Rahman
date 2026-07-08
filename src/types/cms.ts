export type UserRole = 'admin' | 'editor' | 'author' | 'subscriber';

export interface CmsUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  bio?: string;
  createdAt: any;
  updatedAt: any;
}

export interface CmsSettings {
  siteName: string;
  siteDescription: string;
  logoUrl?: string;
  faviconUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
  };
  globalSeo?: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    ogImage?: string;
  };
  headerScripts?: string;
  footerScripts?: string;
  updatedAt: any;
}

export interface CmsActivityLog {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  details?: string;
  createdAt: any;
}

export interface CmsAnalyticsSummary {
  totalViews: number;
  totalPosts: number;
  totalComments: number;
  totalUsers: number;
  recentViews: { date: string; count: number }[];
  popularPosts: { slug: string; title: string; views: number }[];
}
