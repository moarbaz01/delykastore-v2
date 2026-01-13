export interface GameOrder {
  _id?: string;
  costId: string;
  region: string;
  transactionId: string;
  gameCredentials: {
    userId: string;
    zoneId: string;
    game: string;
  };
}

export interface Gift {
  _id: string;
  productId: {
    _id: string;
    name: string;
  };
  bannerText?: string;
  wageringLevels?: Array<{
    level: number;
    wagering: number;
    costIds: string[];
  }>;
  startDate?: string;
  endDate?: string;

  features?: Array<{
    title: string;
    value: string;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGiftData {
  _id: string;
  productId: string;
  bannerText?: string;
  wageringLevels?: Array<{
    level: number;
    wagering: number;
    costIds: string[];
  }>;
  startDate?: string;
  endDate?: string;

  features?: Array<{
    title: string;
    value: string;
  }>;
  isActive: boolean;
}

export type UpdateGiftData = Partial<CreateGiftData>;
