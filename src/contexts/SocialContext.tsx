import { createContext, useContext, useState, useCallback, ReactNode } from "react";

// --- Types ---
export type PlatformId = "ig" | "fb" | "pinterest" | "tt" | "li";
export type PostStatus = "idea" | "draft" | "review" | "pending_approval" | "approved" | "scheduled" | "posted" | "rejected";

export const STATUS_ORDER: PostStatus[] = ["idea", "draft", "review", "pending_approval", "approved", "scheduled", "posted"];
export const STATUS_LABELS: Record<PostStatus, string> = {
  idea: "Idea",
  draft: "Draft",
  review: "In Review",
  pending_approval: "Pending Approval",
  approved: "Approved",
  scheduled: "Scheduled",
  posted: "Posted",
  rejected: "Rejected",
};

export interface Platform {
  id: PlatformId;
  name: string;
  icon: string;
  charLimit: number;
  postTypes: string[];
  bestTimes: string[];
}

export const PLATFORMS: Platform[] = [
  { id: "ig", name: "Instagram", icon: "📸", charLimit: 2200, postTypes: ["Feed", "Reel", "Story", "Carousel"], bestTimes: ["11am", "2pm", "7pm"] },
  { id: "fb", name: "Facebook", icon: "📘", charLimit: 63206, postTypes: ["Post", "Reel", "Story", "Link"], bestTimes: ["9am", "1pm", "4pm"] },
  { id: "pinterest", name: "Pinterest", icon: "📌", charLimit: 500, postTypes: ["Pin", "Idea Pin", "Video Pin"], bestTimes: ["8pm", "10pm"] },
  { id: "tt", name: "TikTok", icon: "🎵", charLimit: 2200, postTypes: ["Video", "Photo", "Slideshow"], bestTimes: ["7am", "12pm", "7pm"] },
  { id: "li", name: "LinkedIn", icon: "💼", charLimit: 3000, postTypes: ["Post", "Article", "Document", "Video"], bestTimes: ["8am", "10am", "12pm"] },
];

export interface SocialPost {
  id: string;
  title: string;
  caption: string;
  hashtags: string;
  platforms: PlatformId[];
  postTypes: Record<string, string>;
  status: PostStatus;
  scheduledDate: string | null;
  scheduledTime: string | null;
  mediaUrl: string;
  altText: string;
  firstComment: string;
  contentPillar: string;
  boostEnabled: boolean;
  boostBudget: number;
  createdAt: string;
}

export interface ContentPillar {
  id: string;
  name: string;
  color: string;
}

// --- Seed Data ---
const SEED_PILLARS: ContentPillar[] = [
  { id: "p1", name: "Behind the Scenes", color: "#8B5CF6" },
  { id: "p2", name: "Education", color: "#3B82F6" },
  { id: "p3", name: "Social Proof", color: "#10B981" },
  { id: "p4", name: "Product Showcase", color: "#F59E0B" },
  { id: "p5", name: "Culture & Values", color: "#EC4899" },
];

function makePost(overrides: Partial<SocialPost> = {}): SocialPost {
  return {
    id: crypto.randomUUID(),
    title: "",
    caption: "",
    hashtags: "",
    platforms: [],
    postTypes: {},
    status: "idea",
    scheduledDate: null,
    scheduledTime: null,
    mediaUrl: "",
    altText: "",
    firstComment: "",
    contentPillar: "",
    boostEnabled: false,
    boostBudget: 0,
    createdAt: new Date().toISOString().split("T")[0],
    ...overrides,
  };
}

const SEED_POSTS: SocialPost[] = [
  makePost({ title: "Coachella throwback: 250 kegs/day", platforms: ["li"], status: "scheduled", scheduledDate: "2026-04-07", scheduledTime: "09:00", contentPillar: "p1" }),
  makePost({ title: "BIB soda gun install shot", platforms: ["ig"], status: "scheduled", scheduledDate: "2026-04-08", scheduledTime: "12:00", contentPillar: "p4" }),
  makePost({ title: "Lab formulation BTS", platforms: ["tt"], status: "draft", scheduledDate: "2026-04-10", scheduledTime: "15:00", contentPillar: "p1" }),
  makePost({ title: "Kirkland origin story", platforms: ["li"], status: "scheduled", scheduledDate: "2026-04-11", scheduledTime: "10:00", contentPillar: "p3" }),
  makePost({ title: "Ginger Beer cocktail recipe", platforms: ["pinterest"], status: "scheduled", scheduledDate: "2026-04-12", scheduledTime: "11:00", contentPillar: "p4" }),
  makePost({ title: "Draft system ROI breakdown", platforms: ["li", "fb"], status: "pending_approval", scheduledDate: "2026-04-14", scheduledTime: "10:00", contentPillar: "p2", caption: "Your ginger beer costs $0.45/oz. Mine costs $0.05/oz. Here's how." }),
  makePost({ title: "Festival setup timelapse", platforms: ["tt", "ig"], status: "review", scheduledDate: "2026-04-15", scheduledTime: "14:00", contentPillar: "p1" }),
  makePost({ title: "Non-alcoholic market opportunity", platforms: ["li"], status: "idea", contentPillar: "p2" }),
  makePost({ title: "Customer testimonial - Globe Restaurant", platforms: ["ig", "fb"], status: "approved", scheduledDate: "2026-04-16", scheduledTime: "12:00", contentPillar: "p3" }),
  makePost({ title: "Summer cocktail recipe series", platforms: ["pinterest", "ig"], status: "idea", contentPillar: "p4" }),
];

// --- Context ---
interface SocialContextType {
  posts: SocialPost[];
  pillars: ContentPillar[];
  addPost: (overrides?: Partial<SocialPost>) => SocialPost;
  updatePost: (id: string, updates: Partial<SocialPost>) => void;
  deletePost: (id: string) => void;
  movePost: (id: string, newStatus: PostStatus) => void;
  duplicatePost: (id: string) => void;
  selectedPostId: string | null;
  slideOutOpen: boolean;
  openSlideOut: (id: string) => void;
  closeSlideOut: () => void;
}

const SocialContext = createContext<SocialContextType | null>(null);

export function SocialProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<SocialPost[]>(SEED_POSTS);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [slideOutOpen, setSlideOutOpen] = useState(false);
  const pillars = SEED_PILLARS;

  const addPost = useCallback((overrides?: Partial<SocialPost>) => {
    const post = makePost(overrides);
    setPosts(prev => [post, ...prev]);
    return post;
  }, []);

  const updatePost = useCallback((id: string, updates: Partial<SocialPost>) => {
    setPosts(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  }, []);

  const deletePost = useCallback((id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    if (selectedPostId === id) { setSlideOutOpen(false); setSelectedPostId(null); }
  }, [selectedPostId]);

  const movePost = useCallback((id: string, newStatus: PostStatus) => {
    setPosts(prev => prev.map(p => (p.id === id ? { ...p, status: newStatus } : p)));
  }, []);

  const duplicatePost = useCallback((id: string) => {
    setPosts(prev => {
      const original = prev.find(p => p.id === id);
      if (!original) return prev;
      const dup = { ...original, id: crypto.randomUUID(), title: original.title + " (copy)", status: "draft" as PostStatus, createdAt: new Date().toISOString().split("T")[0] };
      return [dup, ...prev];
    });
  }, []);

  const openSlideOut = useCallback((id: string) => { setSelectedPostId(id); setSlideOutOpen(true); }, []);
  const closeSlideOut = useCallback(() => { setSlideOutOpen(false); setSelectedPostId(null); }, []);

  return (
    <SocialContext.Provider value={{ posts, pillars, addPost, updatePost, deletePost, movePost, duplicatePost, selectedPostId, slideOutOpen, openSlideOut, closeSlideOut }}>
      {children}
    </SocialContext.Provider>
  );
}

export function useSocial() {
  const ctx = useContext(SocialContext);
  if (!ctx) throw new Error("useSocial must be used within SocialProvider");
  return ctx;
}

// --- Utilities ---
export function getStatusColor(status: PostStatus): string {
  const map: Record<PostStatus, string> = {
    idea: "bg-blue-400", draft: "bg-yellow-400", review: "bg-purple-400",
    pending_approval: "bg-amber-500", approved: "bg-emerald-500",
    scheduled: "bg-cyan-500", posted: "bg-green-600", rejected: "bg-red-500",
  };
  return map[status] || "bg-muted-foreground";
}

export function getPlatformColor(platform: PlatformId): string {
  const map: Record<PlatformId, string> = {
    ig: "bg-pink-600", fb: "bg-blue-600", pinterest: "bg-red-600", tt: "bg-foreground", li: "bg-blue-700",
  };
  return map[platform] || "bg-muted";
}
