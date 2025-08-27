"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Play } from "lucide-react";
import { databases, databaseId, songsCollectionId } from "@/lib/appwrite";
import { Query } from "appwrite";
import type { Song, Artist } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";


export default function TrendingPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchTrendingData = async () => {
      setIsLoading(true);
      try {
        const response = await databases.listDocuments(databaseId, songsCollectionId, [Query.equal('status', 'approved')]);
        const approvedSongs = response.documents as any[];
        setSongs(approvedSongs);

        // Derive artists from songs
        const artistMap = new Map<string, Artist>();
        approvedSongs.forEach(song => {
          if (!artistMap.has(song.artist)) {
            artistMap.set(song.artist, {
              id: song.$id + song.artist, // simple unique id
              name: song.artist,
              artwork: song.artwork, // Use song artwork for artist for now
            });
          }
        });
        setArtists(Array.from(artistMap.values()));

      } catch (error) {
        console.error("Failed to fetch trending data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrendingData();
  }, []);

  return (
    <div className="space-y-12">
      <section>
        <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground">
          Trending
        </h1>
        <p className="text-muted-foreground mt-2">
          Discover the most popular tracks and artists on Hifier right now.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold font-headline tracking-tight text-foreground">
          Trending Songs
        </h2>
        {isLoading ? (
            <div className="mt-4 rounded-lg border">
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead className="w-16">#</TableHead>
                        <TableHead>Song</TableHead>
                        <TableHead className="hidden md:table-cell">Album</TableHead>
                        <TableHead className="text-right">Duration</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Array.from({length: 5}).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-10 w-10" /></TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-10 w-10 rounded-md" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                                <TableCell className="text-right"><Skeleton className="h-4 w-12" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                 </Table>
            </div>
        ): songs.length > 0 ? (
          <div className="mt-4 rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">#</TableHead>
                  <TableHead>Song</TableHead>
                  <TableHead className="hidden md:table-cell">Album</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {songs.map((song, index) => (
                  <TableRow key={song.$id} className="group cursor-pointer" onClick={() => router.push('/dashboard/now-playing')}>
                    <TableCell className="font-medium">
                       <div className="flex items-center justify-center h-10 w-10">
                          <span className="group-hover:hidden">{index + 1}</span>
                          <Play className="hidden h-5 w-5 fill-current group-hover:block" />
                       </div>
                    </TableCell>
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
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">
                            {song.title}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            {song.artist}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{song.album}</TableCell>
                    <TableCell className="text-right">{song.duration}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="mt-4 text-center text-muted-foreground rounded-lg border p-8">
            <p>No trending songs right now. The charts are waiting for a hit!</p>
          </div>
        )}
      </section>
       <section>
        <h2 className="text-2xl font-bold font-headline tracking-tight text-foreground">
          Top Artists
        </h2>
        {isLoading ? (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({length: 4}).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/60">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                ))}
            </div>
        ) : artists.length > 0 ? (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {artists.map((artist) => (
                <Link href="#" key={artist.id}>
                  <div className="flex items-center gap-4 p-4 rounded-lg bg-secondary/60 hover:bg-secondary transition-colors">
                      <Avatar className="h-12 w-12">
                          <AvatarImage src={artist.artwork} alt={artist.name} data-ai-hint="artist photo" />
                          <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <p className="font-semibold text-foreground">{artist.name}</p>
                  </div>
                </Link>
              ))}
          </div>
        ) : (
          <div className="mt-4 text-center text-muted-foreground rounded-lg border p-8">
            <p>No top artists yet. Be the first to discover a rising star!</p>
          </div>
        )}
       </section>
    </div>
  );
}
