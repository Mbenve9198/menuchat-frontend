"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { CustomButton } from "./ui/custom-button"
import { Clock, Calendar, ChevronRight, AlertCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { Label } from "./ui/label"
import { Input } from "./ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"

interface ScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (date: Date) => Promise<void>;
  isTemplateApproved?: boolean;
}

export function ScheduleDialog({ 
  isOpen, 
  onClose, 
  onSchedule,
  isTemplateApproved = false
}: ScheduleDialogProps) {
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [showCustomDateTime, setShowCustomDateTime] = useState(false)
  const [customDate, setCustomDate] = useState<string>("")
  const [customTime, setCustomTime] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Genera le opzioni per le ore (00-23)
  const hours = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  )

  // Genera le opzioni per i minuti (00-55, incrementi di 5)
  const minutes = Array.from({ length: 12 }, (_, i) => 
    (i * 5).toString().padStart(2, '0')
  )

  const handleSchedule = async () => {
    try {
      setIsSubmitting(true)
      let scheduledDate: Date;

      switch (selectedOption) {
        case "10min":
          scheduledDate = new Date(Date.now() + 10 * 60 * 1000);
          break;
        case "tomorrow":
          scheduledDate = new Date();
          scheduledDate.setDate(scheduledDate.getDate() + 1);
          scheduledDate.setHours(10, 0, 0, 0);
          break;
        case "week":
          scheduledDate = new Date();
          scheduledDate.setDate(scheduledDate.getDate() + 7);
          scheduledDate.setHours(10, 0, 0, 0);
          break;
        case "custom":
          if (customDate && customTime) {
            const [hours, minutes] = customTime.split(":");
            scheduledDate = new Date(customDate);
            scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          } else {
            return;
          }
          break;
        default:
          return;
      }

      await onSchedule(scheduledDate);
    } catch (error) {
      console.error("Errore nella programmazione:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Programma invio</DialogTitle>
        </DialogHeader>

        {!isTemplateApproved && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Il template è in attesa di approvazione da WhatsApp. Il messaggio verrà inviato solo dopo l'approvazione.
            </p>
          </div>
        )}

        <div className="space-y-4 py-4">
          {/* Opzioni rapide */}
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={() => {
                setSelectedOption("10min")
                setShowCustomDateTime(false)
              }}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                selectedOption === "10min" 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-blue-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-500" />
                <span>Fra 10 minuti</span>
              </div>
              <ChevronRight className={`w-5 h-5 ${
                selectedOption === "10min" ? "text-blue-500" : "text-gray-400"
              }`} />
            </button>

            <button
              onClick={() => {
                setSelectedOption("tomorrow")
                setShowCustomDateTime(false)
              }}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                selectedOption === "tomorrow" 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-blue-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span>Domani alle 10:00</span>
              </div>
              <ChevronRight className={`w-5 h-5 ${
                selectedOption === "tomorrow" ? "text-blue-500" : "text-gray-400"
              }`} />
            </button>

            <button
              onClick={() => {
                setSelectedOption("week")
                setShowCustomDateTime(false)
              }}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                selectedOption === "week" 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-blue-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span>Fra 7 giorni alle 10:00</span>
              </div>
              <ChevronRight className={`w-5 h-5 ${
                selectedOption === "week" ? "text-blue-500" : "text-gray-400"
              }`} />
            </button>

            <button
              onClick={() => {
                setSelectedOption("custom")
                setShowCustomDateTime(true)
              }}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                selectedOption === "custom" 
                  ? "border-blue-500 bg-blue-50" 
                  : "border-gray-200 hover:border-blue-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span>Scegli data e ora</span>
              </div>
              <ChevronRight className={`w-5 h-5 ${
                selectedOption === "custom" ? "text-blue-500" : "text-gray-400"
              }`} />
            </button>
          </div>

          {/* Selettori data/ora personalizzati */}
          {showCustomDateTime && (
            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="date">Data</Label>
                <Input
                  type="date"
                  id="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={format(new Date(Date.now() + 5 * 60 * 1000), "yyyy-MM-dd")}
                  max={format(new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")}
                  className="w-full mt-1"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hours">Ora</Label>
                  <Select 
                    value={customTime.split(":")[0] || ""} 
                    onValueChange={(value) => {
                      const currentMinutes = customTime.split(":")[1] || "00";
                      setCustomTime(`${value}:${currentMinutes}`);
                    }}
                  >
                    <SelectTrigger id="hours">
                      <SelectValue placeholder="Ora" />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map(hour => (
                        <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="minutes">Minuti</Label>
                  <Select
                    value={customTime.split(":")[1] || ""}
                    onValueChange={(value) => {
                      const currentHours = customTime.split(":")[0] || "00";
                      setCustomTime(`${currentHours}:${value}`);
                    }}
                  >
                    <SelectTrigger id="minutes">
                      <SelectValue placeholder="Minuti" />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map(minute => (
                        <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <CustomButton variant="outline" onClick={onClose}>
            Annulla
          </CustomButton>
          <CustomButton 
            onClick={handleSchedule}
            disabled={!selectedOption || (selectedOption === "custom" && (!customDate || !customTime)) || isSubmitting}
          >
            {isSubmitting ? "Programmazione..." : !isTemplateApproved ? 'Programma (in attesa di approvazione)' : 'Programma'}
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  )
} 