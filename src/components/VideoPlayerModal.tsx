import React, { useEffect, useState } from "react";
import { useStore } from "../lib/store";
import { StreamPlayerModal } from "./StreamPlayerModal";
import { getMovieDetails } from "../lib/api";
import { MovieDetails } from "../types";

export function VideoPlayerModal() {
  const { 
    isVideoPlayerOpen, 
    setVideoPlayerOpen, 
    selectedMovieId, 
    videoStreamTitle, 
    videoStreamUrl,
    isLiveStream,
    channelSlug,
    liveCategory,
    liveStreamType
  } = useStore();
  const [movie, setMovie] = useState<MovieDetails | null>(null);

  useEffect(() => {
    if (selectedMovieId && !isLiveStream) {
      getMovieDetails(selectedMovieId).then((data) => {
        if (data) setMovie(data);
      });
    } else {
      setMovie(null);
    }
  }, [selectedMovieId, isLiveStream]);

  if (!isVideoPlayerOpen) return null;

  const movieTitle = videoStreamTitle || movie?.title || movie?.original_title || "Live Broadcast";
  const imdbId = movie?.external_ids?.imdb_id || (typeof selectedMovieId === "string" && selectedMovieId.startsWith("tt") ? selectedMovieId : "tt30851137");
  const year = isLiveStream ? "LIVE" : (movie?.release_date ? movie.release_date.slice(0, 4) : "2026");
  const duration = isLiveStream ? "24/7 LIVE" : (movie?.runtime ? `${movie.runtime} min` : "120 min");
  const genre = isLiveStream ? (liveCategory || "Live TV") : (movie?.genres && movie.genres.length > 0 ? movie.genres.map((g) => g.name).slice(0, 2).join(" / ") : "Action / Sci-Fi");

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
      isLiveStream={isLiveStream}
      channelSlug={channelSlug || undefined}
      directStreamUrl={videoStreamUrl || undefined}
      streamType={liveStreamType || "direct_hls"}
    />
  );
}

