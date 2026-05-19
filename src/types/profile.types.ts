export type IProfile = {
  userId: string;
  username: string;
  bio?: string;
  location?: string;
  socials?: ISocials;
};

export type ISocials = Record<string, string>;

export type IStoreRefreshToken = {
  userId: string;
  refreshToken: string;
  deviceName?: string;
  deviceType?: string;
  ipAddress?: string;
};
