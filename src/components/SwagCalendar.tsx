import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useBookings } from "@/hooks/useBookings";

interface CalendarDay {
  date: Date;
  isBooked: boolean;
  isToday: boolean;
  isPast: boolean;
  isCurrentMonth: boolean;
}

interface SwagCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
}

const SwagCalendar = ({ selectedDate, onDateSelect }: SwagCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { bookedDates, loading } = useBookings();
  
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
    
    // Previous month's days
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push({
        date,
        isBooked: bookedDates.has(date.toDateString()),
        isToday: date.toDateString() === today.toDateString(),
        isPast: date < today,
        isCurrentMonth: false,
      });
    }
    
    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isBooked: bookedDates.has(date.toDateString()),
        isToday: date.toDateString() === today.toDateString(),
        isPast: date < today,
        isCurrentMonth: true,
      });
    }
    
    // Next month's days
    const totalCells = Math.ceil(days.length / 7) * 7;
    let nextMonthDay = 1;
    while (days.length < totalCells) {
      const date = new Date(year, month + 1, nextMonthDay);
      days.push({
        date,
        isBooked: bookedDates.has(date.toDateString()),
        isToday: date.toDateString() === today.toDateString(),
        isPast: date < today,
        isCurrentMonth: false,
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
    if (day.isPast || day.isBooked || !day.isCurrentMonth) return;
    onDateSelect(day.date);
  };

  const getDateButtonClass = (day: CalendarDay) => {
    let classes = "w-full h-10 text-sm border border-border transition-colors ";
    
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
    <div className="bg-card border border-border p-4 w-full">
      {/* Header */}
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

      {/* Days of week */}
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

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => handleDateClick(day)}
            className={getDateButtonClass(day)}
            disabled={day.isPast || day.isBooked || !day.isCurrentMonth}
          >
            {day.date.getDate()}
          </button>
        ))}
      </div>

      {/* Legend */}
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