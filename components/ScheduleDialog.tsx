"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { CustomButton } from "./ui/custom-button"
import { Clock, Calendar, ChevronRight, AlertCircle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { it } from "date-fns/locale"
import { Label } from "./ui/label"
import { Select } from "./ui/select"
import { useToast } from "./ui/use-toast"

interface ScheduleDialogProps {
  isOpen: boolean
  onClose: () => void
  onSchedule: (date: Date) => void
  templateId: string
}

export function ScheduleDialog({ 
  isOpen, 
  onClose, 
  onSchedule,
  templateId
}: ScheduleDialogProps) {
  const [selectedOption, setSelectedOption] = useState<string>("")
  const [showCustomDateTime, setShowCustomDateTime] = useState(false)
  const [customDate, setCustomDate] = useState<string>("")
  const [customTime, setCustomTime] = useState<string>("")
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [templateStatus, setTemplateStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
  const { toast } = useToast()

  // Genera le opzioni per le ore (00-23)
  const hours = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  )

  // Genera le opzioni per i minuti (00-55, incrementi di 5)
  const minutes = Array.from({ length: 12 }, (_, i) => 
    (i * 5).toString().padStart(2, '0')
  )

  // Controlla lo stato del template quando il dialog viene aperto
  useEffect(() => {
    if (isOpen && templateId) {
      checkTemplateStatus()
    }
  }, [isOpen, templateId])

  const checkTemplateStatus = async () => {
    try {
      setIsCheckingStatus(true)
      
      const response = await fetch(`/api/twilio/template/${templateId}/status`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Errore nel controllo dello stato')
      }

      setTemplateStatus(data.data.status)

      if (data.data.status === 'REJECTED') {
        toast({
          title: "Template rifiutato",
          description: data.data.rejectionReason || "Il template è stato rifiutato da WhatsApp",
          variant: "destructive",
        })
        onClose()
      } else if (data.data.status === 'PENDING') {
        toast({
          title: "Template in attesa",
          description: "Il template è ancora in fase di approvazione",
          variant: "default",
        })
        onClose()
      }
    } catch (error) {
      console.error('Errore nel controllo dello stato:', error)
      toast({
        title: "Errore",
        description: "Impossibile verificare lo stato del template",
        variant: "destructive",
      })
      onClose()
    } finally {
      setIsCheckingStatus(false)
    }
  }

  const handleSchedule = () => {
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

    onSchedule(scheduledDate);
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Programma invio</DialogTitle>
        </DialogHeader>

        {templateStatus === 'PENDING' && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Il template è in attesa di approvazione da WhatsApp. Il messaggio verrà inviato solo dopo l'approvazione.
            </p>
          </div>
        )}

        {templateStatus === 'REJECTED' && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              Il template è stato rifiutato da WhatsApp. Il messaggio non potrà essere inviato finché non viene approvata una nuova versione.
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
                <input
                  type="date"
                  id="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={format(new Date(Date.now() + 5 * 60 * 1000), "yyyy-MM-dd")}
                  max={format(new Date(Date.now() + 35 * 24 * 60 * 60 * 1000), "yyyy-MM-dd")}
                  className="w-full mt-1 p-2 border rounded-md"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hours">Ora</Label>
                  <Select 
                    value={customTime.split(":")[0]} 
                    onValueChange={(value) => {
                      const currentMinutes = customTime.split(":")[1] || "00";
                      setCustomTime(`${value}:${currentMinutes}`);
                    }}
                  >
                    {hours.map(hour => (
                      <option key={hour} value={hour}>{hour}</option>
                    ))}
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="minutes">Minuti</Label>
                  <Select
                    value={customTime.split(":")[1] || "00"}
                    onValueChange={(value) => {
                      const currentHours = customTime.split(":")[0] || "00";
                      setCustomTime(`${currentHours}:${value}`);
                    }}
                  >
                    {minutes.map(minute => (
                      <option key={minute} value={minute}>{minute}</option>
                    ))}
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
            disabled={!selectedOption || (selectedOption === "custom" && (!customDate || !customTime))}
          >
            {templateStatus === 'PENDING' ? 'Programma (in attesa di approvazione)' : 'Programma'}
          </CustomButton>
        </div>
      </DialogContent>
    </Dialog>
  )
} 