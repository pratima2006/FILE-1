'use client';
import YouTube from 'react-youtube';

export default function YouTubePlayer({ videoId, onEnd }: { videoId: string, onEnd: () => void }) {
  return (
    <YouTube
      videoId={videoId}
      opts={{ width: '100%', height: '400' }}
      onEnd={onEnd}
    />
  );
}
