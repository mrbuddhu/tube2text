import { withAuth } from 'next-auth/middleware';

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      const { pathname } = req.nextUrl;
      if (pathname.startsWith('/dashboard')) {
        return !!token;
      }
      return true;
    },
  },
});

export const config = {
  matcher: ['/dashboard/:path*'],
};
