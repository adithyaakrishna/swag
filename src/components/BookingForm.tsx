import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface BookingFormProps {
  selectedDate: Date | null;
  onSubmit: (formData: BookingFormData) => void;
}

export interface BookingFormData {
  date: Date;
  companyName: string;
  email: string;
  description: string;
}

const BookingForm = ({ selectedDate, onSubmit }: BookingFormProps) => {
  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    description: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDate) {
      toast({
        title: "No Date Selected",
        description: "Please select a date from the calendar first.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.companyName || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const bookingData: BookingFormData = {
        date: selectedDate,
        ...formData,
      };

      await onSubmit(bookingData);
      
      setFormData({
        companyName: "",
        email: "",
        description: "",
      });

      toast({
        title: "Booking Submitted",
        description: "Your swag day has been booked successfully.",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your booking.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-card border border-border p-6 w-full">
      <h2 className="text-xl font-medium text-foreground mb-4">Book Your Slot</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Selected Date */}
        {selectedDate && (
          <div className="bg-muted p-3 border border-border">
            <Label className="text-sm text-muted-foreground">Selected Date</Label>
            <p className="font-medium text-primary">
              {formatDate(selectedDate)}
            </p>
          </div>
        )}

        {/* Company Name */}
        <div className="space-y-1">
          <Label htmlFor="companyName" className="text-sm text-foreground">
            Company Name *
          </Label>
          <Input
            id="companyName"
            type="text"
            placeholder="Your company name"
            value={formData.companyName}
            onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
            required
            className="bg-input border-border text-foreground"
          />
        </div>

        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor="email" className="text-sm text-foreground">
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            required
            className="bg-input border-border text-foreground"
          />
        </div>

        {/* Description */}
        <div className="space-y-1">
          <Label htmlFor="description" className="text-sm text-foreground">
            Description / Special Requests
          </Label>
          <Textarea
            id="description"
            placeholder="Tell me about your swag, special requests, or messaging..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={4}
            className="bg-input border-border text-foreground resize-none"
          />
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          disabled={!selectedDate || isSubmitting}
        >
          {isSubmitting ? "Submitting..." : "Book Swag Day"}
        </Button>
      </form>
    </div>
  );
};

export default BookingForm;