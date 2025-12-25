export type IProfile = {
  userId: string;
  username: string;
  bio?: string;
  location?: string;
  socials?: ISocials;
};

export type ISocials = Record<string, string>;
