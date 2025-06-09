import fscreen from 'fscreen';

import { MWMediaType } from '@/backend/metadata/types/mw';
import {
  DisplayCaption,
  DisplayInterface,
  DisplayInterfaceEvents,
  DisplayMeta,
} from '@/components/player/display/displayInterface';
import {
  convertSubtitlesToObjectUrl,
  convertSubtitlesToVtt,
} from '@/components/player/utils/captions';
import { LoadableSource } from '@/stores/player/utils/qualities';
import { processCdnLink } from '@/utils/cdn';
import {
  canChangeVolume,
  canFullscreen,
  canFullscreenAnyElement,
} from '@/utils/detectFeatures';
import { makeEmitter } from '@/utils/events';

export interface ChromeCastDisplayInterfaceOptions {
  controller: cast.framework.RemotePlayerController;
  player: cast.framework.RemotePlayer;
  instance: cast.framework.CastContext;
}

export function makeChromecastDisplayInterface(
  ops: ChromeCastDisplayInterfaceOptions,
): DisplayInterface {
  const { emit, on, off } = makeEmitter<DisplayInterfaceEvents>();
  let isPaused = false;
  let playbackRate = 1;
  let source: LoadableSource | null = null;
  let videoElement: HTMLVideoElement | null = null;
  let containerElement: HTMLElement | null = null;
  let isFullscreen = false;
  let isPausedBeforeSeeking = false;
  let isSeeking = false;
  let startAt = 0;
  let meta: DisplayMeta = {
    title: '',
    type: MWMediaType.MOVIE,
  };
  let caption: DisplayCaption | null = null;
  let captionUrl: string | null = null;

  function listenForEvents() {
    const listen = async (e: cast.framework.RemotePlayerChangedEvent) => {
      switch (e.field) {
        case 'volumeLevel':
          if (await canChangeVolume()) emit('volumechange', e.value);
          break;
        case 'currentTime':
          emit('time', e.value);
          break;
        case 'duration':
          emit('duration', e.value ?? 0);
          break;
        case 'mediaInfo':
          if (e.value) emit('duration', e.value.duration ?? 0);
          break;
        case 'playerState':
          emit('loading', e.value === 'BUFFERING');
          if (e.value === 'PLAYING') emit('play', undefined);
          else if (e.value === 'PAUSED') emit('pause', undefined);
          isPaused = e.value === 'PAUSED';
          break;
        case 'isMuted':
          emit('volumechange', e.value ? 1 : 0);
          break;
        case 'displayStatus':
        case 'canSeek':
        case 'title':
        case 'isPaused':
        case 'canPause':
        case 'isMediaLoaded':
        case 'statusText':
        case 'isConnected':
        case 'displayName':
        case 'canControlVolume':
        case 'savedPlayerState':
          break;
        default:
          break;
      }
    };
    ops.controller?.addEventListener(
      cast.framework.RemotePlayerEventType.ANY_CHANGE,
      listen,
    );
    return () => {
      ops.controller?.removeEventListener(
        cast.framework.RemotePlayerEventType.ANY_CHANGE,
        listen,
      );
    };
  }

  function setupCaptions(): chrome.cast.media.Track[] | null {
    if (!caption || !caption.srtData) return null;

    try {
      // Convert SRT to VTT and create an object URL
      captionUrl = convertSubtitlesToObjectUrl(caption.srtData);

      // Create a text track for Chromecast
      const track = new chrome.cast.media.Track(
        1, // trackId
        chrome.cast.media.TrackType.TEXT,
      );

      track.trackContentId = captionUrl;
      track.trackContentType = 'text/vtt';
      track.subtype = chrome.cast.media.TextTrackType.SUBTITLES;
      track.name = caption.language;
      track.language = caption.language;

      return [track];
    } catch (error) {
      console.error('Error setting up captions for Chromecast:', error);
      return null;
    }
  }

  function setupSource() {
    if (!source) {
      ops.controller?.stop();
      return;
    }

    // Determine correct content type
    let contentType = 'video/mp4';
    if (source.type === 'hls') {
      // Use MIME type that's best supported by Chromecast for HLS
      contentType = 'application/vnd.apple.mpegurl';
    }

    const metaData = new chrome.cast.media.GenericMediaMetadata();
    metaData.title = meta.title;

    // Create media info with proper content ID and content type
    const mediaInfo = new chrome.cast.media.MediaInfo(
      processCdnLink(source.url), // Use processed URL as the content ID
      contentType,
    );

    // The contentUrl property doesn't exist on the type, use properly typed properties instead
    mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;
    mediaInfo.metadata = metaData;
    mediaInfo.customData = {
      playbackRate,
    };

    // Set up captions if available
    const tracks = setupCaptions();
    if (tracks && tracks.length > 0) {
      mediaInfo.tracks = tracks;
    }

    const request = new chrome.cast.media.LoadRequest(mediaInfo);
    request.autoplay = true;
    request.currentTime = startAt;

    if (source.type === 'hls') {
      const staticMedia = chrome.cast.media as any;
      // Set HLS-specific properties to improve reliability
      if (staticMedia.HlsSegmentFormat) {
        const media = request.media as any;
        media.hlsSegmentFormat = staticMedia.HlsSegmentFormat.FMP4;
        media.hlsVideoSegmentFormat = staticMedia.HlsVideoSegmentFormat.FMP4;
        // Set additional properties to improve HLS compatibility
        media.streamType = chrome.cast.media.StreamType.BUFFERED;
        media.hlsPreload = true;
      }
    }

    // Load the media on the Chromecast session
    const session = ops.instance.getCurrentSession();
    if (session) {
      session.loadMedia(request).catch((error) => {
        console.error('Error loading media on Chromecast:', error);
        emit('error', {
          message: `Chromecast error: ${error.message || 'Failed to load media'}`,
          errorName: 'ChromecastLoadError',
          type: 'global',
        });
      });
    }
  }

  function setSource() {
    if (!videoElement || !source) return;
    setupSource();
  }

  function destroyVideoElement() {
    if (videoElement) videoElement = null;
  }

  function fullscreenChange() {
    isFullscreen =
      !!document.fullscreenElement || // other browsers
      !!(document as any).webkitFullscreenElement; // safari
    emit('fullscreen', isFullscreen);
    if (!isFullscreen) emit('needstrack', false);
  }
  fscreen.addEventListener('fullscreenchange', fullscreenChange);

  // start listening immediately
  const stopListening = listenForEvents();

  return {
    on,
    off,
    getType() {
      return 'casting';
    },
    destroy: () => {
      stopListening();
      destroyVideoElement();
      fscreen.removeEventListener('fullscreenchange', fullscreenChange);
      // Clean up caption URL object if it exists
      if (captionUrl) {
        try {
          URL.revokeObjectURL(captionUrl);
        } catch (e) {
          // Ignore errors during cleanup
        }
      }
    },
    load(loadOps) {
      source = loadOps.source;
      emit('loading', true);
      startAt = loadOps.startAt;
      setSource();
    },
    changeQuality() {
      // cant control qualities
    },
    setCaption(newCaption) {
      // Clean up previous caption URL if it exists
      if (captionUrl) {
        try {
          URL.revokeObjectURL(captionUrl);
          captionUrl = null;
        } catch (e) {
          // Ignore errors during cleanup
        }
      }

      caption = newCaption;
      setSource();
    },

    processVideoElement(video) {
      destroyVideoElement();
      videoElement = video;
      setSource();
    },
    processContainerElement(container) {
      containerElement = container;
    },
    setMeta(data) {
      meta = data;
      setSource();
    },

    pause() {
      if (!isPaused) {
        ops.controller.playOrPause();
        isPaused = true;
      }
    },
    play() {
      if (isPaused) {
        ops.controller.playOrPause();
        isPaused = false;
      }
    },
    setSeeking(active) {
      if (active === isSeeking) return;
      isSeeking = active;

      // if it was playing when starting to seek, play again
      if (!active) {
        if (!isPausedBeforeSeeking) this.play();
        return;
      }

      isPausedBeforeSeeking = isPaused ?? true;
      this.pause();
    },
    setTime(t) {
      if (!videoElement) return;
      // clamp time between 0 and max duration
      let time = Math.min(t, ops.player.duration);
      time = Math.max(0, time);

      if (Number.isNaN(time)) return;
      emit('time', time);
      ops.player.currentTime = time;
      ops.controller.seek();
    },
    async setVolume(v) {
      // clamp time between 0 and 1
      let volume = Math.min(v, 1);
      volume = Math.max(0, volume);

      // update state
      const isChangeable = await canChangeVolume();
      if (isChangeable) {
        ops.player.volumeLevel = volume;
        ops.controller.setVolumeLevel();
        emit('volumechange', volume);
      } else {
        // For browsers where it can't be changed
        emit('volumechange', volume === 0 ? 0 : 1);
      }
    },
    toggleFullscreen() {
      if (isFullscreen) {
        isFullscreen = false;
        emit('fullscreen', isFullscreen);
        emit('needstrack', false);
        if (!fscreen.fullscreenElement) return;
        fscreen.exitFullscreen();
        return;
      }

      // enter fullscreen
      isFullscreen = true;
      emit('fullscreen', isFullscreen);
      if (!canFullscreen() || fscreen.fullscreenElement) return;
      if (canFullscreenAnyElement()) {
        if (containerElement) fscreen.requestFullscreen(containerElement);
      }
    },
    togglePictureInPicture() {
      // Can't PIP while Chromecasting
    },
    startAirplay() {
      // cant airplay while chromecasting
    },
    setPlaybackRate(rate) {
      playbackRate = rate;
      setSource();
    },
    getCaptionList() {
      return [];
    },
    getSubtitleTracks() {
      return [];
    },
    async setSubtitlePreference() {
      return Promise.resolve();
    },
    changeAudioTrack() {
      // cant change audio tracks
    },
  };
}
