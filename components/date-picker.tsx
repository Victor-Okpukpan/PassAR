"use client"

import * as React from "react"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export interface DatePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
}

export function DatePickerC({ date, setDate }: DatePickerProps) {
  const [selectedTime, setSelectedTime] = React.useState<string | undefined>(undefined)

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate)
      if (selectedTime) {
        const [hours, minutes] = selectedTime.split(":")
        newDate.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10))
      }
      setDate(newDate)
    } else {
      setDate(undefined)
    }
  }

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    if (date) {
      const [hours, minutes] = time.split(":")
      const newDate = new Date(date)
      newDate.setHours(Number.parseInt(hours, 10), Number.parseInt(minutes, 10))
      setDate(newDate)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP p") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={handleDateSelect} initialFocus />
        <div className="p-3 border-t border-border">
          <Select onValueChange={handleTimeSelect} value={selectedTime}>
            <SelectTrigger>
              <SelectValue placeholder="Select a time" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 24 * 4 }).map((_, index) => {
                const hours = Math.floor(index / 4)
                const minutes = (index % 4) * 15
                const time = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
                return (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>
      </PopoverContent>
    </Popover>
  )
}

