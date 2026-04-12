import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { BookmarkProvider } from './context/BookmarkContext';
import Layout from './components/Layout';

// ── Learner pages ──
import HomePage from './pages/learner/HomePage';
import SearchResults from './pages/learner/SearchResults';
import MentorProfile from './pages/learner/MentorProfile';
import AuthPage from './pages/learner/AuthPage';
import CallBooking from './pages/learner/CallBooking';
import PaymentPage from './pages/learner/PaymentPage';
import OrderSuccess from './pages/learner/OrderSuccess';
import PaymentFailed from './pages/learner/PaymentFailed';
import Dashboard from './pages/learner/Dashboard';
import MessagesPage from './pages/learner/MessagesPage';
import VideoCall from './pages/learner/VideoCall';
import SessionComplete from './pages/learner/SessionComplete';
import BookingConfirmation from './pages/learner/BookingConfirmation';
import CallHistoryPage from './pages/learner/CallHistoryPage';
import ExplorePage from './pages/learner/ExplorePage';
import ProfilePage from './pages/learner/ProfilePage';
import SupportPage from './pages/learner/SupportPage';
import WriteReview from './pages/learner/WriteReview';
import VideoDetail from './pages/learner/VideoDetail';
import ReviewsList from './pages/learner/ReviewsList';
import VideosPage from './pages/learner/VideosPage';
import BecomeMentorPage from './pages/learner/BecomeMentorPage';
import ShortsPage from './pages/learner/ShortsPage';

// ── Mentor pages ──
import MentorLayout from './components/MentorLayout';
import MentorDashboard from './pages/mentor/MentorDashboard';
import MentorBookings from './pages/mentor/MentorBookings';
import MentorSessions from './pages/mentor/MentorSessions';
import MentorAvailability from './pages/mentor/MentorAvailability';
import MentorProfileEdit from './pages/mentor/MentorProfileEdit';
import MentorShorts from './pages/mentor/MentorShorts';

// ── Admin pages ──
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMentors from './pages/admin/AdminMentors';
import AdminSessions from './pages/admin/AdminSessions';
import AdminAnalytics from './pages/admin/AdminAnalytics';

function App() {
  return (
    <UserProvider>
    <BookmarkProvider>
    <BrowserRouter>
      <Routes>
        {/* Auth page without layout */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/mentor-panel/auth" element={<AuthPage />} />
        <Route path="/admin/auth" element={<AuthPage />} />
        {/* Video call without sidebar layout */}
        <Route path="/call/:sessionId" element={<VideoCall />} />

        {/* ── Learner pages with sidebar layout ── */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="mentor/:mentorId" element={<MentorProfile />} />
          <Route path="mentor/:mentorId/reviews" element={<ReviewsList />} />
          <Route path="book/:mentorId" element={<CallBooking />} />
          <Route path="booking-confirmation/:sessionId" element={<BookingConfirmation />} />
          <Route path="payment/:sessionId" element={<PaymentPage />} />
          <Route path="order/success" element={<OrderSuccess />} />
          <Route path="payment/failed" element={<PaymentFailed />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="call-history" element={<CallHistoryPage />} />
          <Route path="session-complete/:sessionId" element={<SessionComplete />} />
          <Route path="review/:mentorId" element={<WriteReview />} />
          <Route path="video/:videoId" element={<VideoDetail />} />
          <Route path="videos" element={<VideosPage />} />
          <Route path="shorts" element={<ShortsPage />} />
          <Route path="become-mentor" element={<BecomeMentorPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="support" element={<SupportPage />} />
        </Route>

        {/* ── Mentor pages with mentor layout ── */}
        <Route path="/mentor-panel" element={<MentorLayout />}>
          <Route index element={<MentorDashboard />} />
          <Route path="bookings" element={<MentorBookings />} />
          <Route path="sessions" element={<MentorSessions />} />
          <Route path="availability" element={<MentorAvailability />} />
          <Route path="profile" element={<MentorProfileEdit />} />
          <Route path="shorts" element={<MentorShorts />} />
        </Route>

        {/* ── Admin pages with admin layout ── */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="mentors" element={<AdminMentors />} />
          <Route path="sessions" element={<AdminSessions />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </BookmarkProvider>
    </UserProvider>
  );
}

export default App;
