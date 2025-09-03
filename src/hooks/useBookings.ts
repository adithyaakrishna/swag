import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface BookingInfo {
  date: string;
  companyName: string;
}

export const useBookings = () => {
  const [bookedDates, setBookedDates] = useState<Set<string>>(new Set());
  const [bookingDetails, setBookingDetails] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('booking_date, company_name');

      if (error) throw error;

      const dates = new Set<string>();
      const details = new Map<string, string>();
      
      data?.forEach(booking => {
        // Parse the date string as local date to avoid timezone issues
        const [year, month, day] = booking.booking_date.split('-').map(Number);
        const localDate = new Date(year, month - 1, day);
        const dateString = localDate.toDateString();
        
        dates.add(dateString);
        details.set(dateString, booking.company_name);
      });
      
      setBookedDates(dates);
      setBookingDetails(details);
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

  return { bookedDates, bookingDetails, loading, refetch: fetchBookings, createBooking };
};