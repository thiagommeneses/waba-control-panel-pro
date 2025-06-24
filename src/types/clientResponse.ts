
export interface ClientResponse {
  id: string;
  phoneNumber: string;
  messageType: 'text' | 'image' | 'button_reply' | 'interactive';
  content?: string;
  imageUrl?: string;
  imageCaption?: string;
  buttonPayload?: string;
  wamid?: string;
  timestampReceived: Date;
  contextWamid?: string;
  clientName?: string;
  metadata?: Record<string, any>;
}
