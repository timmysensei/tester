export type Trip = {
  id: string;
  name: string;
  location: string;
  startDate: string;
  endDate: string;
  archived: boolean;
};

export type ItemType = 'flight' | 'hotel' | 'place' | 'event' | 'note';

export type Item = {
  id: string;
  tripId: string;
  type: ItemType;
  title: string;
  datetime?: string;
  link?: string;
  notes?: string;
};
