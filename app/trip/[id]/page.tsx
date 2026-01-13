"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Trip, Item, ItemType } from "../../types";
import {
  loadTrips,
  getItemsForTrip,
  addItem,
  deleteItem,
  updateTrip,
} from "../../utils/storage";

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [trip, setTrip] = useState<Trip | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState<{
    type: ItemType;
    title: string;
    datetime?: string;
    link?: string;
    notes?: string;
  }>({
    type: "note",
    title: "",
    datetime: "",
    link: "",
    notes: "",
  });

  useEffect(() => {
    const trips = loadTrips();
    const foundTrip = trips.find((t) => t.id === tripId);
    if (!foundTrip) {
      router.push("/");
      return;
    }
    setTrip(foundTrip);
    const tripItems = getItemsForTrip(tripId);
    setItems(tripItems);
  }, [tripId, router]);

  const handleAddItem = () => {
    if (!formData.title.trim()) {
      alert("Please enter a title");
      return;
    }

    const newItem: Item = {
      id: Date.now().toString(),
      tripId: tripId,
      type: formData.type,
      title: formData.title,
      datetime: formData.datetime || undefined,
      link: formData.link || undefined,
      notes: formData.notes || undefined,
    };

    addItem(newItem);
    setItems([...items, newItem]);
    setFormData({
      type: "note",
      title: "",
      datetime: "",
      link: "",
      notes: "",
    });
    setShowAddForm(false);
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      deleteItem(itemId);
      setItems(items.filter((item) => item.id !== itemId));
    }
  };

  const handleArchiveTrip = () => {
    if (!trip) return;
    const updatedTrip = { ...trip, archived: !trip.archived };
    updateTrip(updatedTrip);
    setTrip(updatedTrip);
  };

  const getItemIcon = (type: ItemType) => {
    switch (type) {
      case "flight":
        return "✈️";
      case "hotel":
        return "🏨";
      case "place":
        return "📍";
      case "event":
        return "🎉";
      case "note":
        return "📝";
      default:
        return "📌";
    }
  };

  const getTypeLabel = (type: ItemType): string => {
    switch (type) {
      case "flight":
        return "Flights";
      case "hotel":
        return "Hotels";
      case "place":
        return "Places";
      case "event":
        return "Events";
      case "note":
        return "Notes";
      default:
        return "Other";
    }
  };

  // Group items by type
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {} as Record<ItemType, Item[]>);

  // Sort items within each group
  const itemTypes: ItemType[] = ["flight", "hotel", "place", "event", "note"];
  itemTypes.forEach((type) => {
    if (groupedItems[type]) {
      groupedItems[type].sort((a, b) => {
        if (a.datetime && b.datetime) {
          return a.datetime.localeCompare(b.datetime);
        }
        if (a.datetime) return -1;
        if (b.datetime) return 1;
        return a.title.localeCompare(b.title);
      });
    }
  });

  if (!trip) {
    return (
      <main className="min-h-screen bg-gray-50 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          ← Back to Trips
        </Link>

        <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{trip.name}</h1>
              <p className="text-xl text-gray-600 mb-2">{trip.location}</p>
              <p className="text-gray-500">
                {new Date(trip.startDate).toLocaleDateString()} -{" "}
                {new Date(trip.endDate).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={handleArchiveTrip}
              className={`px-4 py-2 text-sm rounded-lg ${
                trip.archived
                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {trip.archived ? "Unarchive" : "Archive"}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Items</h2>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {showAddForm ? "Cancel" : "+ Add Item"}
          </button>
        </div>

        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                Add New Item
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as ItemType })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="flight">Flight</option>
                    <option value="hotel">Hotel</option>
                    <option value="place">Place</option>
                    <option value="event">Event</option>
                    <option value="note">Note</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.datetime}
                    onChange={(e) =>
                      setFormData({ ...formData, datetime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link
                  </label>
                  <input
                    type="url"
                    value={formData.link}
                    onChange={(e) =>
                      setFormData({ ...formData, link: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddItem}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Item
                </button>
              </div>
            </div>
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-2">No items yet.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-blue-600 hover:text-blue-700 text-sm mt-2"
            >
              Add your first item
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {itemTypes.map((type) => {
              const typeItems = groupedItems[type];
              if (!typeItems || typeItems.length === 0) return null;

              return (
                <div key={type}>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <span>{getItemIcon(type)}</span>
                    {getTypeLabel(type)}
                  </h3>
                  <div className="space-y-4">
                    {typeItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                              {item.title}
                            </h3>
                            {item.datetime && (
                              <p className="text-sm text-gray-600 mb-2">
                                {new Date(item.datetime).toLocaleString()}
                              </p>
                            )}
                            {item.link && (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700 text-sm break-all underline"
                              >
                                {item.link}
                              </a>
                            )}
                            {item.notes && (
                              <p className="text-gray-600 mt-2 whitespace-pre-wrap">
                                {item.notes}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="ml-4 px-3 py-1 text-red-600 hover:bg-red-50 rounded text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
