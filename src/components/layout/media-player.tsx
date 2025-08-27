"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  SkipForward,
  Maximize2,
} from "lucide-react";
import { Music } from "lucide-react";
import { useEffect, useState } from "react";
import { databases, databaseId, songsCollectionId } from "@/lib/appwrite";
import { Query } from "appwrite";
import type { Song } from "@/lib/types";

export function MediaPlayer() {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);

  useEffect(() => {
    // For now, just fetch the first approved song to play
    const fetchFirstSong = async () => {
        try {
            const response = await databases.listDocuments(databaseId, songsCollectionId, [
                Query.equal('status', 'approved'),
                Query.limit(1)
            ]);
            if (response.documents.length > 0) {
                setCurrentSong(response.documents[0] as any);
            }
        } catch (error) {
            console.error("Failed to fetch song for media player", error);
        }
    }
    fetchFirstSong();
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex h-24 items-center justify-between border-t border-border/80 bg-background/95 px-6 backdrop-blur-sm">
      {currentSong ? (
        <>
          <div className="flex w-[30%] items-center gap-4">
            <Image
              src={currentSong.artwork}
              alt={currentSong.album}
              width={64}
              height={64}
              className="rounded-md"
              data-ai-hint="album cover"
            />
            <div className="flex flex-col overflow-hidden">
              <p className="font-semibold text-foreground truncate">{currentSong.title}</p>
              <p className="text-sm text-muted-foreground truncate">{currentSong.artist}</p>
            </div>
          </div>

          <div className="flex w-[40%] flex-col items-center gap-2">
            <div className="flex items-center gap-4">
              <Button variant="default" size="icon" className="h-12 w-12 rounded-full bg-primary hover:bg-primary/90">
                <Play className="h-6 w-6 fill-primary-foreground text-primary-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <SkipForward className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex w-full items-center gap-2">
              <span className="text-xs text-muted-foreground">0:00</span>
              <Slider defaultValue={[0]} max={100} step={1} className="w-full" />
              <span className="text-xs text-muted-foreground">{currentSong.duration}</span>
            </div>
          </div>
          
          <div className="flex w-[30%] items-center justify-end gap-2">
             <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Link href="/dashboard/now-playing">
                    <Maximize2 className="h-5 w-5" />
                </Link>
            </Button>
          </div>
        </>
      ) : (
        <div className="flex items-center w-full gap-4">
            <Music className="h-6 w-6 text-muted-foreground" />
            <p className="text-muted-foreground">No song playing</p>
        </div>
      )}
    </div>
  );
}
