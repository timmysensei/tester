"use client";

import { useState } from "react";

export default function Home() {
  const [items, setItems] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim()) {
      setItems([...items, input.trim()]);
      setInput("");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-bold mb-12 text-center">Todo List</h1>
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter an item..."
          />
          <button
            onClick={handleAdd}
            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={index}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded"
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
