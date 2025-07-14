import { SocialProvider } from '../dto/social-login.dto';

export interface SocialUser {
  id: string;
  email?: string;
  firstName: string;
  lastName?: string;
  avatar?: string;
  provider: SocialProvider;
  providerId: string;
}

export interface TelegramUser {
  id: string;
  firstName: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
  authDate: string;
  hash: string;
}

export interface XUser {
  id: string;
  name: string;
  email?: string;
  profileImageUrl?: string;
}

export interface GmailUser {
  id: string;
  email: string;
  verifiedEmail: boolean;
  name: string;
  givenName: string;
  familyName?: string;
  picture?: string;
}
