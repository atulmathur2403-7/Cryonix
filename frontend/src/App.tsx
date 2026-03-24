import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import SearchResults from './pages/SearchResults';
import MentorProfile from './pages/MentorProfile';
import AuthPage from './pages/AuthPage';
import CallBooking from './pages/CallBooking';
import PaymentPage from './pages/PaymentPage';
import OrderSuccess from './pages/OrderSuccess';
import PaymentFailed from './pages/PaymentFailed';
import Dashboard from './pages/Dashboard';
import MessagesPage from './pages/MessagesPage';
import VideoCall from './pages/VideoCall';
import SessionComplete from './pages/SessionComplete';
import BookingConfirmation from './pages/BookingConfirmation';
import CallHistoryPage from './pages/CallHistoryPage';
import ExplorePage from './pages/ExplorePage';
import ProfilePage from './pages/ProfilePage';
import SupportPage from './pages/SupportPage';
import WriteReview from './pages/WriteReview';
import VideoDetail from './pages/VideoDetail';
import ReviewsList from './pages/ReviewsList';
import VideosPage from './pages/VideosPage';
import BecomeMentorPage from './pages/BecomeMentorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth page without layout */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<AuthPage />} />
        {/* Video call without sidebar layout */}
        <Route path="/call/:sessionId" element={<VideoCall />} />

        {/* All other pages with sidebar layout */}
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
          <Route path="become-mentor" element={<BecomeMentorPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="support" element={<SupportPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
