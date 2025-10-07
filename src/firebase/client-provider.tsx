"use client";

import { FirebaseProvider } from "./provider";

// This provider ensures that Firebase is only initialized on the client side.
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
    return <FirebaseProvider>{children}</FirebaseProvider>;
}
