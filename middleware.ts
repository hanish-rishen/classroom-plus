import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/',
    '/assignments/:path*',
    '/classes/:path*',
    '/calendar/:path*',
    '/resources/:path*'
  ]
};