"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js"
import { motion } from "framer-motion"
import { CreditCard, Loader2, Check, AlertCircle } from "lucide-react"
import { CustomButton } from "@/components/ui/custom-button"
import { useToast } from "@/hooks/use-toast"
import { useTranslation } from "react-i18next"

// Inizializza Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface StripeCheckoutProps {
  contactCount: number
  campaignName: string
  restaurantName?: string
  onPaymentSuccess: (paymentIntentId: string) => void
  onPaymentError: (error: string) => void
}

// Funzione per calcolare il prezzo (stessa logica dell'API)
function getPricePerContact(contactCount: number): number {
  if (contactCount <= 999) return 0.15
  if (contactCount <= 1999) return 0.14
  if (contactCount <= 2999) return 0.13
  if (contactCount <= 3999) return 0.12
  if (contactCount <= 4999) return 0.11
  return 0.10 // 5000+
}

function CheckoutForm({ contactCount, campaignName, restaurantName, onPaymentSuccess, onPaymentError }: StripeCheckoutProps) {
  const stripe = useStripe()
  const elements = useElements()
  const { toast } = useToast()
  const { t } = useTranslation()
  
  const [isLoading, setIsLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [isCreatingIntent, setIsCreatingIntent] = useState(true)
  const [actualAmount, setActualAmount] = useState<number>(0)
  const [wasAdjustedForMinimum, setWasAdjustedForMinimum] = useState(false)
  const [originalAmount, setOriginalAmount] = useState<number>(0)

  const pricePerContact = getPricePerContact(contactCount)
  const calculatedAmount = contactCount * pricePerContact

  // Crea il Payment Intent quando il componente si monta
  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        setIsCreatingIntent(true)
        
        // Chiama il backend invece delle API routes del frontend
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/create-intent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contactCount,
            campaignName,
            restaurantName
          })
        })

        const data = await response.json()

        if (data.success) {
          setClientSecret(data.data.clientSecret)
          setPaymentIntentId(data.data.paymentIntentId)
          setActualAmount(data.data.amount / 100) // Converti da centesimi a euro
          setWasAdjustedForMinimum(data.data.wasAdjustedForMinimum || false)
          setOriginalAmount(data.data.originalAmount / 100) // Converti da centesimi a euro
        } else {
          throw new Error(data.error || 'Errore nella creazione del pagamento')
        }
      } catch (error: any) {
        console.error('Errore:', error)
        onPaymentError(error.message)
        toast({
          title: "Errore",
          description: "Impossibile inizializzare il pagamento",
          variant: "destructive",
        })
      } finally {
        setIsCreatingIntent(false)
      }
    }

    createPaymentIntent()
  }, [contactCount, campaignName, restaurantName, onPaymentError, toast])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements || !clientSecret) {
      return
    }

    setIsLoading(true)

    const cardElement = elements.getElement(CardElement)

    if (!cardElement) {
      setIsLoading(false)
      return
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      })

      if (error) {
        console.error('Errore pagamento:', error)
        onPaymentError(error.message || 'Errore nel pagamento')
        toast({
          title: "Pagamento fallito",
          description: error.message || "Si è verificato un errore durante il pagamento",
          variant: "destructive",
        })
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Pagamento completato!",
          description: "La tua campagna verrà ora programmata",
        })
        onPaymentSuccess(paymentIntent.id)
      }
    } catch (error: any) {
      console.error('Errore:', error)
      onPaymentError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  if (isCreatingIntent) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-xl">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#EF476F] mx-auto" />
          <p className="text-gray-600">Preparazione del pagamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <CreditCard className="w-5 h-5 text-[#EF476F]" />
        <span className="text-sm font-medium text-[#EF476F]">Pagamento Campagna</span>
      </div>

      {/* Riepilogo costi */}
      <div className="bg-gray-50 rounded-xl p-4 mb-6 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Contatti selezionati:</span>
          <span className="font-medium">{contactCount.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Prezzo per contatto:</span>
          <span className="font-medium">€{pricePerContact.toFixed(2)}</span>
        </div>
        {wasAdjustedForMinimum && (
          <>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Importo calcolato:</span>
              <span>€{originalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-amber-600">
              <span>Importo minimo Stripe:</span>
              <span>€0.50</span>
            </div>
          </>
        )}
        <div className="border-t border-gray-200 pt-2 flex justify-between">
          <span className="font-medium text-gray-800">Totale:</span>
          <span className="font-bold text-[#EF476F] text-lg">€{actualAmount.toFixed(2)}</span>
        </div>
        {wasAdjustedForMinimum && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
            ℹ️ L'importo è stato aggiustato al minimo richiesto da Stripe (€0.50)
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-4 border border-gray-200 rounded-xl">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
              },
            }}
          />
        </div>

        <CustomButton
          type="submit"
          disabled={!stripe || isLoading}
          className="w-full py-3 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Elaborazione pagamento...
            </>
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Paga €{actualAmount.toFixed(2)}
            </>
          )}
        </CustomButton>
      </form>

      <div className="mt-4 flex items-center justify-center text-xs text-gray-500">
        <AlertCircle className="w-3 h-3 mr-1" />
        Pagamento sicuro elaborato da Stripe
      </div>
    </div>
  )
}

export default function StripeCheckout(props: StripeCheckoutProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm {...props} />
    </Elements>
  )
} 