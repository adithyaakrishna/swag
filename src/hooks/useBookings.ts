import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useBookings = () => {
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('booking_date');

      if (error) throw error;

      const dates = new Set(
        data?.map(booking => new Date(booking.booking_date).toDateString()) || []
      );
      setBookedDates(dates);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (
    date: Date,
    companyName: string,
    email: string,
    description: string
  ) => {
    const { error } = await supabase
      .from('bookings')
      .insert({
        booking_date: date.toISOString().split('T')[0], // Format as YYYY-MM-DD
        company_name: companyName,
        email: email,
        description: description || null,
      });

    if (error) {
      throw error;
    }

    // Refresh the booked dates after successful booking
    await fetchBookings();
  };

  useEffect(() => {
    fetchBookings();

    // Set up real-time subscription to listen for new bookings
    const channel = supabase
      .channel('booking-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings'
        },
        () => {
          fetchBookings(); // Refetch when data changes
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { bookedDates, loading, refetch: fetchBookings, createBooking };
};