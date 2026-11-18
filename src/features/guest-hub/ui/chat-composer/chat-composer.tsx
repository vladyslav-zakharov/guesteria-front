import { zodResolver } from '@hookform/resolvers/zod';
import { SendHorizontal } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';

import { Button } from 'shared/ui/shadcn/button';

import { QUICK_QUESTIONS } from '../../lib/chat-copy';
import { MESSAGE_MAX_LENGTH, messageSchema } from '../../schemas/message';

type Props = {
  disabled: boolean;
  onSend: (content: string) => Promise<unknown>;
};

const TEXTAREA_CLASS =
  'max-h-32 min-h-11 w-full min-w-0 flex-1 resize-none rounded-md border border-input bg-transparent px-3 py-2.5 text-base shadow-xs transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20';

export const ChatComposer = ({ disabled, onSend }: Props) => {
  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: { content: '' },
  });
  const isBlank = !useWatch({ control: form.control, name: 'content' }).trim();

  // The question leaves the box as soon as it is sent and shows in the thread; if sending
  // fails it comes back, so the guest can send it again without retyping.
  const send = async (content: string) => {
    form.reset({ content: '' });

    try {
      await onSend(content);
    } catch {
      if (!form.getValues('content')) {
        form.setValue('content', content);
      }
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <ul
        aria-label="Quick questions"
        className="-mx-4 flex [scrollbar-width:none] gap-2 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden"
      >
        {QUICK_QUESTIONS.map(question => (
          <li key={question} className="shrink-0">
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className="h-11 rounded-full"
              onClick={() => send(question)}
            >
              {question}
            </Button>
          </li>
        ))}
      </ul>
      <form
        noValidate
        aria-label="Ask the concierge"
        onSubmit={form.handleSubmit(({ content }) => send(content))}
        className="flex items-end gap-2"
      >
        <label htmlFor="guest-hub-question" className="sr-only">
          Your question
        </label>
        <textarea
          id="guest-hub-question"
          rows={1}
          maxLength={MESSAGE_MAX_LENGTH}
          placeholder="Ask about your stay…"
          disabled={disabled}
          aria-invalid={Boolean(form.formState.errors.content)}
          className={TEXTAREA_CLASS}
          {...form.register('content')}
        />
        <Button
          type="submit"
          size="icon"
          aria-label="Send"
          disabled={disabled || isBlank}
          className="size-11 shrink-0 rounded-full"
        >
          <SendHorizontal aria-hidden className="size-5" />
        </Button>
      </form>
    </div>
  );
};
