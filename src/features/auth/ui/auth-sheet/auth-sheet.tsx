'use client';

import { useRouter } from 'next/navigation';

import { restoreFocus } from 'shared/lib/focus';
import { useAuthSheetStore } from 'shared/store/auth-sheet';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from 'shared/ui/shadcn/drawer';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from 'shared/ui/shadcn/tabs';

import { SignInForm } from '../sign-in-form/sign-in-form';
import { SignUpForm } from '../sign-up-form/sign-up-form';

export const AuthSheet = () => {
  const router = useRouter();
  const isOpen = useAuthSheetStore(state => state.isOpen);
  const redirectTo = useAuthSheetStore(state => state.redirectTo);
  const close = useAuthSheetStore(state => state.close);
  const returnFocusTo = useAuthSheetStore(state => state.returnFocusTo);

  const handleSuccess = () => {
    close();

    if (redirectTo) {
      router.push(redirectTo);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      close();
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerContent
        className="data-[vaul-drawer-direction=bottom]:max-h-[92dvh]"
        onCloseAutoFocus={event =>
          restoreFocus({ event, target: returnFocusTo })
        }
      >
        <div className="mx-auto flex w-full max-w-md flex-col overflow-y-auto pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <DrawerHeader>
            <DrawerTitle className="text-xl">Welcome to StayHub</DrawerTitle>
            <DrawerDescription>
              Sign in to book a stay and see your trips.
            </DrawerDescription>
          </DrawerHeader>
          <Tabs defaultValue="sign-in" className="gap-4 px-4">
            <TabsList className="w-full group-data-[orientation=horizontal]/tabs:h-auto">
              <TabsTrigger value="sign-in" className="min-h-11">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="sign-up" className="min-h-11">
                Create account
              </TabsTrigger>
            </TabsList>
            <TabsContent value="sign-in">
              <SignInForm onSuccess={handleSuccess} />
            </TabsContent>
            <TabsContent value="sign-up">
              <SignUpForm onSuccess={handleSuccess} />
            </TabsContent>
          </Tabs>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
