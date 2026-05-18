export interface ItemDto {
  id: number;
  name: string;
  description: string;
  price: number;
  imageLink?: string | null;
  isAvailable: boolean;
}

export interface UserItemDto {
  id: number;
  userId: number;
  itemId: number;
  itemName: string;
  /** Paid points at purchase (wallet private API may omit) */
  price?: number;
  purchaseDate: string;
}
