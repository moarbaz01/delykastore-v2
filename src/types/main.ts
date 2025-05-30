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
