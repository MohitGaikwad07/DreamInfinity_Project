import { createBrowserRouter } from 'react-router-dom';
import { CommunityPage } from '../pages/community/CommunityPage.jsx';
import { CompanyPreparationPage } from '../pages/company/CompanyPreparationPage.jsx';
import { RankingsPage } from '../pages/gamification/RankingsPage.jsx';
import { AnalyticsPage } from '../pages/analytics/AnalyticsPage.jsx';
import { AuthLayout } from '../layouts/AuthLayout.jsx'; import { GuestRoute } from './GuestRoute.jsx'; import { ProtectedRoute } from './ProtectedRoute.jsx'; import { LoginPage } from '../pages/LoginPage.jsx'; import { RegisterPage } from '../pages/RegisterPage.jsx'; import { ForgotPasswordPage } from '../pages/ForgotPasswordPage.jsx'; import { DashboardPage } from '../pages/DashboardPage.jsx'; import { ProfilePage } from '../pages/ProfilePage.jsx'; import { LandingPage } from '../pages/LandingPage.jsx'; import { DashboardLayout } from '../layouts/DashboardLayout.jsx'; import { AIChatPage } from '../pages/chat/AIChatPage.jsx'; import { ResumeAnalyzerPage } from '../pages/resume/ResumeAnalyzerPage.jsx'; import { SkillGapPage } from '../pages/skillgap/SkillGapPage.jsx'; import { MockInterviewPage } from '../pages/interview/MockInterviewPage.jsx'; import { CodingPlatformPage } from '../pages/coding/CodingPlatformPage.jsx'; import { VideoInterviewPage } from '../pages/video/VideoInterviewPage.jsx';
import { PublicProfilePage } from '../pages/PublicProfilePage.jsx';

export const router = createBrowserRouter([
  { path: '/', element: <LandingPage /> },
  { path: '/u/:username', element: <PublicProfilePage /> },
  { element: <GuestRoute />, children: [{ element: <AuthLayout />, children: [{ path: '/login', element: <LoginPage /> }, { path: '/register', element: <RegisterPage /> }, { path: '/forgot-password', element: <ForgotPasswordPage /> }] }] },
  { element: <ProtectedRoute />, children: [{ element: <DashboardLayout />, children: [{ path: '/dashboard', element: <DashboardPage /> }, { path: '/assistant', element: <AIChatPage /> }, { path: '/resume', element: <ResumeAnalyzerPage /> }, { path: '/skill-gap', element: <SkillGapPage /> }, { path: '/mock-interview', element: <MockInterviewPage /> }, { path: '/coding', element: <CodingPlatformPage /> }, { path: '/video-interview', element: <VideoInterviewPage /> }, { path: '/community', element: <CommunityPage /> }, { path: '/company-prep', element: <CompanyPreparationPage /> }, { path: '/rankings', element: <RankingsPage /> }, { path: '/analytics', element: <AnalyticsPage /> }, { path: '/profile', element: <ProfilePage /> }] }] }
]);
