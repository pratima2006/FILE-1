// Borahae.fm — Curated BTS catalog.
//
// Every entry maps a real YouTube videoId to a BTS artist. Thumbnails are pulled
// directly from YouTube by videoId, so they always stay in sync with the video.
//
// `artistId` links a video to an artist in ARTISTS below. Only videos listed here
// are ever tracked — this is the allow-list. When you receive the official channel
// ID list, you can extend/replace these entries and the rest of the app just works.

export type ArtistId =
  | 'bts'
  | 'rm'
  | 'jin'
  | 'suga'
  | 'jhope'
  | 'jimin'
  | 'v'
  | 'jungkook'

export type Artist = {
  id: ArtistId
  name: string
  role: string
  slug: string
  accent: string // oklch color used as the artist accent
  bio: string
}

export type Video = {
  id: string // YouTube videoId
  title: string
  artistId: ArtistId
  era: string
  year: number
}

export const ARTISTS: Artist[] = [
  {
    id: 'bts',
    name: 'BTS',
    role: 'Group',
    slug: 'bts',
    accent: 'oklch(0.58 0.23 300)',
    bio: '방탄소년단 — the seven-member group whose discography broke every record ARMY threw at it.',
  },
  {
    id: 'rm',
    name: 'RM',
    role: 'Leader · Rapper',
    slug: 'rm',
    accent: 'oklch(0.62 0.16 260)',
    bio: 'Kim Namjoon. Leader, main rapper, and the philosophical voice behind indigo and mono.',
  },
  {
    id: 'jin',
    name: 'Jin',
    role: 'Vocalist',
    slug: 'jin',
    accent: 'oklch(0.7 0.15 30)',
    bio: 'Kim Seokjin. Worldwide handsome vocalist behind "The Astronaut" and "Super Tuna".',
  },
  {
    id: 'suga',
    name: 'SUGA / Agust D',
    role: 'Rapper · Producer',
    slug: 'suga',
    accent: 'oklch(0.68 0.14 150)',
    bio: 'Min Yoongi. Producer and rapper whose Agust D trilogy — including "Daechwita" — is legend.',
  },
  {
    id: 'jhope',
    name: 'j-hope',
    role: 'Rapper · Dancer',
    slug: 'j-hope',
    accent: 'oklch(0.8 0.15 90)',
    bio: 'Jung Hoseok. Main dancer, sunshine, and the mind behind "Jack In The Box" and "MORE".',
  },
  {
    id: 'jimin',
    name: 'Jimin',
    role: 'Vocalist · Dancer',
    slug: 'jimin',
    accent: 'oklch(0.72 0.14 10)',
    bio: 'Park Jimin. Lead vocalist and dancer; "Like Crazy" made history on the Hot 100.',
  },
  {
    id: 'v',
    name: 'V',
    role: 'Vocalist',
    slug: 'v',
    accent: 'oklch(0.6 0.16 280)',
    bio: 'Kim Taehyung. Baritone vocalist behind the jazzy, cinematic solo album "Layover".',
  },
  {
    id: 'jungkook',
    name: 'Jung Kook',
    role: 'Main Vocalist',
    slug: 'jung-kook',
    accent: 'oklch(0.64 0.2 20)',
    bio: 'Jeon Jungkook. Golden maknae; "Seven" and "GOLDEN" turned him into a global soloist.',
  },
]

export const VIDEOS: Video[] = [
  // BTS — Group
  { id: 'gdZLi9oWNZg', title: 'Dynamite', artistId: 'bts', era: 'BE', year: 2020 },
  { id: 'WMweEpGlu_U', title: 'Butter', artistId: 'bts', era: 'Butter', year: 2021 },
  { id: 'CuklIb9d3fI', title: 'Permission to Dance', artistId: 'bts', era: 'Butter', year: 2021 },
  { id: '-5q5mZbe3V8', title: 'Life Goes On', artistId: 'bts', era: 'BE', year: 2020 },
  { id: 'XsX3ATc3FbA', title: 'Boy With Luv (feat. Halsey)', artistId: 'bts', era: 'Persona', year: 2019 },
  { id: 'MBdVXkSdhwU', title: 'DNA', artistId: 'bts', era: 'Love Yourself 承', year: 2017 },
  { id: 'pBuZEGYXA6E', title: 'IDOL', artistId: 'bts', era: 'Answer', year: 2018 },
  { id: '7C2z4GqqS5E', title: 'FAKE LOVE', artistId: 'bts', era: 'Tear', year: 2018 },
  { id: 'kTlv5_Bs8aw', title: 'MIC Drop (Steve Aoki Remix)', artistId: 'bts', era: 'Her', year: 2017 },
  { id: 'hmE9f-TEutc', title: 'Blood Sweat & Tears', artistId: 'bts', era: 'Wings', year: 2016 },
  { id: 'xEeFrLSkMm8', title: 'Spring Day', artistId: 'bts', era: 'You Never Walk Alone', year: 2017 },
  { id: 'GZjt_sA2eso', title: 'Save ME', artistId: 'bts', era: 'The Most Beautiful Moment', year: 2016 },

  // Agust D / SUGA
  { id: 'qGjAWJ2zWWI', title: 'Daechwita', artistId: 'suga', era: 'D-2', year: 2020 },
  { id: 'E-jaU1P4pWc', title: 'Haegeum', artistId: 'suga', era: 'D-DAY', year: 2023 },

  // Jung Kook
  { id: 'QU9c0053UAU', title: 'Seven (feat. Latto)', artistId: 'jungkook', era: 'GOLDEN', year: 2023 },

  // Jimin
  { id: 'lLWEXRAnQd0', title: 'Like Crazy', artistId: 'jimin', era: 'FACE', year: 2023 },
  { id: 'K9J-vw837M8', title: 'Set Me Free Pt.2', artistId: 'jimin', era: 'FACE', year: 2023 },

  // j-hope
  { id: 'GwSwGGkR8bo', title: 'MORE', artistId: 'jhope', era: 'Jack In The Box', year: 2022 },
  { id: 'sD1L-Yb-Zp0', title: 'Chicken Noodle Soup (feat. Becky G)', artistId: 'jhope', era: 'Hope World', year: 2019 },

  // RM
  { id: 'kK4Jj4d2Q3o', title: 'Wild Flower (with youjeen)', artistId: 'rm', era: 'Indigo', year: 2022 },

  // V
  { id: 'x_Mgt_KdEZk', title: 'Slow Dancing', artistId: 'v', era: 'Layover', year: 2023 },

  // Jin
  { id: 'lZG_L7l2H6M', title: 'The Astronaut', artistId: 'jin', era: 'The Astronaut', year: 2022 },
]

export function thumbUrl(videoId: string, quality: 'hq' | 'max' = 'hq') {
  const file = quality === 'max' ? 'maxresdefault' : 'hqdefault'
  return `https://i.ytimg.com/vi/${videoId}/${file}.jpg`
}

export function getArtist(id: ArtistId): Artist {
  return ARTISTS.find((a) => a.id === id) ?? ARTISTS[0]
}

export function getArtistBySlug(slug: string): Artist | undefined {
  return ARTISTS.find((a) => a.slug === slug)
}

export function getVideo(id: string): Video | undefined {
  return VIDEOS.find((v) => v.id === id)
}

// Allow-list check: only these videoIds are ever tracked.
export const TRACKED_IDS = new Set(VIDEOS.map((v) => v.id))
