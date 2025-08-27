import { Button } from "@/components/ui/button";
import { Music, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/30 via-background to-background"></div>
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center text-center">
        <div className="max-w-4xl px-4">
          <h1 className="font-headline text-5xl font-bold tracking-tighter text-foreground sm:text-6xl md:text-7xl lg:text-8xl">
            Hifier
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground md:text-xl">
            Discover, stream, and share the music that moves you. A seamless listening experience curated for the modern era.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground font-bold">
              <Link href="/dashboard/account">
                <Music className="mr-2 h-5 w-5" />
                Explore Music
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/admin/login">
                <ShieldCheck className="mr-2 h-5 w-5" />
                Admin Portal
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <footer className="relative z-10 w-full p-4 text-center text-muted-foreground text-sm">
        <p>&copy; {new Date().getFullYear()} Hifier. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
