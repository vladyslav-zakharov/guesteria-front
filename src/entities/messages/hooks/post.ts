import {
  QueryClient,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { QueryKeys } from 'shared/constants/query-keys';

import { sendMessage } from '../api/post';
import { ISendMessage } from '../types/payloads';
import { IMessagesResponse, ISendMessageResponse } from '../types/responses';
import { messagesQueryOptions } from './get';

// The answer arrives with the request, so the pair is appended to the cached chat instead
// of refetching it. A refetch that lands first may already hold the pair, hence the id check.
export const appendSentMessages =
  ({ userMessage, assistantMessage, remainingToday }: ISendMessageResponse) =>
  (current: IMessagesResponse | undefined): IMessagesResponse | undefined => {
    if (!current) {
      return current;
    }

    const knownIds = new Set(current.messages.map(({ id }) => id));
    const added = [userMessage, assistantMessage].filter(
      ({ id }) => !knownIds.has(id),
    );

    return { messages: [...current.messages, ...added], remainingToday };
  };

// The daily allowance is counted per user, not per trip, so every cached chat shows the
// count from the latest answer.
export const withRemainingToday =
  (remainingToday: number) =>
  (current: IMessagesResponse | undefined): IMessagesResponse | undefined =>
    current && { ...current, remainingToday };

// Exposed as a factory, like the query options, so the cache effect is testable without
// rendering the hook.
export const sendMessageMutationOptions = ({
  queryClient,
  bookingId,
}: {
  queryClient: QueryClient;
  bookingId: string;
}) => ({
  mutationFn: (payload: ISendMessage) => sendMessage({ bookingId, payload }),
  onSuccess: async (response: ISendMessageResponse) => {
    const { queryKey } = messagesQueryOptions(bookingId);

    // A refetch still in flight was sent before this message and would overwrite the
    // appended pair with an older chat.
    await queryClient.cancelQueries({ queryKey });

    queryClient.setQueriesData<IMessagesResponse>(
      { queryKey: [QueryKeys.GET_MESSAGES] },
      withRemainingToday(response.remainingToday),
    );

    if (!queryClient.getQueryData(queryKey)) {
      return queryClient.invalidateQueries({ queryKey });
    }

    queryClient.setQueryData(queryKey, appendSentMessages(response));
  },
  // The back counts an attempt before the model answers, and a proxy timeout can hide an
  // answer the back did save, so after a failure the chats and the allowance are reloaded
  // from the server instead of trusted from the cache.
  onError: () =>
    queryClient.invalidateQueries({ queryKey: [QueryKeys.GET_MESSAGES] }),
});

export const useSendMessage = (bookingId: string) => {
  const queryClient = useQueryClient();

  return useMutation(sendMessageMutationOptions({ queryClient, bookingId }));
};
