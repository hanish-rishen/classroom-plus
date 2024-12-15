import NextAuth, { DefaultSession, Account } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { JWT } from 'next-auth/jwt';

interface ExtendedToken extends JWT {
  accessToken?: string;
  refreshToken?: string;
}

interface ExtendedSession extends DefaultSession {
  accessToken?: string;
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            'openid',
            'email',
            'profile',
            'https://www.googleapis.com/auth/classroom.courses.readonly',
            'https://www.googleapis.com/auth/classroom.coursework.me',
            'https://www.googleapis.com/auth/classroom.courseworkmaterials',
            'https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly',
            'https://www.googleapis.com/auth/classroom.announcements.readonly',
            'https://www.googleapis.com/auth/classroom.rosters.readonly'
          ].join(' '),
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  callbacks: {
    async jwt({ token, account }: { token: JWT; account: Account | null }): Promise<ExtendedToken> {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token as ExtendedToken;
    },
    async session({ session, token }: { session: ExtendedSession; token: ExtendedToken }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };