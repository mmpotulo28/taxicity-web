import type { PropsWithChildren } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { MobileClerkProvider } from "../../core/auth/clerk";

const queryClient = new QueryClient();

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <MobileClerkProvider>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MobileClerkProvider>
  );
}
