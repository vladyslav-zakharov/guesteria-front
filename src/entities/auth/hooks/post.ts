import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { QueryKeys } from 'shared/constants/query-keys';

import { signIn, signOut, signUp } from '../api/post';
import { ISignIn, ISignUp } from '../types/payloads';

// The next account on this device must never see the previous one's trips or chats (the
// chat cache also holds the daily AI allowance), so they leave the cache instead of being
// refetched. The keys carry no user id, so a session that ended elsewhere (another tab,
// an expired cookie) would otherwise hand its cache to whoever signs in next.
const resetAccountData = (queryClient: QueryClient) => {
  queryClient.removeQueries({ queryKey: [QueryKeys.GET_BOOKINGS] });
  queryClient.removeQueries({ queryKey: [QueryKeys.GET_MESSAGES] });

  return queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_AUTH] });
};

// Exposed as factories, like the query options, so the cache effect is testable without
// rendering the hooks.
export const signUpMutationOptions = (queryClient: QueryClient) => ({
  mutationFn: (payload: ISignUp) => signUp(payload),
  onSuccess: () => resetAccountData(queryClient),
});

export const signInMutationOptions = (queryClient: QueryClient) => ({
  mutationFn: (payload: ISignIn) => signIn(payload),
  onSuccess: () => resetAccountData(queryClient),
});

export const signOutMutationOptions = (queryClient: QueryClient) => ({
  mutationFn: () => signOut(),
  onSuccess: () => resetAccountData(queryClient),
});

export const useSignUp = () => {
  const queryClient = useQueryClient();

  return useMutation(signUpMutationOptions(queryClient));
};

export const useSignIn = () => {
  const queryClient = useQueryClient();

  return useMutation(signInMutationOptions(queryClient));
};

export const useSignOut = () => {
  const queryClient = useQueryClient();

  return useMutation(signOutMutationOptions(queryClient));
};
