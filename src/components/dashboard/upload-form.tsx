"use client";

import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Music, Video } from 'lucide-react';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { storage, databases, uploadsBucketId, databaseId, songsCollectionId, videosCollectionId } from '@/lib/appwrite';
import { ID } from 'appwrite';
import { nanoid } from 'nanoid';


// Zod Schema for Song Upload
const songFormSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters."),
    artists: z.array(z.object({ name: z.string().min(1, "Artist name cannot be empty.") })),
    album: z.string().min(2, "Album name must be at least 2 characters."),
    description: z.string().optional(),
    tags: z.string().min(1, "Please provide at least one tag."),
    audioFile: z.any().refine(file => file?.length == 1, "Audio file is required."),
    artworkFile: z.any().refine(file => file?.length == 1, "Artwork image is required."),
});

// Zod Schema for Video Upload
const videoFormSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters."),
    artists: z.array(z.object({ name: z.string().min(1, "Artist name cannot be empty.") })),
    videoFile: z.any().refine(file => file?.length == 1, "Video file is required."),
    audioLink: z.string().optional(),
})

export function UploadForm() {
    const { toast } = useToast();
    const [isSongLoading, setIsSongLoading] = useState(false);
    const [isVideoLoading, setIsVideoLoading] = useState(false);

    // Song Form setup
    const songForm = useForm<z.infer<typeof songFormSchema>>({
        resolver: zodResolver(songFormSchema),
        defaultValues: {
            title: "",
            artists: [{ name: "" }],
            album: "",
            description: "",
            tags: "",
        },
    });

    const { fields: songArtists, append: appendSongArtist, remove: removeSongArtist } = useFieldArray({
        control: songForm.control,
        name: "artists",
    });

    // Video Form setup
    const videoForm = useForm<z.infer<typeof videoFormSchema>>({
        resolver: zodResolver(videoFormSchema),
        defaultValues: {
            title: "",
            artists: [{ name: "" }],
            audioLink: "",
        },
    });

    const { fields: videoArtists, append: appendVideoArtist, remove: removeVideoArtist } = useFieldArray({
        control: videoForm.control,
        name: "artists",
    });

    const getFilePreviewUrl = (fileId: string) => {
        return storage.getFilePreview(uploadsBucketId, fileId, 200).href;
    }
    
    // Quick and dirty duration formatter
    const getAudioDuration = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const audio = document.createElement('audio');
            audio.src = URL.createObjectURL(file);
            audio.addEventListener('loadedmetadata', () => {
                const duration = audio.duration;
                const minutes = Math.floor(duration / 60);
                const seconds = Math.floor(duration % 60).toString().padStart(2, '0');
                resolve(`${minutes}:${seconds}`);
                URL.revokeObjectURL(audio.src);
            });
        });
    }

    const onSongSubmit = async (values: z.infer<typeof songFormSchema>) => {
        setIsSongLoading(true);
        try {
            const audioFile = values.audioFile[0];
            const artworkFile = values.artworkFile[0];

            // 1. Upload files to Appwrite Storage
            const artworkUpload = await storage.createFile(uploadsBucketId, `${nanoid()}-${artworkFile.name}`, artworkFile);
            const audioUpload = await storage.createFile(uploadsBucketId, `${nanoid()}-${audioFile.name}`, audioFile);

            // 2. Get file details
            const artworkUrl = getFilePreviewUrl(artworkUpload.$id);
            const audioDuration = await getAudioDuration(audioFile);
            
            // 3. Prepare data for database
            const songData = {
                title: values.title,
                artist: values.artists.map(a => a.name).join(', '),
                album: values.album,
                description: values.description || '',
                tags: values.tags.split(',').map(tag => tag.trim()),
                artwork: artworkUrl,
                status: 'pending',
                duration: audioDuration,
                // We would store audio file id to play it later
                audio_id: audioUpload.$id,
            };

            // 4. Create document in Appwrite Database
            await databases.createDocument(databaseId, songsCollectionId, ID.unique(), songData);
            
            toast({
                title: "Song Submitted!",
                description: "Your song has been sent for approval.",
            });
            songForm.reset();

        } catch (error) {
            console.error("Song submission failed:", error);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: "There was a problem submitting your song. Please try again.",
            });
        } finally {
            setIsSongLoading(false);
        }
    }

    const onVideoSubmit = async (values: z.infer<typeof videoFormSchema>) => {
        setIsVideoLoading(true);
        try {
            const videoFile = values.videoFile[0];

            // 1. Upload video file
            const videoUpload = await storage.createFile(uploadsBucketId, `${nanoid()}-${videoFile.name}`, videoFile);

            // 2. Prepare data for database
            const videoData = {
                title: values.title,
                artist: values.artists.map(a => a.name).join(', '),
                video_id: videoUpload.$id,
                status: 'pending',
                audio_link: values.audioLink || '',
            };

            // 3. Create document in Appwrite Database
            await databases.createDocument(databaseId, videosCollectionId, ID.unique(), videoData);

            toast({
                title: "Video Submitted!",
                description: "Your video has been sent for approval.",
            });
            videoForm.reset();
        } catch (error) {
            console.error("Video submission failed:", error);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: "There was a problem submitting your video. Please try again.",
            });
        } finally {
            setIsVideoLoading(false);
        }
    }

    return (
       <Tabs defaultValue="song" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="song"><Music className="mr-2 h-4 w-4"/>Upload Song</TabsTrigger>
                <TabsTrigger value="video"><Video className="mr-2 h-4 w-4"/>Upload Video</TabsTrigger>
            </TabsList>

            <TabsContent value="song">
                <Card>
                    <CardHeader>
                        <CardTitle>Submit a New Song</CardTitle>
                        <CardDescription>Upload your track details. It will be reviewed by an admin before appearing on the platform.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...songForm}>
                            <form onSubmit={songForm.handleSubmit(onSongSubmit)} className="space-y-6">
                                <FormField
                                    control={songForm.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Song Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Cosmic Drift" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div>
                                    <Label>Artist(s)</Label>
                                    {songArtists.map((field, index) => (
                                        <div key={field.id} className="flex items-center gap-2 mt-2">
                                            <FormField
                                                control={songForm.control}
                                                name={`artists.${index}.name`}
                                                render={({ field }) => (
                                                     <FormItem className="flex-grow">
                                                        <FormControl>
                                                            <Input placeholder={`Artist ${index + 1}`} {...field} />
                                                        </FormControl>
                                                         <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {index > 0 && (
                                                <Button type="button" variant="destructive" size="icon" onClick={() => removeSongArtist(index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendSongArtist({ name: "" })}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Artist
                                    </Button>
                                </div>
                                
                                <FormField
                                    control={songForm.control}
                                    name="album"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Album</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Galactic Echoes" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={songForm.control}
                                    name="tags"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Tags</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Synthwave, Electronic, 80s" {...field} />
                                            </FormControl>
                                            <FormDescription>Separate tags with commas.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                 <FormField
                                    control={songForm.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea placeholder="A synthwave track about..." {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={songForm.control}
                                    name="artworkFile"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Album Artwork</FormLabel>
                                            <FormControl>
                                                <Input type="file" accept="image/*" {...songForm.register('artworkFile')} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={songForm.control}
                                    name="audioFile"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Audio File</FormLabel>
                                            <FormControl>
                                                <Input type="file" accept="audio/mpeg,audio/wav" {...songForm.register('audioFile')} />
                                            </FormControl>
                                            <FormDescription>Lossless or high-quality MP3 (320kbps) recommended.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                
                                <Button type="submit" disabled={isSongLoading}>
                                    {isSongLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit Song
                                </Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="video">
                 <Card>
                    <CardHeader>
                        <CardTitle>Submit a New Video</CardTitle>
                        <CardDescription>Upload your music video. It will be reviewed by an admin.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <Form {...videoForm}>
                            <form onSubmit={videoForm.handleSubmit(onVideoSubmit)} className="space-y-6">
                               <FormField
                                    control={videoForm.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Video Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Starlight Memories" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div>
                                    <Label>Artist(s)</Label>
                                    {videoArtists.map((field, index) => (
                                        <div key={field.id} className="flex items-center gap-2 mt-2">
                                            <FormField
                                                control={videoForm.control}
                                                name={`artists.${index}.name`}
                                                render={({ field }) => (
                                                     <FormItem className="flex-grow">
                                                        <FormControl>
                                                            <Input placeholder={`Artist ${index + 1}`} {...field} />
                                                        </FormControl>
                                                         <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {index > 0 && (
                                                <Button type="button" variant="destructive" size="icon" onClick={() => removeVideoArtist(index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => appendVideoArtist({ name: "" })}>
                                        <Plus className="mr-2 h-4 w-4" /> Add Artist
                                    </Button>
                                </div>

                                <FormField
                                    control={videoForm.control}
                                    name="videoFile"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Video File</FormLabel>
                                            <FormControl>
                                                <Input type="file" accept="video/mp4" {...videoForm.register('videoFile')} />
                                            </FormControl>
                                            <FormDescription>MP4 format is required.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={videoForm.control}
                                    name="audioLink"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Link to Audio Version (Optional)</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Enter song ID or URL" {...field} />
                                            </FormControl>
                                            <FormDescription>Link this video to an existing song on Hifier.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button type="submit" disabled={isVideoLoading}>
                                    {isVideoLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit Video
                                </Button>
                            </form>
                         </Form>
                    </CardContent>
                 </Card>
            </TabsContent>
       </Tabs>
    );
}
