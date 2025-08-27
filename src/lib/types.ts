export interface Song {
  $id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  artwork: string;
  tags: string[];
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  audio_id: string;
}

export interface Video {
    $id: string;
    title: string;
    artist: string;
    video_id: string;
    status: 'pending' | 'approved' | 'rejected';
    audio_link?: string;
}

export interface Playlist {
  id: number;
  name: string;
  creator: string;
  songCount: number;
  artwork: string;
}

export interface Artist {
    id: string;
    name: string;
    artwork: string;
}
