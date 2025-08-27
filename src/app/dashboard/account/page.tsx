
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { Clock, Music, Users, Upload } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadForm } from "@/components/dashboard/upload-form";
import { useEffect, useState } from "react";
import { databases, databaseId, songsCollectionId } from "@/lib/appwrite";
import { Query } from "appwrite";
import type { Artist } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

const listeningData = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 3 },
  { day: "Wed", hours: 4 },
  { day: "Thu", hours: 2 },
  { day: "Fri", hours: 5 },
  { day: "Sat", hours: 6 },
  { day: "Sun", hours: 3.5 },
];

export default function AccountPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopArtists = async () => {
      setIsLoading(true);
      try {
        const response = await databases.listDocuments(databaseId, songsCollectionId, [Query.equal('status', 'approved')]);
        const approvedSongs = response.documents as any[];
        
        const artistMap = new Map<string, Artist>();
        approvedSongs.forEach(song => {
          if (!artistMap.has(song.artist)) {
            artistMap.set(song.artist, {
              id: song.artist, // Use artist name as ID for simplicity
              name: song.artist,
              artwork: song.artwork,
            });
          }
        });
        // Get top 5 artists for this example
        setArtists(Array.from(artistMap.values()).slice(0, 5));

      } catch (error) {
        console.error("Failed to fetch top artists", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTopArtists();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold font-headline tracking-tight text-foreground">
          Your Hub
        </h1>
        <p className="text-muted-foreground mt-2">
          Your personal stats, uploads, and account settings.
        </p>
      </div>

      <Tabs defaultValue="dashboard">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="dashboard">
            <Users className="mr-2 h-4 w-4" />
            Dashboard
            </TabsTrigger>
          <TabsTrigger value="uploads">
            <Upload className="mr-2 h-4 w-4" />
            Upload Music & Video
          </TabsTrigger>
        </TabsList>
        <TabsContent value="dashboard" className="mt-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Listening Time (Last 7 Days)</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">26 Hours</div>
                  <p className="text-xs text-muted-foreground">+15% from last week</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Discovered Artists</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+12</div>
                  <p className="text-xs text-muted-foreground">In the last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Favorite Genre</CardTitle>
                  <Music className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">Synthwave</div>
                  <p className="text-xs text-muted-foreground">Based on your listening history</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Listening Activity</CardTitle>
                  <CardDescription>Hours spent listening this week</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={listeningData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--background))",
                            borderColor: "hsl(var(--border))",
                          }}
                        />
                        <Bar dataKey="hours" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Top Artists</CardTitle>
                  <CardDescription>Your most played artists this month.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                     Array.from({length: 4}).map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                           <Skeleton className="h-10 w-10 rounded-full" />
                           <Skeleton className="h-4 w-32" />
                        </div>
                     ))
                  ) : artists.length > 0 ? (
                    artists.map((artist) => (
                      <Link href="#" key={artist.id}>
                        <div className="flex items-center gap-4 p-2 rounded-lg hover:bg-secondary">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={artist.artwork} alt={artist.name} data-ai-hint="artist photo"/>
                            <AvatarFallback>{artist.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <p className="font-semibold text-foreground">{artist.name}</p>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No artists found. Start listening to discover new music!</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="uploads" className="mt-6">
            <UploadForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

