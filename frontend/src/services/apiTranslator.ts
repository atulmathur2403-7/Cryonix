/**
 * API Response Translator
 *
 * Translates backend API responses into frontend types.
 * Handles missing fields, paginated vs plain responses, and provides safe defaults.
 */

import { Mentor, Session, Review, CallHistory } from '../types';

// ─── Extractors ────────────────────────────────────────────────

/** Extract array from paginated or plain response */
export const extractList = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  return [];
};

/** Extract total count from paginated response */
export const extractTotal = (data: any): number => {
  if (!data) return 0;
  if (data.totalElements != null) return data.totalElements;
  if (Array.isArray(data)) return data.length;
  if (Array.isArray(data.content)) return data.content.length;
  return 0;
};

// ─── Mentor Translator ────────────────────────────────────────

/** Translate backend mentor object → frontend Mentor type */
export const translateMentor = (m: any): Mentor => ({
  id: String(m.mentorId ?? m.userId ?? m.id ?? ''),
  name: m.name || m.fullName || '',
  username: m.username || '',
  specialty: m.expertiseSummary || m.expertise || m.headline || '',
  about: m.bio || m.about || '',
  avatar: m.profilePic || m.profilePhotoUrl || m.avatar || '',
  isVerified: m.isVerified ?? false,
  isOnline: m.isOnline ?? m.presence === 'LIVE',
  isLive: m.isLive ?? m.presence === 'LIVE',
  followers: m.bookingsCount ?? m.followers ?? 0,
  following: m.following ?? 0,
  likes: m.likes ?? 0,
  rating: m.averageRating ?? m.rating ?? 0,
  totalMentees: m.bookingsCount ?? m.totalMentees ?? 0,
  reviewCount: m.reviewCount ?? 0,
  messagePrice: m.meetingPrice ?? m.messagePrice ?? m.messageRate ?? 0,
  callPrice: Number(m.callPrice ?? m.callRate ?? 0),
  subscriptionPrice: m.subscriptionPrice ?? 0,
  youtubeLink: m.socialLinks ?? m.youtubeLink ?? m.youtubeChannelUrl ?? '',
  location: m.location ?? '',
});

/** Translate array of backend mentors */
export const translateMentors = (data: any): Mentor[] =>
  extractList(data).map(translateMentor);

// ─── Session Translator ───────────────────────────────────────

/** Translate backend session object → frontend Session type */
export const translateSession = (s: any): Session => {
  const start = s.startTime ? new Date(s.startTime) : null;
  const end = s.endTime ? new Date(s.endTime) : null;
  const duration = start && end ? Math.round((end.getTime() - start.getTime()) / 60000) : (s.durationMinutes ?? 30);

  let status: 'upcoming' | 'completed' | 'cancelled' = 'upcoming';
  if (s.status === 'COMPLETED') status = 'completed';
  else if (s.status === 'CANCELLED') status = 'cancelled';

  return {
    id: String(s.sessionId ?? s.id ?? ''),
    learnerId: String(s.learnerId ?? ''),
    mentorId: String(s.mentorId ?? ''),
    mentorName: s.mentorName ?? '',
    mentorAvatar: s.mentorProfilePic ?? s.mentorAvatar ?? '',
    date: start ? start.toLocaleDateString() : '',
    time: start ? start.toLocaleTimeString() : '',
    sessionType: s.sessionType ?? 'Video Call',
    subject: s.topic ?? s.tags?.join(', ') ?? '',
    duration,
    status,
    paymentAmount: Number(s.amountPaid ?? s.paymentAmount ?? 0),
    currency: s.currency ?? 'USD',
    ratingGiven: s.rating ?? null,
    notes: s.notes ?? '',
  };
};

/** Translate array of backend sessions */
export const translateSessions = (data: any): Session[] =>
  extractList(data).map(translateSession);

// ─── CallHistory Translator ───────────────────────────────────

/** Translate backend session → frontend CallHistory type */
export const translateCallHistory = (s: any): CallHistory => {
  const start = s.startTime ? new Date(s.startTime) : null;
  return {
    id: String(s.sessionId ?? s.id ?? ''),
    date: start ? start.toLocaleDateString() : '',
    mentorName: s.mentorName ?? 'Mentor',
    mentorAvatar: s.mentorProfilePic ?? s.mentorAvatar ?? '',
    service: s.sessionType ?? 'Video Call',
    subject: s.topic ?? s.tags?.join(', ') ?? 'General',
    payment: Number(s.amountPaid ?? 0),
    currency: s.currency ?? 'USD',
    location: s.location ?? 'Online',
    rated: !!s.reviewed,
    rating: s.rating ?? null,
  };
};

/** Translate array of backend sessions → CallHistory[] */
export const translateCallHistories = (data: any): CallHistory[] =>
  extractList(data).map(translateCallHistory);

// ─── Review Translator ────────────────────────────────────────

/** Translate backend review → frontend Review type */
export const translateReview = (r: any): Review => ({
  id: String(r.id ?? r.reviewId ?? ''),
  learnerId: String(r.learnerId ?? ''),
  learnerName: r.learnerName ?? 'Anonymous',
  learnerAvatar: r.learnerAvatar ?? r.learnerProfilePic ?? '',
  mentorId: String(r.mentorId ?? ''),
  sessionId: String(r.sessionId ?? ''),
  rating: r.rating ?? 0,
  text: r.comment ?? r.text ?? '',
  attachments: r.attachments ?? [],
  createdAt: r.createdAt ?? '',
});

/** Translate array of backend reviews */
export const translateReviews = (data: any): Review[] =>
  extractList(data).map(translateReview);

// ─── Dashboard / KPI Translator ──────────────────────────────

/** Translate mentor dashboard summary with safe defaults */
export const translateMentorSummary = (data: any) => ({
  totalSessions: data?.totalSessions ?? 0,
  totalEarnings: data?.totalEarnings ?? data?.totalRevenue ?? 0,
  avgRating: data?.avgRating ?? data?.averageRating ?? 0,
  totalLearners: data?.totalLearners ?? 0,
  totalMinutes: data?.totalMinutes ?? 0,
  totalReviews: data?.totalReviews ?? 0,
});

/** Translate admin dashboard summary with safe defaults */
export const translateAdminSummary = (data: any) => ({
  totalUsers: data?.totalUsers ?? data?.totalLearners ?? 0,
  totalMentors: data?.totalMentors ?? 0,
  totalSessions: data?.totalSessions ?? 0,
  totalRevenue: data?.totalRevenue ?? data?.totalEarnings ?? 0,
  activeToday: data?.activeToday ?? 0,
  totalBookings: data?.totalBookings ?? 0,
});

/** Translate timeseries data points with safe defaults */
export const translateTimeseries = (data: any): Array<{ label: string; value: number; date: string }> =>
  extractList(data).map((point: any) => ({
    label: point.label ?? point.date ?? '',
    value: Number(point.value ?? point.count ?? 0),
    date: point.date ?? point.label ?? '',
  }));

// ─── Booking Translator ──────────────────────────────────────

/** Translate booking with safe defaults (keeps raw shape but ensures fields exist) */
export const translateBooking = (b: any) => ({
  bookingId: b.bookingId ?? b.id ?? '',
  learnerId: b.learnerId ?? '',
  learnerName: b.learnerName ?? `Learner #${b.learnerId ?? '?'}`,
  mentorId: b.mentorId ?? '',
  mentorName: b.mentorName ?? `Mentor #${b.mentorId ?? '?'}`,
  bookingType: b.bookingType ?? 'CALL',
  durationMinutes: b.durationMinutes ?? 0,
  bookingTime: b.bookingTime ?? b.startTime ?? '',
  status: b.status ?? 'PENDING',
  startTime: b.startTime ?? '',
  endTime: b.endTime ?? '',
});

export const translateBookings = (data: any) =>
  extractList(data).map(translateBooking);

// ─── Availability Translator ─────────────────────────────────

export const translateAvailabilitySlot = (slot: any) => ({
  id: slot.id ?? slot.slotId ?? '',
  dayOfWeek: slot.dayOfWeek ?? '',
  startTime: slot.startTime ?? '',
  endTime: slot.endTime ?? '',
});

export const translateAvailabilitySlots = (data: any) =>
  extractList(data).map(translateAvailabilitySlot);

// ─── Shorts Translator ───────────────────────────────────────

export const translateShort = (s: any) => ({
  uploadId: s.uploadId ?? s.id ?? '',
  title: s.title ?? '',
  thumbnailUrl: s.thumbnailUrl ?? '',
  status: s.status ?? 'UPLOADED',
});

export const translateShorts = (data: any) =>
  extractList(data).map(translateShort);
