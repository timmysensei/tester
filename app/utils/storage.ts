import { Trip, Item } from '../types';

const TRIPS_KEY = 'tripbinder_trips';
const ITEMS_KEY = 'tripbinder_items';

export function loadTrips(): Trip[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(TRIPS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveTrips(trips: Trip[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

export function loadItems(): Item[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(ITEMS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveItems(items: Item[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ITEMS_KEY, JSON.stringify(items));
}

export function getItemsForTrip(tripId: string): Item[] {
  const items = loadItems();
  return items.filter(item => item.tripId === tripId);
}

export function addTrip(trip: Trip): void {
  const trips = loadTrips();
  trips.push(trip);
  saveTrips(trips);
}

export function updateTrip(updatedTrip: Trip): void {
  const trips = loadTrips();
  const index = trips.findIndex(t => t.id === updatedTrip.id);
  if (index !== -1) {
    trips[index] = updatedTrip;
    saveTrips(trips);
  }
}

export function addItem(item: Item): void {
  const items = loadItems();
  items.push(item);
  saveItems(items);
}

export function deleteItem(itemId: string): void {
  const items = loadItems();
  const filtered = items.filter(item => item.id !== itemId);
  saveItems(filtered);
}
