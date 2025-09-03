import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBookings } from "@/hooks/useBookings";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CalendarDay {
  date: Date;
  isBooked: boolean;
  isToday: boolean;
  isPast: boolean;
  isCurrentMonth: boolean;
  companyName?: string;
}

interface SwagCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

const SwagCalendar = ({ selectedDate, onDateSelect }: SwagCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { bookedDates, bookingDetails, loading } = useBookings();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getDaysInMonth = (date: Date): CalendarDay[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days: CalendarDay[] = [];

    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      const dateString = date.toDateString();
      days.push({
        date,
        isBooked: bookedDates.has(dateString),
        isToday: dateString === today.toDateString(),
        isPast: date < today,
        isCurrentMonth: false,
        companyName: bookingDetails.get(dateString),
      });
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateString = date.toDateString();
      days.push({
        date,
        isBooked: bookedDates.has(dateString),
        isToday: dateString === today.toDateString(),
        isPast: date < today,
        isCurrentMonth: true,
        companyName: bookingDetails.get(dateString),
      });
    }
    
    const totalCells = Math.ceil(days.length / 7) * 7;
    let nextMonthDay = 1;
    while (days.length < totalCells) {
      const date = new Date(year, month + 1, nextMonthDay);
      const dateString = date.toDateString();
      days.push({
        date,
        isBooked: bookedDates.has(dateString),
        isToday: dateString === today.toDateString(),
        isPast: date < today,
        isCurrentMonth: false,
        companyName: bookingDetails.get(dateString),
      });
      nextMonthDay++;
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleDateClick = (day: CalendarDay) => {
    if (loading || day.isPast || day.isBooked || !day.isCurrentMonth) return;
    onDateSelect(day.date);
  };

  const getDateButtonClass = (day: CalendarDay) => {
    let classes = "w-full h-14 text-sm border border-border transition-colors ";
    
    if (!day.isCurrentMonth) {
      classes += "text-muted-foreground bg-transparent cursor-not-allowed ";
    } else if (day.isPast) {
      classes += "text-muted-foreground bg-muted cursor-not-allowed ";
    } else if (day.isBooked) {
      classes += "bg-calendar-booked text-muted-foreground cursor-not-allowed ";
    } else {
      classes += "bg-calendar-available hover:bg-calendar-hover cursor-pointer text-foreground ";
    }
    
    if (selectedDate && day.date.toDateString() === selectedDate.toDateString()) {
      classes += "bg-primary text-primary-foreground hover:bg-primary/90 ";
    }
    
    return classes;
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="bg-card border border-border p-4 w-full relative">
      {loading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
          <div className="text-muted-foreground">Loading calendar...</div>
        </div>
      )}
      
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('prev')}
          className="text-foreground hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h2 className="text-lg font-medium text-foreground">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateMonth('next')}
          className="text-foreground hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map(day => (
          <div
            key={day}
            className="text-center text-xs text-muted-foreground p-1"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const buttonContent = (
            <button
              key={index}
              onClick={() => handleDateClick(day)}
              className={getDateButtonClass(day)}
              disabled={loading || day.isPast || day.isBooked || !day.isCurrentMonth}
              aria-label={`${day.date.toDateString()}${day.isBooked && day.companyName ? ` - Booked by ${day.companyName}` : ''}${day.isPast ? ' - Past date' : ''}`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-sm">{day.date.getDate()}</span>
                {day.isBooked && day.companyName && day.isCurrentMonth && (
                  <span className="text-[9px] truncate w-full px-1 text-muted-foreground">
                    {day.companyName}
                  </span>
                )}
              </div>
            </button>
          );

          if (day.isBooked && day.companyName && day.isCurrentMonth) {
            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    {buttonContent}
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Booked by: {day.companyName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          }

          return buttonContent;
        })}
      </div>

      <div className="mt-4 flex justify-center space-x-4 text-xs text-muted-foreground">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-calendar-available border border-border" />
          <span>Available</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-primary" />
          <span>Selected</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-calendar-booked" />
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
};

export default SwagCalendar;