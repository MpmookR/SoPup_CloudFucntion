export interface ChatMessage {
  id: string;
  matchId: string;
  senderId: string;
  recipientId: string;
  message: string;
  createdAt: Date;
}
