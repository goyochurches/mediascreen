import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Clapperboard, User } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center gap-4 mb-4">
          <Clapperboard className="w-16 h-16 text-accent" />
          <h1 className="text-5xl font-bold font-headline tracking-tight text-primary-foreground">
            MediaScreen
          </h1>
        </div>
        <p className="max-w-2xl mt-2 text-lg text-muted-foreground">
          Your dynamic digital signage solution. Manage and display media content on any screen, anywhere.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 w-full max-w-6xl">
        <Card className="hover:border-accent transition-colors duration-300 md:col-span-6 lg:col-span-1">
          <CardHeader>
            <div className="flex items-center gap-4">
              <User className="w-8 h-8 text-accent" />
              <CardTitle className="text-2xl font-headline">User Panel</CardTitle>
            </div>
            <CardDescription>
              Manage your content, playlists, and screens.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/admin">
                Enter User Panel
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
       <footer className="mt-16 text-center text-muted-foreground text-sm">
        <p>Powered by goyochurches.</p>
      </footer>
    </main>
  );
}
