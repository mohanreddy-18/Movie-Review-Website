import React from 'react';
import { Star } from 'lucide-react';

interface MovieCardProps {
  title: string;
  posterPath: string;
  rating: number;
  onReviewClick: () => void;
}

export default function MovieCard({ title, posterPath, rating, onReviewClick }: MovieCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:scale-105">
      <img
        src={`https://image.tmdb.org/t/p/w500${posterPath}`}
        alt={title}
        className="w-full h-96 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Star className="h-5 w-5 text-yellow-400 mr-1" />
            <span className="text-gray-600">{rating.toFixed(1)}</span>
          </div>
          <button
            onClick={onReviewClick}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Reviews
          </button>
        </div>
      </div>
    </div>
  );
}