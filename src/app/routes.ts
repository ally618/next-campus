import { createBrowserRouter } from 'react-router';
import MapPage from './pages/MapPage';
import MyPage from './pages/MyPage';
import CommunityPage from './pages/CommunityPage';
import PostWritePage from './pages/PostWritePage';
import PostDetailPage from './pages/PostDetailPage';
import RootLayout from './layouts/RootLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: MapPage },
      { path: 'mypage', Component: MyPage },
      { path: 'community', Component: CommunityPage },
      { path: 'community/write', Component: PostWritePage },
      { path: 'community/post/:id', Component: PostDetailPage },
    ],
  },
]);
