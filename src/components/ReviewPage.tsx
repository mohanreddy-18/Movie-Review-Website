import React, { useState, useEffect } from 'react';
import YouTube from 'react-youtube';
import { Star, MessageSquare, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  author: string;
  content: string;
  rating: number;
  created_at: string;
}

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}

interface MovieDetails {
  title: string;
  poster_path: string;
  overview: string;
  vote_average: number;
  release_date: string;
  videos: {
    results: Array<{
      key: string;
      type: string;
    }>;
  };
  credits: {
    cast: Cast[];
  };
}

interface ReviewPageProps {
  movieId: number;
}

export default function ReviewPage({ movieId }: ReviewPageProps) {
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState('');
  const [rating, setRating] = useState(0);
  const [user, setUser] = useState(null);

  const API_KEY = '41ee980e4b5f05f6693fda00eb7c4fd4';

  useEffect(() => {
    // Get the logged-in user
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    // Fetch movie details (videos and cast still come from TMDB)
    const fetchMovieDetails = async () => {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&append_to_response=videos,credits`
      );
      const data = await response.json();
      setMovieDetails(data);
    };

    fetchMovieDetails();
  }, [movieId]);

  useEffect(() => {
    // Fetch only user-submitted reviews from Supabase for this movie
    const fetchReviewsFromSupabase = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('movie_id', movieId);

      if (error) {
        console.error('Error fetching Supabase reviews:', error);
        return;
      }

      // Format reviews to match your expected shape
      const formattedReviews = data.map((row) => ({
        id: row.id.toString(),
        author: row.author || user?.email || 'Anonymous',
        content: row.content,
        rating: row.rating,
        created_at: row.created_at,
      }));
      setReviews(formattedReviews);
    };

    fetchReviewsFromSupabase();
  }, [movieId, user]);

  const trailerVideo = movieDetails?.videos.results.find(
    (video) => video.type === 'Trailer'
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const newReviewObj: Review = {
      id: Date.now().toString(),
      author: user.email,
      content: newReview,
      rating: rating,
      created_at: new Date().toISOString(),
    };

    // Save the new review to Supabase
    const { error } = await supabase
      .from('reviews')
      .insert([
        {
          movie_id: movieId,
          content: newReview,
          rating: rating,
          user_id: user.id,
          author: user.email, // Optionally store the author's email or name
        },
      ]);

    if (error) {
      console.error('Error inserting review:', error);
      alert(`Could not submit review: ${error.message}`);
      return;
    }

    // Append the new review immediately and close the modal
    setReviews((prevReviews) => [...prevReviews, newReviewObj]);
    setShowReviewForm(false);
    setNewReview('');
    setRating(0);
  };

  if (!movieDetails) return <div>Loading...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left Column - Poster and Add Review Button */}
        <div className="flex flex-col items-center space-y-4">
          <img
            src={`https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`}
            alt={movieDetails.title}
            className="w-full max-w-sm rounded-xl shadow-lg object-cover"
          />
          {user && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="w-40 mx-auto flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
            >
              <MessageSquare className="h-5 w-5" />
              <span>Add Review</span>
            </button>
          )}
        </div>

        {/* Right Column - Trailer and Description */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">{movieDetails.title}</h1>
          <div className="flex justify-center">
            {trailerVideo && (
              <YouTube
                videoId={trailerVideo.key}
                opts={{
                  width: '640',
                  height: '360',
                  playerVars: {
                    autoplay: 0,
                  },
                }}
              />
            )}
          </div>
          <div className="mt-4">
            <p className="text-gray-600">{movieDetails.overview}</p>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-lg w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Write a Review</h3>
              <button
                onClick={() => setShowReviewForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-6 w-6 cursor-pointer ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      onClick={() => setRating(star)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Review
                </label>
                <textarea
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cast Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Cast</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movieDetails.credits.cast.slice(0, 12).map((person) => (
            <div key={person.id} className="text-center">
              <img
                src={`https://image.tmdb.org/t/p/w185${person.profile_path}`}
                alt={person.name}
                className="w-full rounded-lg shadow-md mb-2"
              />
              <p className="font-medium text-gray-900">{person.name}</p>
              <p className="text-sm text-gray-500">{person.character}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews Section (Displayed under Cast) */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
        <div className="space-y-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="font-medium">{review.author}</span>
                </div>
                {review.rating && (
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
              <p className="text-gray-600">{review.content}</p>
              <div className="mt-4 text-sm text-gray-500">
                {new Date(review.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
