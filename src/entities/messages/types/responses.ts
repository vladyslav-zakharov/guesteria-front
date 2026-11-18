export type ChatMessageRole = 'user' | 'assistant';

export interface IChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
}

export interface IMessagesResponse {
  messages: IChatMessage[];
  remainingToday: number;
}

export interface ISendMessageResponse {
  userMessage: IChatMessage;
  assistantMessage: IChatMessage;
  remainingToday: number;
}
