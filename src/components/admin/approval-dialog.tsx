"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Song } from "@/lib/types";
import { songApprovalReasoning } from "@/ai/flows/song-approval-reasoning";
import { Loader2, Sparkles, ThumbsUp, ThumbsDown } from "lucide-react";
import Image from "next/image";
import { databases, databaseId, songsCollectionId } from "@/lib/appwrite";

type ApprovalDialogProps = {
  song: Song;
  onSongUpdate: (songId: string, newStatus: 'approved' | 'rejected') => void;
};

type ReasoningState = {
  reasoning: string;
  verdict: 'approve' | 'reject' | null;
};

export function ApprovalDialog({ song, onSongUpdate }: ApprovalDialogProps) {
  const [reasoningState, setReasoningState] = useState<ReasoningState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const handleGenerateReasoning = async () => {
    setIsLoading(true);
    setReasoningState(null);
    try {
      const result = await songApprovalReasoning({
        title: song.title,
        description: song.description,
        tags: song.tags,
      });
      setReasoningState(result);
    } catch (error) {
      console.error("Error generating reasoning:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate AI reasoning.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDecision = async (decision: 'approved' | 'rejected') => {
    setIsUpdating(true);
    try {
        await databases.updateDocument(databaseId, songsCollectionId, song.$id, {
            status: decision,
        });
        toast({
            title: `Song ${decision.charAt(0).toUpperCase() + decision.slice(1)}`,
            description: `"${song.title}" by ${song.artist} has been ${decision}.`,
        });
        onSongUpdate(song.$id, decision);
        setIsOpen(false);
        setReasoningState(null);
    } catch (error) {
        console.error(`Failed to ${decision} song:`, error);
        toast({
            variant: "destructive",
            title: "Error",
            description: `Could not update the song status. Please try again.`,
        });
    } finally {
        setIsUpdating(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Review</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Song Approval</DialogTitle>
          <DialogDescription>
            Review the song details and use AI to assist in your decision.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
                <Card>
                    <CardContent className="p-4">
                        <Image src={song.artwork} alt={song.title} width={300} height={300} className="rounded-md w-full aspect-square object-cover" data-ai-hint="song artwork"/>
                        <h3 className="text-lg font-semibold mt-4">{song.title}</h3>
                        <p className="text-sm text-muted-foreground">{song.artist}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {song.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                        </div>
                        <p className="text-sm mt-4 text-muted-foreground">{song.description}</p>
                    </CardContent>
                </Card>
            </div>
            <div className="flex flex-col gap-4">
                <Button onClick={handleGenerateReasoning} disabled={isLoading || isUpdating}>
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate AI Reasoning
                </Button>
                
                <div className="space-y-2">
                    <Label htmlFor="reasoning">AI-Generated Reasoning</Label>
                    <Textarea
                        id="reasoning"
                        placeholder="Click the button above to generate reasoning..."
                        value={reasoningState?.reasoning || ""}
                        readOnly
                        className="h-48"
                    />
                </div>
                 {reasoningState?.verdict && (
                    <div className="flex items-center gap-2">
                        <span className="font-semibold">AI Verdict:</span>
                        <Badge variant={reasoningState.verdict === 'approve' ? 'default' : 'destructive'}>
                           {reasoningState.verdict === 'approve' ? <ThumbsUp className="h-4 w-4 mr-1" /> : <ThumbsDown className="h-4 w-4 mr-1" />}
                            {reasoningState.verdict.charAt(0).toUpperCase() + reasoningState.verdict.slice(1)}
                        </Badge>
                    </div>
                )}
            </div>
        </div>
        <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline" disabled={isUpdating}>Cancel</Button>
            </DialogClose>
            <Button variant="destructive" onClick={() => handleDecision('rejected')} disabled={!reasoningState || isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Reject
            </Button>
            <Button onClick={() => handleDecision('approved')} disabled={!reasoningState || isUpdating}>
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Approve
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
