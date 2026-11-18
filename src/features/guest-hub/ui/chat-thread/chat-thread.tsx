import { useEffect, useRef } from 'react';

import type {
  ChatMessageRole,
  IChatMessage,
} from 'entities/messages/types/responses';
import { cn } from 'shared/lib/styles';
import { Skeleton } from 'shared/ui/shadcn/skeleton';

type Props = {
  hotelName: string | null;
  messages: IChatMessage[];
  pendingQuestion: string | null;
};

const TYPING_DOTS = ['first', 'second', 'third'];
const TYPING_DOT_DELAY_MS = 150;

// Plain text only: replies come from a model and are never parsed as HTML.
const Bubble = ({
  author,
  content,
}: {
  author: ChatMessageRole;
  content: string;
}) => (
  <li
    className={cn(
      'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed wrap-break-word whitespace-pre-line',
      author === 'user'
        ? 'self-end rounded-br-md bg-primary text-primary-foreground'
        : 'self-start rounded-bl-md bg-secondary text-secondary-foreground',
    )}
  >
    <span className="sr-only">
      {author === 'user' ? 'You: ' : 'Concierge: '}
    </span>
    {content}
  </li>
);

const TypingIndicator = () => (
  <li
    role="status"
    className="flex items-center gap-2 self-start rounded-2xl rounded-bl-md bg-secondary px-3.5 py-3 text-secondary-foreground"
  >
    <span aria-hidden className="flex gap-1">
      {TYPING_DOTS.map((key, index) => (
        <span
          key={key}
          style={{ animationDelay: `${index * TYPING_DOT_DELAY_MS}ms` }}
          className="size-1.5 animate-bounce rounded-full bg-current motion-reduce:animate-none"
        />
      ))}
    </span>
    <span className="text-xs">The concierge is typing…</span>
  </li>
);

export const ChatThreadSkeleton = () => (
  <div role="status" className="flex flex-col gap-3 py-4">
    <span className="sr-only">Loading the conversation…</span>
    <Skeleton aria-hidden className="h-14 w-3/4 self-start rounded-2xl" />
    <Skeleton aria-hidden className="h-10 w-1/2 self-end rounded-2xl" />
    <Skeleton aria-hidden className="h-20 w-3/4 self-start rounded-2xl" />
  </div>
);

export const ChatThread = ({ hotelName, messages, pendingQuestion }: Props) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, pendingQuestion]);

  return (
    <div className="flex flex-col gap-3 py-4">
      <p className="max-w-[85%] self-start rounded-2xl rounded-bl-md bg-secondary px-3.5 py-2.5 text-sm leading-relaxed text-secondary-foreground">
        {hotelName
          ? `Hi! I'm your concierge for ${hotelName}. Ask me about check-in, breakfast, parking or anything else about your stay.`
          : "Hi! I'm your concierge. Ask me anything about your stay."}
      </p>
      <ol
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        className="flex flex-col gap-3"
      >
        {messages.map(({ id, role, content }) => (
          <Bubble key={id} author={role} content={content} />
        ))}
        {pendingQuestion !== null && (
          <>
            <Bubble author="user" content={pendingQuestion} />
            <TypingIndicator />
          </>
        )}
      </ol>
      <div ref={endRef} />
    </div>
  );
};
