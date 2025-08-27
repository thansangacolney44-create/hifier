"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  SkipBack,
  SkipForward,
  Repeat,
  Shuffle,
  Mic2,
  ListMusic,
  Laptop2,
  Volume2,
  Download,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Music } from "lucide-react";
import { useEffect, useState } from "react";
import { databases, databaseId, songsCollectionId, storage, uploadsBucketId } from "@/lib/appwrite";
import { Query } from "appwrite";
import type { Song } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function NowPlayingPage() {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // For now, just fetch the first approved song to display
    const fetchFirstSong = async () => {
        setIsLoading(true);
        try {
            const response = await databases.listDocuments(databaseId, songsCollectionId, [
                Query.equal('status', 'approved'),
                Query.limit(1)
            ]);
            if (response.documents.length > 0) {
                setCurrentSong(response.documents[0] as any);
            }
        } catch (error) {
            console.error("Failed to fetch song for now playing page", error);
        } finally {
            setIsLoading(false);
        }
    }
    fetchFirstSong();
  }, []);

  const handleDownload = () => {
    if (!currentSong) return;
    const result = storage.getFileDownload(uploadsBucketId, currentSong.audio_id);
    window.open(result.href, '_blank');
  }

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-foreground p-4">
            <Card className="w-full max-w-md bg-secondary/30">
                 <CardContent className="p-6 flex flex-col items-center text-center">
                     <Skeleton className="relative w-full aspect-square max-w-sm rounded-lg" />
                     <div className="mt-6 w-full space-y-2">
                         <Skeleton className="h-6 w-3/4 mx-auto" />
                         <Skeleton className="h-4 w-1/2 mx-auto" />
                     </div>
                     <div className="w-full mt-6 space-y-4">
                        <Skeleton className="h-2 w-full" />
                        <div className="flex justify-center gap-4">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-16 w-16 rounded-full" />
                            <Skeleton className="h-10 w-10 rounded-full" />
                        </div>
                     </div>
                </CardContent>
            </Card>
        </div>
    )
  }

  if (!currentSong) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-foreground p-4">
            <Card className="w-full max-w-md bg-secondary/30">
                 <CardContent className="p-6 flex flex-col items-center text-center">
                    <Music className="h-16 w-16 text-muted-foreground mb-4" />
                    <h2 className="text-2xl font-bold font-headline">Nothing Playing</h2>
                    <p className="text-muted-foreground">Go back and select a song to play.</p>
                </CardContent>
            </Card>
        </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-foreground p-4">
        <Card className="w-full max-w-md bg-secondary/30">
            <CardContent className="p-6 flex flex-col items-center text-center">
                 <div className="relative w-full aspect-square max-w-sm">
                    <Image
                        src={currentSong.artwork}
                        alt={currentSong.album}
                        fill
                        className="rounded-lg object-cover"
                        data-ai-hint="album cover"
                    />
                </div>

                <div className="mt-6 w-full">
                    <h2 className="text-2xl font-bold font-headline">{currentSong.title}</h2>
                    <p className="text-lg text-muted-foreground">{currentSong.artist}</p>
                </div>

                <div className="w-full mt-6">
                    <div className="flex w-full items-center gap-2">
                        <span className="text-xs text-muted-foreground">0:00</span>
                        <Slider defaultValue={[0]} max={100} step={1} className="w-full" />
                        <span className="text-xs text-muted-foreground">{currentSong.duration}</span>
                    </div>
                     <div className="flex items-center justify-center gap-2 mt-4">
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground">
                            <Shuffle className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground">
                            <SkipBack className="h-6 w-6" />
                        </Button>
                        <Button variant="default" size="icon" className="h-16 w-16 rounded-full bg-primary hover:bg-primary/90">
                            <Play className="h-8 w-8 fill-primary-foreground text-primary-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground">
                            <SkipForward className="h-6 w-6" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground hover:text-foreground">
                            <Repeat className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex w-full items-center justify-between mt-6">
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <Mic2 className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <ListMusic className="h-5 w-5" />
                        </Button>
                         <Button onClick={handleDownload} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                            <Download className="h-5 w-5" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-2 w-32">
                        <Volume2 className="h-5 w-5 text-muted-foreground" />
                        <Slider defaultValue={[80]} max={100} step={1} />
                    </div>
                </div>

            </CardContent>
        </Card>
    </div>
  );
}
