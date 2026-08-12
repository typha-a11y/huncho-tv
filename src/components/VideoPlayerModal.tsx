import React, { useEffect, useState } from "react";
import { useStore } from "../lib/store";
import { StreamPlayerModal } from "./StreamPlayerModal";
import { getMovieDetails } from "../lib/api";
import { MovieDetails } from "../types";

export function VideoPlayerModal() {
  const { isVideoPlayerOpen, setVideoPlayerOpen, selectedMovieId, videoStreamTitle } = useStore();
  const [movie, setMovie] = useState<MovieDetails | null>(null);

  useEffect(() => {
    if (selectedMovieId) {
      getMovieDetails(selectedMovieId).then((data) => {
        if (data) setMovie(data);
      });
    } else {
      setMovie(null);
    }
  }, [selectedMovieId]);

  if (!isVideoPlayerOpen) return null;

  const movieTitle = videoStreamTitle || movie?.title || movie?.original_title || "Dune: Part Two";
  const imdbId = movie?.external_ids?.imdb_id || (typeof selectedMovieId === "string" && selectedMovieId.startsWith("tt") ? selectedMovieId : "tt30851137");
  const year = movie?.release_date ? movie.release_date.slice(0, 4) : "2024";
  const duration = movie?.runtime ? `${movie.runtime} min` : "120 min";
  const genre = movie?.genres && movie.genres.length > 0 ? movie.genres.map((g) => g.name).slice(0, 2).join(" / ") : "Action / Sci-Fi";

  return (
    <StreamPlayerModal
      isOpen={isVideoPlayerOpen}
      onClose={() => setVideoPlayerOpen(false)}
      movieId={selectedMovieId || "tt30851137"}
      imdbId={imdbId}
      movieTitle={movieTitle}
      year={year}
      duration={duration}
      quality="1080p HD"
      genre={genre}
    />
  );
}

