import { Check } from 'lucide-react';

import { Button } from 'shared/ui/shadcn/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from 'shared/ui/shadcn/drawer';

type Props = {
  facilities: string[];
  hotelName: string;
};

const PREVIEW_COUNT = 8;

const FacilityList = ({ facilities }: { facilities: string[] }) => (
  <ul className="grid grid-cols-1 gap-x-4 gap-y-2 text-sm min-[360px]:grid-cols-2">
    {facilities.map(facility => (
      <li key={facility} className="flex min-w-0 items-start gap-2">
        <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-success" />
        <span className="min-w-0 wrap-break-word">{facility}</span>
      </li>
    ))}
  </ul>
);

export const HotelFacilities = ({ facilities, hotelName }: Props) => {
  const uniqueFacilities = Array.from(new Set(facilities));

  if (uniqueFacilities.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="hotel-facilities" className="flex flex-col gap-3">
      <h2 id="hotel-facilities" className="text-lg font-semibold">
        Facilities
      </h2>
      <FacilityList facilities={uniqueFacilities.slice(0, PREVIEW_COUNT)} />
      {uniqueFacilities.length > PREVIEW_COUNT && (
        <Drawer>
          <DrawerTrigger asChild>
            <Button type="button" variant="outline" className="h-11 w-full">
              {`Show all ${uniqueFacilities.length} facilities`}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="data-[vaul-drawer-direction=bottom]:max-h-[85dvh]">
            <div className="mx-auto flex min-h-0 w-full max-w-md flex-col">
              <DrawerHeader>
                <DrawerTitle className="text-xl">Facilities</DrawerTitle>
                <DrawerDescription>{hotelName}</DrawerDescription>
              </DrawerHeader>
              <div className="overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
                <FacilityList facilities={uniqueFacilities} />
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      )}
    </section>
  );
};
