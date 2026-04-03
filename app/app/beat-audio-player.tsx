"use client";

import { useEffect, useRef } from "react";

const ACTIVE_BEAT_EVENT = "portfolio:beat-play";

type BeatAudioPlayerProps = {
  src: string;
  title: string;
};

export function BeatAudioPlayer({ src, title }: BeatAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playerIdRef = useRef(`beat-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    const handleExternalPlay = (event: Event) => {
      const customEvent = event as CustomEvent<string>;

      if (customEvent.detail !== playerIdRef.current) {
        audioRef.current?.pause();
      }
    };

    window.addEventListener(ACTIVE_BEAT_EVENT, handleExternalPlay as EventListener);

    return () => {
      window.removeEventListener(ACTIVE_BEAT_EVENT, handleExternalPlay as EventListener);
    };
  }, []);

  return (
    <audio
      ref={audioRef}
      controls
      className="mt-1"
      onPlay={() => {
        window.dispatchEvent(new CustomEvent(ACTIVE_BEAT_EVENT, { detail: playerIdRef.current }));
      }}
    >
      <source src={src} type="audio/mpeg" />
      {title}
    </audio>
  );
}
