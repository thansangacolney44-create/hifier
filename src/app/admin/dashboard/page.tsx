"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ApprovalDialog } from "@/components/admin/approval-dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { databases, databaseId, songsCollectionId, account } from "@/lib/appwrite";
import type { Song } from "@/lib/types";
import { Query } from "appwrite";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const [pendingSongs, setPendingSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await account.get();
        setIsAuthenticated(true);
      } catch (error) {
        router.push('/admin/login');
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchPendingSongs = async () => {
      setIsLoading(true);
      try {
        const response = await databases.listDocuments(
          databaseId,
          songsCollectionId,
          [Query.equal("status", "pending")]
        );
        setPendingSongs(response.documents as any[]);
      } catch (error) {
        console.error("Failed to fetch pending songs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingSongs();
  }, [isAuthenticated]);

  const handleSongUpdate = (songId: string, newStatus: 'approved' | 'rejected') => {
    setPendingSongs(prevSongs => prevSongs.filter(song => song.$id !== songId));
  }
  
  if (!isAuthenticated) {
     return (
        <div className="flex min-h-screen items-center justify-center bg-secondary">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-secondary p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground">
              Song Approval Queue
            </h1>
            <p className="text-muted-foreground mt-1">
              Review and approve new song submissions.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Exit Admin</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pending Submissions</CardTitle>
            <CardDescription>
              {isLoading ? 'Loading submissions...' : `There are ${pendingSongs.length} songs awaiting your review.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Song</TableHead>
                    <TableHead className="hidden md:table-cell">Artist</TableHead>
                    <TableHead className="hidden lg:table-cell">Tags</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-md" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : pendingSongs.length > 0 ? (
                    pendingSongs.map((song) => (
                      <TableRow key={song.$id}>
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Image
                              src={song.artwork}
                              alt={song.title}
                              width={40}
                              height={40}
                              className="rounded-md"
                              data-ai-hint="song artwork"
                            />
                            <span className="font-medium text-foreground">{song.title}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{song.artist}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {song.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary">{tag}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <ApprovalDialog song={song} onSongUpdate={handleSongUpdate} />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center h-24">No pending songs.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
