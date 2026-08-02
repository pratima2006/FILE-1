'use client';
import { useState, useEffect } from 'react';
import YouTubePlayer from '@/components/YouTubePlayer';
import { supabase } from '@/lib/supabase';

const BTS_MVS = [
  { id: 'kTlv5ZR-40c', title: 'Dynamite', thumbnail: 'https://i.ytimg.com/vi/kTlv5ZR-40c/hqdefault.jpg' },
  { id: 'WMweEpGlu_U', title: 'Butter', thumbnail: 'https://i.ytimg.com/vi/WMweEpGlu_U/hqdefault.jpg' },
  { id: 'gdZLi9oWNsI', title: 'IDOL', thumbnail: 'https://i.ytimg.com/vi/gdZLi9oWNsI/hqdefault.jpg' },
  { id: 'XqZsoesa55w', title: 'Like Crazy - Jimin', thumbnail: 'https://i.ytimg.com/vi/XqZsoesa55w/hqdefault.jpg' },
];

export default function Home() {
  const [currentVideo, setCurrentVideo] = useState(BTS_MVS[0].id);
  const [streamMode, setStreamMode] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  const handleVideoEnd = async () => {
    // 1. Save stream to Supabase
    if(user) {
      await supabase.from('streams').insert({
        user_id: user.id,
        video_id: currentVideo,
        watched_at: new Date()
      });
    }
    // 2. Autoplay next if Stream Mode ON
    if(streamMode) {
      const currentIndex = BTS_MVS.findIndex(v => v.id === currentVideo);
      const nextIndex = (currentIndex + 1) % BTS_MVS.length;
      setCurrentVideo(BTS_MVS[nextIndex].id);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen p-4">
      <h1 className="text-3xl font-bold text-purple-400">Borahae.fm</h1>

      <div className="my-4">
        <button onClick={() => setStreamMode(!streamMode)}
          className={`px-4 py-2 rounded ${streamMode? 'bg-purple-600' : 'bg-gray-600'}`}>
          Stream Mode: {streamMode? 'ON' : 'OFF'}
        </button>
      </div>

      <YouTubePlayer videoId={currentVideo} onEnd={handleVideoEnd} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        {BTS_MVS.map(mv => (
          <div key={mv.id} onClick={() => setCurrentVideo(mv.id)} className="cursor-pointer">
            <img src={mv.thumbnail} className="rounded-lg" />
            <p>{mv.title}</p>
            <p className="text-sm text-gray-400">My Streams: 0</p>
          </div>
        ))}
      </div>
    </div>
  );
}
