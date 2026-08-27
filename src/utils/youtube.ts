import type { PageMediaType } from '@/types/pageMedia';

export function getYoutubeVideoId(url: string | undefined | null): string | null {
  if (!url) return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    const host = parsed.hostname.replace(/^www\./, '').toLowerCase();
    let videoId = '';

    const isYoutubeHost =
      host === 'youtube.com' ||
      host === 'm.youtube.com' ||
      host === 'music.youtube.com' ||
      host === 'youtube-nocookie.com';

    if (isYoutubeHost) {
      if (parsed.pathname === '/watch' || parsed.pathname === '/watch/') {
        videoId = parsed.searchParams.get('v') ?? '';
      } else if (parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/embed/')[1] ?? '';
      } else if (parsed.pathname.startsWith('/shorts/')) {
        videoId = parsed.pathname.split('/shorts/')[1] ?? '';
      } else if (parsed.pathname.startsWith('/live/')) {
        videoId = parsed.pathname.split('/live/')[1] ?? '';
      } else {
        videoId = parsed.searchParams.get('v') ?? '';
      }
    } else if (host === 'youtu.be') {
      videoId = parsed.pathname.replace(/^\//, '');
    }

    videoId = videoId.split('/')[0].split('?')[0].split('&')[0];
    return videoId || null;
  } catch {
    return null;
  }
}

export function toYoutubeEmbedUrl(
  url: string | undefined | null,
  options?: {
    autoplay?: boolean;
    loop?: boolean;
    mute?: boolean;
  }
): string | null {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return null;

  const embedUrl = new URL(`https://www.youtube.com/embed/${videoId}`);
  embedUrl.searchParams.set('rel', '0');
  embedUrl.searchParams.set('modestbranding', '1');
  embedUrl.searchParams.set('playsinline', '1');

  const autoplay = options?.autoplay === true;
  const loop = options?.loop === true;
  const mute = options?.mute === true;

  if (autoplay) embedUrl.searchParams.set('autoplay', '1');
  if (mute) embedUrl.searchParams.set('mute', '1');
  if (loop) {
    embedUrl.searchParams.set('loop', '1');
    embedUrl.searchParams.set('playlist', videoId);
  }

  return embedUrl.toString();
}

export function getYoutubeThumbnailUrl(
  url: string | undefined | null
): string | null {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

export function resolvePageMediaType(
  mediaType?: string | null,
  url?: string | null
): PageMediaType {
  // 유튜브 URL은 API가 IMAGE로 내려줘도 영상으로 처리해야 함
  // (next/image가 watch 페이지를 이미지로 가져와 ERR_BLOCKED_BY_ORB가 남)
  if (getYoutubeVideoId(url)) return 'VIDEO_LINK';

  const normalized = (mediaType ?? '').trim().toUpperCase();
  if (normalized === 'VIDEO_LINK') return 'VIDEO_LINK';
  return 'IMAGE';
}

export function isVideoLinkMedia(
  mediaType?: string | null,
  url?: string | null
): boolean {
  return resolvePageMediaType(mediaType, url) === 'VIDEO_LINK';
}

export function isHttpUrl(url: string | undefined | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(
      /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`
    );
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function isAddableVideoLink(url: string | undefined | null): boolean {
  const trimmed = url?.trim();
  if (!trimmed) return false;
  return Boolean(getYoutubeVideoId(trimmed)) || isHttpUrl(trimmed);
}
