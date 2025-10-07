"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Clapperboard,
} from "lucide-react";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { AdminNav } from "./_components/admin-nav";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { useAuth } from "@/firebase/auth/use-user";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <FirebaseClientProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 p-2">
              <Clapperboard className="w-6 h-6 text-accent" />
              <h2 className="text-lg font-semibold font-headline">
                MediaScreen
              </h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <AdminNav />
          </SidebarContent>
          <SidebarFooter>
            <Button asChild variant="ghost" className="w-full justify-start gap-2">
              <Link href="/">
                <ArrowLeft />
                <span>Back to Home</span>
              </Link>
            </Button>
          </SidebarFooter>
        </Sidebar>
        <main className="flex-1">{children}</main>
      </SidebarProvider>
    </FirebaseClientProvider>
  );
}
