import { useState, useRef } from "react";
import Hero from "@/components/Hero";
import SwagCalendar from "@/components/SwagCalendar";
import BookingForm, { BookingFormData } from "@/components/BookingForm";
import { useBookings } from "@/hooks/useBookings";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const bookingRef = useRef<HTMLDivElement>(null);
  const { createBooking, refetch } = useBookings();
  const { toast } = useToast();

  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleBookingSubmit = async (formData: BookingFormData) => {
    try {
      await createBooking(
        formData.date,
        formData.companyName,
        formData.email,
        formData.description
      );
      
      setSelectedDate(null);
      
      toast({
        title: "Booking Confirmed!",
        description: "Your swag day has been successfully booked.",
      });
    } catch (error: any) {
      const isDuplicateBooking = error.message?.includes('unique_booking_date') || 
                                 error.code === '23505';
      
      const message = isDuplicateBooking 
        ? 'This date has already been booked by another user. The calendar has been refreshed. Please select a different available date.'
        : 'There was an error creating your booking. Please try again.';
        
      toast({
        title: isDuplicateBooking ? "Date Already Booked" : "Booking Failed",
        description: message,
        variant: "destructive",
      });
      
      if (isDuplicateBooking) {
        await refetch();
        setSelectedDate(null);
      }
      
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Hero onBookNow={scrollToBooking} />
      
      <section ref={bookingRef} className="py-16 px-6">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Book Your Day
          </h2>

          <div className="space-y-8">
            <SwagCalendar 
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
            
            <BookingForm 
              selectedDate={selectedDate}
              onSubmit={handleBookingSubmit}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
