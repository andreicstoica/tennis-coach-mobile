import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpLink } from '@trpc/client';
import React, { useState } from 'react';
import superjson from 'superjson';
import { authClient } from '../auth-client';
import { trpc } from './client';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpLink({
          url: 'https://courtly-xi.vercel.app/api/trpc',
          transformer: superjson,
          async headers() {
            console.log('=== tRPC HEADERS DEBUG ===');

            const headers: Record<string, string> = {};

            try {
              const session = await authClient.getSession();

              if (session?.data?.session?.token) {
                const token = session.data.session.token;

                // Use the CORRECT cookie format that matches your web app
                headers['Cookie'] = `__Secure-better-auth.session_token=${token}`;

                console.log('tRPC: Sending session token in cookie header');
                console.log('tRPC: Token value:', token.substring(0, 10) + '...');
              } else {
                console.log('tRPC: No session token found');
              }
            } catch (error) {
              console.error('tRPC: Error getting session token:', error);
            }

            console.log('=== END tRPC HEADERS DEBUG ===');
            return headers;
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
