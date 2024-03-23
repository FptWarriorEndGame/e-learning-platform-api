import { IBaseSchema } from "./base.type";
type SocialMediaKey ='website'| 'facebook' | 'twitter' | 'instagram' | 'linkedin' | 'youtube'; 
export interface IUser extends IBaseSchema {
  code: string;
  providerId: string;
  name: string;
  avatar: string;
  username?: string;
  email?: string;
  phone?: string;
  address?: string;
  password?: string;
  role?: string;
  payment: string;
  headline?: string;
  biography?: string;
  socials: {[key in SocialMediaKey]: string};
  language: string;
  resetToken?: string;
  loginToken?: string;
  showProfile: boolean;
  showCourses: boolean;
  status?: string; 
  lastLogin?: Date;
  resetTokenExpiration?: Date;
  loginTokenExpiration?: Date;
}
