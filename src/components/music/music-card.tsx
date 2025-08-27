import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { Playlist, Artist, Song } from "@/lib/types";

type MusicCardProps = {
  item: Playlist | Artist | Song;
  type: 'playlist' | 'artist' | 'song';
};

export function MusicCard({ item, type }: MusicCardProps) {
  const getTitle = () => {
    if ('name' in item) return item.name;
    if ('title' in item) return item.title;
    return '';
  }

  const getDescription = () => {
    if (type === 'playlist' && 'creator' in item) return `Playlist • ${item.creator}`;
    if (type === 'artist') return 'Artist';
    if (type === 'song' && 'artist' in item) return `Song • ${item.artist}`;
    return '';
  }

  const getHref = () => {
    if (type === 'song') return '/dashboard/now-playing';
    // Add links for playlists and artists later
    return '#';
  }

  return (
    <Link href={getHref()} className="block">
        <Card className="group overflow-hidden border-0 bg-secondary/60 hover:bg-secondary transition-colors duration-300 cursor-pointer h-full">
            <CardContent className="p-4 flex flex-col gap-4 h-full">
                <div className="relative aspect-square w-full">
                <Image
                    src={item.artwork}
                    alt={getTitle()}
                    fill
                    className="rounded-md object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="music related"
                />
                </div>
                <div className="flex flex-col mt-auto">
                <p className="font-semibold truncate text-foreground">{getTitle()}</p>
                <p className="text-sm truncate text-muted-foreground">{getDescription()}</p>
                </div>
            </CardContent>
        </Card>
    </Link>
  );
}
