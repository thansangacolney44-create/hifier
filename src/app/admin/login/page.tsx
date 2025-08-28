
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppwriteException } from "appwrite";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Music, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { account } from "@/lib/appwrite";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await account.createEmailPasswordSession(email, password);
      router.push("/admin/dashboard");
    } catch (e: any) {
      console.error(e);
      let errorMessage = "An unexpected error occurred. Please check the console.";
      if (e instanceof AppwriteException) {
        errorMessage = `Error: ${e.message} (Type: ${e.type}, Code: ${e.code})`;
      } else if (e.message) {
        // Handle native fetch errors
        errorMessage = `Network Error: ${e.message}. Please check your Appwrite endpoint and platform settings.`;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Music className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="font-headline text-2xl">
            Hifier Admin
          </CardTitle>
          <CardDescription>
            Enter your credentials to access the management portal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Login Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@hifier.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(); }}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button onClick={handleLogin} className="w-full" disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                Login <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
          <Button variant="link" size="sm" asChild>
            <Link href="/">Back to main site</Link>
          </Button>
        </CardFooter>
      </Card>

      {/* --- TEMPORARY DEBUGGING SECTION --- */}
      <Card className="w-full max-w-sm mt-6">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
            <CardDescription>Verify these values with your Appwrite console.</CardDescription>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
              <div>
                  <p className="font-bold">Endpoint:</p>
                  <p className="font-mono break-all">{process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}</p>
              </div>
              <div>
                  <p className="font-bold">Project ID:</p>
                  <p className="font-mono break-all">{process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}</p>
              </div>
               <div>
                  <p className="font-bold">Database ID:</p>
                  <p className="font-mono break-all">{process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID}</p>
              </div>
               <div>
                  <p className="font-bold">Songs Collection ID:</p>
                  <p className="font-mono break-all">{process.env.NEXT_PUBLIC_APPWRITE_SONGS_COLLECTION_ID}</p>
              </div>
              <div>
                  <p className="font-bold">Videos Collection ID:</p>
                  <p className="font-mono break-all">{process.env.NEXT_PUBLIC_APPWRITE_VIDEOS_COLLECTION_ID}</p>
              </div>
              <div>
                  <p className="font-bold">Uploads Bucket ID:</p>
                  <p className="font-mono break-all">{process.env.NEXT_PUBLIC_APPWRITE_UPLOADS_BUCKET_ID}</p>
              </div>
          </CardContent>
      </Card>
      {/* --- END DEBUGGING SECTION --- */}
    </div>
  );
}
