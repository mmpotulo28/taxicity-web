"use client";
import React from 'react';
import { useRide } from '../context/RideContext';
import RatingModal from './RatingModal';

const GlobalModals = () => {
 const { ratingTrip, setRatingTrip, setActiveTrip } = useRide();

 return (
  <>
   <RatingModal
    isOpen={!!ratingTrip}
    onOpenChange={(isOpen: boolean) => !isOpen && setRatingTrip(null)}
    trip={ratingTrip}
    onClose={() => {
     setRatingTrip(null);
     // Also clear active trip if it was completed
     if (ratingTrip?.status === 'completed') {
      setActiveTrip(null);
     }
    }}
   />
  </>
 );
};

export default GlobalModals;
