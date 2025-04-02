import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Header from './components/Header';
import Footer from './components/Footer';
import MovieCard from './components/MovieCard';
import ReviewPage from './components/ReviewPage';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';

const APILINK = 'https://api.themoviedb.org/3/discover/movie?sort_by=popularity.desc&api_key=41ee980e4b5f05f6693fda00eb7c4fd4&page=1';
const SEARCHAPI = "https://api.themoviedb.org/3/search/movie?&api_key=41ee980e4b5f05f6693fda00eb7c4fd4&query=";

function App() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchMovies = async (url: string) => {
    const response = await fetch(url);
    const data = await response.json();
    setMovies(data.results);
  };

  const handleSearch = (query: string) => {
    if (query) {
      fetchMovies(SEARCHAPI + encodeURIComponent(query));
    } else {
      fetchMovies(APILINK);
    }
  };

  const handleBackToMovies = () => {
    setSelectedMovie(null);
  };

  useEffect(() => {
    fetchMovies(APILINK);
  }, []);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <Header onSearch={handleSearch} user={user} />
        
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/" /> : <SignUp />} />
          <Route path="/" element={
            <main className="flex-grow container mx-auto px-4 py-8">
              {selectedMovie ? (
                <div className="space-y-6">
                  <button
                    onClick={handleBackToMovies}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                  >
                    <span>←</span>
                    <span>Back to Movies</span>
                  </button>
                  <ReviewPage movieId={selectedMovie.id} />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {movies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      title={movie.title}
                      posterPath={movie.poster_path}
                      rating={movie.vote_average}
                      onReviewClick={() => setSelectedMovie(movie)}
                    />
                  ))}
                </div>
              )}
            </main>
          } />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;