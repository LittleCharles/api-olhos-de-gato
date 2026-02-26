export interface SendMailData {
  to: string;
  subject: string;
  html: string;
}

export interface IMailProvider {
  send(data: SendMailData): Promise<void>;
}
