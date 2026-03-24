export interface User {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  interests: string[];
  avatar: string;
  sessionsBooked: number;
  sessionsCompleted: number;
  avgRatingGiven: number;
  savedVideos: string[];
  isMentor: boolean;
}

export interface Mentor {
  id: string;
  name: string;
  username: string;
  specialty: string;
  about: string;
  avatar: string;
  isVerified: boolean;
  isOnline: boolean;
  isLive: boolean;
  followers: number;
  following: number;
  likes: number;
  rating: number;
  totalMentees: number;
  reviewCount: number;
  messagePrice: number;
  callPrice: number;
  subscriptionPrice: number;
  youtubeLink: string;
  location: string;
}

export interface Session {
  id: string;
  learnerId: string;
  mentorId: string;
  mentorName: string;
  mentorAvatar: string;
  date: string;
  time: string;
  sessionType: 'Video Call' | 'Booked VC' | 'meeting' | 'Subscription';
  subject: string;
  duration: number;
  status: 'upcoming' | 'completed' | 'cancelled';
  paymentAmount: number;
  currency: string;
  ratingGiven: number | null;
  notes: string;
}

export interface Payment {
  id: string;
  sessionId: string;
  learnerId: string;
  mentorId: string;
  subtotal: number;
  tax: number;
  taxPercentage: number;
  fees: number;
  serviceCharges: number;
  total: number;
  currency: string;
  discountCode: string | null;
  paymentMethod: string;
  cardLast4: string;
  cardBrand: string;
  status: 'success' | 'failed' | 'pending';
  saveCard: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  type: 'text' | 'image' | 'video' | 'audio' | 'sticker' | 'file';
  content: string;
  mediaUrl: string | null;
  audioDuration: number | null;
  isRead: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  participantUsername: string;
  participantAvatar: string;
  isOnline: boolean;
  lastMessage: string;
  lastMessageDate: string;
  unreadCount: number;
}

export interface Review {
  id: string;
  learnerId: string;
  learnerName: string;
  learnerAvatar: string;
  mentorId: string;
  sessionId: string;
  rating: number;
  text: string;
  attachments: string[];
  createdAt: string;
}

export interface Video {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorAvatar: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  likes: number;
  viewCount: number;
  isLive: boolean;
  liveViewerCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export interface CallHistory {
  id: string;
  date: string;
  mentorName: string;
  mentorAvatar: string;
  service: string;
  subject: string;
  payment: number;
  currency: string;
  location: string;
  rated: boolean;
  rating: number | null;
}

export interface FAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}
