export function getYouTubeThumbnail(url: string | null | undefined): string | null {
  if (!url) return null
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? `https://i3.ytimg.com/vi/${match[1]}/maxresdefault.jpg` : null
}

export function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null
  const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}
