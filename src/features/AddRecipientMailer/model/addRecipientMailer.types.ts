export interface AddRecipientMailerProps {
  recipients: string[];
  onUpdate: (recipients: string[]) => void;
}
