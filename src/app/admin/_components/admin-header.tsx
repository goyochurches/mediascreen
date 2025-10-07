"use client";

import { usePathname } from "next/navigation";
import { LayoutDashboard, Monitor, ListVideo, Image as ImageIcon, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/firebase/auth/use-user";

const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/screens", label: "Screens", icon: Monitor },
    { href: "/admin/playlists", label: "Playlists", icon: ListVideo },
    { href: "/admin/content", label: "Content", icon: ImageIcon },
  ];

export function AdminHeader() {
    const pathname = usePathname();
    const { logout } = useAuth();
    const currentPage = navItems.find(item => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))) ?? { label: "Admin" };

    return (
        <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10 h-[57px]">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">{currentPage.label}</h1>
            <div>
              <Button variant="ghost" size="icon" onClick={logout}>
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
        </header>
    );
}
