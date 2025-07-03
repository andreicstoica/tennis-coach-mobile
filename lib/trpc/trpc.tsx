import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createTRPCClient, httpLink } from '@trpc/client';
import { createTRPCContext } from '@trpc/tanstack-react-query';
import { useState } from 'react';
import { authClient } from '../auth-client';
import { type AppRouter } from './trpc-router';

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>();

let browserQueryClient: QueryClient | undefined = undefined;
function getQueryClient() {
  if (!browserQueryClient)
    browserQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000,
        },
      },
    });
  return browserQueryClient;
}

export function TRPCClientProvider(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpLink({
          url: 'https://courtly-xi.vercel.app/api/trpc',
          headers() {
            const headers = new Map<string, string>();
            const cookies = authClient.getCookie();
            if (cookies) {
              headers.set('Cookie', cookies);
            }
            return Object.fromEntries(headers);
          },
          fetch: async (url, options) => {
            console.log('TRPC fetch request:', { url, method: options?.method });
            try {
              const response = await fetch(url, options);
              console.log('TRPC fetch response status:', response.status);
              if (!response.ok) {
                const errorText = await response.text();
                console.error('TRPC fetch error:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
              }
              return response;
            } catch (error) {
              console.error('TRPC fetch error:', error);
              throw error;
            }
          },
        }),
      ],
    })
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
