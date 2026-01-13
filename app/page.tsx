"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trip } from "./types";
import { loadTrips, updateTrip, addTrip, getItemsForTrip } from "./utils/storage";
import { formatCountdown, formatDateRange, formatPastTime, getDaysUntil, getDaysSince } from "./utils/date";

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const loadedTrips = loadTrips();
    setTrips(loadedTrips);
  }, []);

  const handleCreateTrip = () => {
    if (!formData.name || !formData.location || !formData.startDate || !formData.endDate) {
      alert("Please fill in all fields");
      return;
    }

    const newTrip: Trip = {
      id: Date.now().toString(),
      name: formData.name,
      location: formData.location,
      startDate: formData.startDate,
      endDate: formData.endDate,
      archived: false,
    };

    addTrip(newTrip);
    setTrips([...trips, newTrip]);
    
    setFormData({ name: "", location: "", startDate: "", endDate: "" });
    setShowModal(false);
  };

  const handleArchive = (trip: Trip, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedTrip = { ...trip, archived: !trip.archived };
    updateTrip(updatedTrip);
    const updatedTrips = trips.map(t => t.id === trip.id ? updatedTrip : t);
    setTrips(updatedTrips);
  };

  const today = new Date().toISOString().split("T")[0];
  
  // Filter by tab: Past = endDate < today OR archived, Upcoming = endDate >= today AND not archived
  const filteredByTab = trips.filter(trip => {
    const isPast = trip.endDate < today || trip.archived;
    return activeTab === "past" ? isPast : !isPast;
  });

  // Filter by search query
  const filteredTrips = filteredByTab.filter(trip => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      trip.name.toLowerCase().includes(query) ||
      trip.location.toLowerCase().includes(query)
    );
  });

  const sortedTrips = [...filteredTrips].sort((a, b) => 
    activeTab === "past" 
      ? b.startDate.localeCompare(a.startDate) // Past: newest first
      : a.startDate.localeCompare(b.startDate) // Upcoming: oldest first
  );

  return (
    <main className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-900">TripBinder</h1>

        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("upcoming")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "upcoming"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveTab("past")}
                className={`px-4 py-2 font-medium ${
                  activeTab === "past"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Past
              </button>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              + New Trip
            </button>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search trips by name or location..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {sortedTrips.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500 mb-2">
              {searchQuery.trim() 
                ? `No trips found matching "${searchQuery}"`
                : `No ${activeTab === "upcoming" ? "upcoming" : "past"} trips yet.`}
            </p>
            {activeTab === "upcoming" && !searchQuery.trim() && (
              <button
                onClick={() => setShowModal(true)}
                className="text-blue-600 hover:text-blue-700 text-sm mt-2"
              >
                Create your first trip
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {sortedTrips.map((trip) => {
              const itemCount = getItemsForTrip(trip.id).length;
              const daysUntil = activeTab === "upcoming" ? getDaysUntil(trip.startDate) : null;
              const daysSince = activeTab === "past" ? getDaysSince(trip.endDate) : null;
              const countdown = daysUntil !== null ? formatCountdown(daysUntil) : null;
              const pastTime = daysSince !== null ? formatPastTime(daysSince) : null;
              
              return (
                <Link
                  key={trip.id}
                  href={`/trip/${trip.id}`}
                  className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {trip.name}
                      </h2>
                      <p className="text-gray-600 mb-2">{trip.location}</p>
                      <p className="text-sm text-gray-500 mb-1">
                        {formatDateRange(trip.startDate, trip.endDate)}
                      </p>
                      {countdown && (
                        <p className="text-sm text-blue-600 font-medium mb-1">
                          {countdown}
                        </p>
                      )}
                      {pastTime && (
                        <p className="text-sm text-gray-500 mb-1">
                          {pastTime}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">
                        {itemCount === 0 ? "No items" : `${itemCount} ${itemCount === 1 ? "item" : "items"}`}
                      </p>
                    </div>
                    <button
                      onClick={(e) => handleArchive(trip, e)}
                      className={`ml-4 px-3 py-1 text-xs rounded ${
                        trip.archived
                          ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {trip.archived ? "Unarchive" : "Archive"}
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4 text-gray-900">New Trip</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Trip Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Summer Vacation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Paris, France"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTrip}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
