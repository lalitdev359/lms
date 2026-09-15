import Image from "next/image";
import { getVideoThumbnail } from "@/lib/video";

function PlayButton() {
  return (
    <span className="h-14 w-14 rounded-full bg-white/95 text-bg flex items-center justify-center shadow-lg shadow-black/40 transition-transform group-hover:scale-105">
      <svg viewBox="0 0 24 24" className="h-5 w-5 translate-x-[1px]" fill="currentColor">
        <path d="M8 5.5v13l11-6.5-11-6.5Z" />
      </svg>
    </span>
  );
}

export function LessonVideo({ url }: { url: string }) {
  const thumbnail = getVideoThumbnail(url);

  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group mt-7 relative block aspect-video overflow-hidden rounded-card border border-border bg-surface-2"
    >
      {thumbnail ? (
        <Image
          src={thumbnail}
          alt=""
          fill
          sizes="(min-width: 768px) 700px, 100vw"
          className="object-cover transition-opacity group-hover:opacity-80"
        />
      ) : (
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              "linear-gradient(135deg, hsl(250 45% 16%), hsl(220 40% 10%))",
          }}
        />
      )}
      <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors flex items-center justify-center">
        <PlayButton />
      </div>
      <span className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2 py-1 text-xs text-white backdrop-blur-sm">
        Watch video ↗
      </span>
    </a>
  );
}
