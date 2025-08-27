"use client";

import { useEffect, useState } from 'react';
import { MusicCard } from "@/components/music/music-card";
import { playlists } from "@/lib/data";
import { databases, databaseId, songsCollectionId } from '@/lib/appwrite';
import { Query } from 'appwrite';
import type { Song } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';


export default function DashboardPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSongs = async () => {
      setIsLoading(true);
      try {
        const response = await databases.listDocuments(databaseId, songsCollectionId, [Query.equal('status', 'approved')]);
        setSongs(response.documents as any[]);
      } catch (error) {
        console.error("Failed to fetch songs", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSongs();
  }, []);

  return (
    <div className="space-y-12">
      <section>
        <h2 className="text-3xl font-bold font-headline tracking-tight text-foreground">
          Made For You
        </h2>
        <p className="text-muted-foreground mt-1">
          Playlists curated based on your recent listening habits.
        </p>
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {playlists.map((playlist) => (
            <MusicCard key={playlist.id} item={playlist} type="playlist" />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-bold font-headline tracking-tight text-foreground">
          New Releases
        </h2>
        <p className="text-muted-foreground mt-1">
          Fresh tracks from artists you might like.
        </p>
        {isLoading ? (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({length: 5}).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : songs.length > 0 ? (
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {songs.map((song) => (
              <MusicCard key={song.$id} item={song} type="song" />
            ))}
          </div>
        ) : (
          <div className="mt-6 text-center text-muted-foreground border rounded-lg p-8">
            <p>No new releases at the moment. Approve some songs in the admin panel!</p>
          </div>
        )}
      </section>
    </div>
  );
}
