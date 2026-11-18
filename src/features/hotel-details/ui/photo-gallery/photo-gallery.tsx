import { useRef, useState } from 'react';

import Image from 'next/image';

import { BedDouble, ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from 'shared/lib/styles';

type Props = {
  photos: string[];
  hotelName: string;
};

const PHOTO_SIZES = '(max-width: 448px) 100vw, 448px';
const NAV_BUTTON_CLASS =
  'absolute top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground shadow-card outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-0';

export const PhotoGallery = ({ photos, hotelName }: Props) => {
  const trackRef = useRef<HTMLUListElement>(null);
  const [current, setCurrent] = useState(0);
  const uniquePhotos = Array.from(new Set(photos));
  const total = uniquePhotos.length;

  if (total === 0) {
    return (
      <div className="flex aspect-4/3 w-full items-center justify-center bg-muted">
        <BedDouble aria-hidden className="size-12 text-muted-foreground" />
      </div>
    );
  }

  const handleScroll = () => {
    const track = trackRef.current;

    if (track && track.clientWidth > 0) {
      setCurrent(Math.round(track.scrollLeft / track.clientWidth));
    }
  };

  const scrollToPhoto = (index: number) => {
    const track = trackRef.current;

    track?.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
  };

  return (
    <section aria-label={`Photos of ${hotelName}`} className="relative">
      <ul
        ref={trackRef}
        onScroll={handleScroll}
        className="flex aspect-4/3 w-full snap-x snap-mandatory [scrollbar-width:none] overflow-x-auto overscroll-x-contain bg-muted [&::-webkit-scrollbar]:hidden"
      >
        {uniquePhotos.map((url, index) => (
          <li key={url} className="relative h-full w-full shrink-0 snap-center">
            <Image
              src={url}
              alt={`${hotelName}, photo ${index + 1} of ${total}`}
              fill
              sizes={PHOTO_SIZES}
              loading={index === 0 ? 'eager' : 'lazy'}
              className="object-cover"
            />
          </li>
        ))}
      </ul>
      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            disabled={current === 0}
            onClick={() => scrollToPhoto(current - 1)}
            className={cn(NAV_BUTTON_CLASS, 'left-3')}
          >
            <ChevronLeft aria-hidden className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            disabled={current >= total - 1}
            onClick={() => scrollToPhoto(current + 1)}
            className={cn(NAV_BUTTON_CLASS, 'right-3')}
          >
            <ChevronRight aria-hidden className="size-5" />
          </button>
        </>
      )}
      <p
        aria-live="polite"
        className="absolute right-3 bottom-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white tabular-nums"
      >
        <span className="sr-only">Photo </span>
        {`${Math.min(current + 1, total)} / ${total}`}
      </p>
    </section>
  );
};
