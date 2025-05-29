
import NextAuth, { AuthOptions } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import ZitadelProvider from 'next-auth/providers/zitadel';
import { Issuer } from 'openid-client';

export const runtime = 'nodejs' // force Node.js for full cookie support


async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const issuer = await Issuer.discover(process.env.ZITADEL_ISSUER ?? '');
    const client = new issuer.Client({
      client_id: process.env.ZITADEL_CLIENT_ID || '',
      token_endpoint_auth_method: 'none',
    });


    const { refresh_token, access_token, expires_at } = await client.refresh(token.refreshToken as string);


    return {
      ...token,
      accessToken: access_token,
      expiresAt: (expires_at ?? 0) * 1000,
      refreshToken: refresh_token, 
    };
  } catch (error) {
    console.error('Error during refreshAccessToken', error);

    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
}


const authOptions : AuthOptions = {
  providers: [
    ZitadelProvider({
      issuer: process.env.ZITADEL_ISSUER,
      clientId: process.env.ZITADEL_CLIENT_ID!,
      clientSecret: process.env.ZITADEL_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: process.env.ZITADEL_SCOPE!,
        },
      },
      async profile(profile: any) {
        return {
          id: profile.sub,
          name: profile.name,
          firstName: profile.given_name,
          lastName: profile.family_name,
          email: profile.email,
          loginName: profile.preferred_username,
          image: profile.picture,
        };
      },
      
    }),
  ],
  //  cookies: { //secure cookies in production environments
  //   pkceCodeVerifier: {
  //     name: `__Secure-next-auth.pkce.code_verifier`,
  //     options: {
  //       httpOnly: true,
  //       sameSite: 'lax',
  //       path: '/',
  //       secure: true, 
  //       },
  //     },
  //     csrfToken: {
  //       name: `next-auth.csrf-token`,
  //       options: {
  //         httpOnly: true,
  //         sameSite: 'lax',
  //         path: '/',
  //         secure: true,
  //       },
  //     },
  //     callbackUrl: {
  //       name: `next-auth.callback-url`,
  //       options: {
  //         sameSite: 'lax',
  //         path: '/',
  //         secure: true,
  //       },
  //     },
  //     state: {
  //       name: `__Secure-next-auth.state`,
  //       options: {
  //         httpOnly: true,
  //         sameSite: "lax",
  //         path: "/",
  //         secure: true,
  //       },
  //     },
  //   },
    debug: true,  // ← right here!
  callbacks: {
    async jwt({ token, user, account }) {
      token.user ??= user;
      token.accessToken ??= account?.access_token;
      token.refreshToken ??= account?.refresh_token;
      token.expiresAt ??= (account?.expires_at ?? 0) * 1000;
      token.error = undefined;

      // Return previous token if the access token has not expired yet
      if ( ((token.expiresAt as number) - Date.now() ) > 1000 * 60 * 60 * 1)  { 
        return token;
      }

      // Access token has expired, try to update it if < 1 hour is left
      return await refreshAccessToken(token);
    },
    async session({ session, token: { user, error: tokenError,accessToken } }) {
      session.user = {
        id: user?.id,
        email: user?.email,
        image: user?.image,
        name: user?.name,
        loginName: user?.loginName,
      };
      session.clientId = process.env.ZITADEL_CLIENT_ID!;
      session.error = tokenError;
      session.token=  accessToken ?? "";
      return session;
    },
  },
};


export default NextAuth(authOptions);

// export {handler as GET, handler as POST}