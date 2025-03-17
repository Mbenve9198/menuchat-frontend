"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Award, Sparkles, Send, Upload, Clock, MessageSquare } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import ConfettiExplosion from "react-confetti-explosion"
import StepIndicator from "./step-indicator"
import { CustomButton } from "@/components/ui/custom-button"
import { RestaurantSearch } from "./restaurant-search"

const steps = [
  "Restaurant Basics",
  "Menu Setup",
  "Review Link",
  "Welcome Message",
  "Review Request",
  "Trigger Word",
  "Success!",
]

interface Restaurant {
  id: string
  name: string
  address: string
  location: {
    lat: number
    lng: number
  }
  rating?: number
  ratingsTotal?: number
  photo?: string | null
}

interface SetupWizardProps {
  onComplete: () => void
  onCoinEarned: (amount: number) => void
}

export default function SetupWizard({ onComplete, onCoinEarned }: SetupWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isExploding, setIsExploding] = useState(false)
  const { toast } = useToast()

  // Form state
  const [restaurantName, setRestaurantName] = useState("")
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [menuUrl, setMenuUrl] = useState("")
  const [reviewLink, setReviewLink] = useState("")
  const [welcomeMessage, setWelcomeMessage] = useState("")
  const [reviewTimer, setReviewTimer] = useState(60)
  const [triggerWord, setTriggerWord] = useState("")

  useEffect(() => {
    // Update progress based on current step
    setProgress(Math.round((currentStep / (steps.length - 1)) * 100))
  }, [currentStep])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)

      // Award coins for completing a step
      const coinsEarned = 25
      onCoinEarned(coinsEarned)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleComplete = () => {
    setIsExploding(true)

    setTimeout(() => {
      onComplete()
    }, 3000)
  }

  const getMascotImage = () => {
    // Only use the excited star with raised hands for the final success step
    if (currentStep === steps.length - 1) {
      return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2817%29-ZdJLaKudJSCmadMl3MEbaV0XoM3hYt.png"
    }
    // Use the cool star with crossed arms for all other steps
    return "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2819%29-2tgFAISTDBOqzMlGq1fDdMjCJC6Iqi.png"
  }

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
      {isExploding && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
          <ConfettiExplosion force={0.8} duration={3000} particleCount={100} width={1600} />
        </div>
      )}

      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-[#EF476F]">{steps[currentStep]}</h2>
            <p className="text-gray-700">
              {currentStep === steps.length - 1 ? "You did it! 🎉" : `Step ${currentStep + 1} of ${steps.length}`}
            </p>
          </div>

          <motion.div
            animate={{
              scale: currentStep === steps.length - 1 ? [1, 1.1, 1] : 1,
              rotate: currentStep === steps.length - 1 ? [0, -5, 5, -5, 0] : 0,
            }}
            transition={{
              duration: 0.5,
              repeat: currentStep === steps.length - 1 ? Number.POSITIVE_INFINITY : 0,
              repeatType: "reverse",
            }}
          >
            <Image
              src={getMascotImage() || "/placeholder.svg"}
              alt="Star Mascot"
              width={80}
              height={80}
              className="drop-shadow-lg"
            />
          </motion.div>
        </div>

        <div className="mb-6">
          <Progress
            value={progress}
            className="h-3 bg-gray-100"
            indicatorClassName="bg-gradient-to-r from-[#EF476F] to-[#FF8A9A] transition-all duration-700 ease-in-out"
          />
          <div className="mt-2 flex justify-between">
            <StepIndicator steps={steps} currentStep={currentStep} onStepClick={setCurrentStep} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-3xl p-6 shadow-xl"
          >
            {/* Step 1: Restaurant Basics */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-[#EF476F]" />
                  <span className="text-sm font-medium text-[#EF476F]">Let's get to know your restaurant!</span>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="restaurant-name" className="text-gray-800 font-medium">
                    What's your restaurant name?
                  </Label>
                  <Input
                    id="restaurant-name"
                    placeholder="e.g. Tasty Bites"
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    className="rounded-xl border-purple-200 focus:border-purple-400 focus:ring-purple-400 transition-all"
                  />
                </div>

                <RestaurantSearch 
                  onSelect={(restaurant) => {
                    setSelectedRestaurant(restaurant)
                    setRestaurantName(restaurant.name)
                  }} 
                  selectedRestaurant={selectedRestaurant} 
                />
              </div>
            )}

            {/* Step 2: Menu Setup */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="w-5 h-5 text-[#EF476F]" />
                  <span className="text-sm font-medium text-[#EF476F]">Let's set up your menu!</span>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="menu-url" className="text-gray-800 font-medium">
                    Do you have a menu URL?
                  </Label>
                  <Input
                    id="menu-url"
                    placeholder="https://your-restaurant.com/menu"
                    value={menuUrl}
                    onChange={(e) => setMenuUrl(e.target.value)}
                    className="rounded-xl border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400 transition-all"
                  />
                </div>

                <div className="mt-4">
                  <Label className="text-gray-800 font-medium mb-2 block">Or upload your menu as a PDF</Label>
                  <div className="border-2 border-dashed border-yellow-300 rounded-xl p-8 text-center bg-yellow-50">
                    <Upload className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Drag and drop your menu file here, or click to browse</p>
                    <CustomButton variant="outline" size="sm" className="mt-4 text-sm py-1 px-3">
                      Choose File
                    </CustomButton>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Review Link */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-[#EF476F] fill-[#EF476F]" />
                  <span className="text-sm font-medium text-[#EF476F]">Set up your review link!</span>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="review-link" className="text-gray-800 font-medium">
                    Where do you want customers to leave reviews?
                  </Label>
                  <RadioGroup defaultValue="google" className="space-y-2">
                    {[
                      { value: "google", label: "Google Reviews" },
                      { value: "yelp", label: "Yelp" },
                      { value: "tripadvisor", label: "TripAdvisor" },
                      { value: "custom", label: "Custom Link" },
                    ].map((option) => (
                      <Label
                        key={option.value}
                        htmlFor={option.value}
                        className="flex items-center p-3 rounded-xl border border-blue-200 bg-white cursor-pointer hover:bg-blue-50 transition-colors"
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="mr-3" />
                        {option.label}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="custom-review-link" className="text-gray-800 font-medium">
                    Your review link
                  </Label>
                  <Input
                    id="custom-review-link"
                    placeholder="https://g.page/r/..."
                    value={reviewLink}
                    onChange={(e) => setReviewLink(e.target.value)}
                    className="rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 transition-all"
                  />
                  <p className="text-xs text-blue-600">
                    We'll automatically detect your Google review link when customers message you!
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Welcome Message */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-[#EF476F]" />
                  <span className="text-sm font-medium text-[#EF476F]">Create your welcome message!</span>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="welcome-message" className="text-gray-800 font-medium">
                    What message should customers see first?
                  </Label>
                  <Textarea
                    id="welcome-message"
                    placeholder="Welcome to [Restaurant Name]! Type 'menu' to see our delicious options."
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    className="rounded-xl min-h-[100px] border-green-200 focus:border-green-400 focus:ring-green-400 transition-all"
                  />
                </div>

                <div className="mt-6 bg-gray-100 rounded-xl p-4 relative">
                  <div className="absolute -top-3 left-4 bg-white px-2 text-xs font-medium text-purple-800">
                    Preview
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="bg-white rounded-lg p-3 shadow-sm max-w-[220px]">
                      <p className="text-sm">
                        {welcomeMessage || "Welcome to Tasty Bites! Type 'menu' to see our delicious options."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Review Request */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-[#EF476F]" />
                  <span className="text-sm font-medium text-[#EF476F]">Set up review requests!</span>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-800 font-medium">When should we ask for a review?</Label>
                  <div className="bg-white rounded-xl p-4 border border-orange-200">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-orange-700">After order completion</span>
                      <span className="text-sm font-medium text-purple-800">{reviewTimer} minutes</span>
                    </div>
                    <Slider
                      defaultValue={[60]}
                      max={120}
                      min={15}
                      step={5}
                      onValueChange={(value) => setReviewTimer(value[0])}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>15 min</span>
                      <span>60 min</span>
                      <span>120 min</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-gray-800 font-medium">Choose a review request template</Label>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      "Hi there! How was your experience with us today? We'd love if you could leave us a quick review!",
                      "Thanks for ordering! We hope you enjoyed your meal. Would you mind sharing your experience in a quick review?",
                      "Your feedback helps us improve! Could you take a moment to leave us a review?",
                    ].map((template, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-xl p-4 border border-orange-200 cursor-pointer hover:border-orange-400 transition-colors"
                      >
                        <p className="text-sm text-gray-700">{template}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Trigger Word */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Send className="w-5 h-5 text-[#EF476F]" />
                  <span className="text-sm font-medium text-[#EF476F]">Set your trigger word!</span>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="trigger-word" className="text-gray-800 font-medium">
                    What word should trigger your menu?
                  </Label>
                  <div className="relative">
                    <Input
                      id="trigger-word"
                      placeholder="menu"
                      value={triggerWord}
                      onChange={(e) => setTriggerWord(e.target.value)}
                      className="rounded-xl text-center text-xl font-bold border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400 transition-all"
                    />
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      animate={{
                        boxShadow: triggerWord
                          ? [
                              "0 0 0px rgba(8, 145, 178, 0)",
                              "0 0 15px rgba(8, 145, 178, 0.5)",
                              "0 0 0px rgba(8, 145, 178, 0)",
                            ]
                          : "none",
                      }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                    />
                  </div>
                </div>

                <div className="mt-6 bg-gray-100 rounded-xl p-4">
                  <div className="flex flex-col gap-3">
                    <div className="self-end bg-green-100 rounded-lg p-3 max-w-[200px]">
                      <p className="text-sm">{triggerWord || "menu"}</p>
                    </div>
                    <div className="self-start bg-white rounded-lg p-3 shadow-sm max-w-[220px]">
                      <p className="text-sm">
                        Here's our menu! Check out our delicious options:
                        <br />
                        <br />🍔 Burgers
                        <br />🍕 Pizza
                        <br />🥗 Salads
                        <br />🍦 Desserts
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-sm text-cyan-600">
                    When customers type "<span className="font-bold">{triggerWord || "menu"}</span>", they'll
                    automatically see your menu!
                  </p>
                </div>
              </div>
            )}

            {/* Step 7: Success */}
            {currentStep === 6 && (
              <div className="space-y-4 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                  className="mx-auto mb-4"
                >
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Progetto%20senza%20titolo%20%2817%29-ZdJLaKudJSCmadMl3MEbaV0XoM3hYt.png"
                    alt="Excited Star Mascot"
                    width={120}
                    height={120}
                    className="mx-auto"
                  />
                </motion.div>

                <motion.h3
                  className="text-2xl font-extrabold text-[#EF476F]"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Well Done! 🎉
                </motion.h3>

                <motion.p
                  className="text-gray-700"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  Your WhatsApp Menu Bot is ready to go!
                </motion.p>

                <motion.div
                  className="mt-6 p-4 bg-white rounded-xl border border-green-200 flex flex-col items-center"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="mb-4">
                    <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-lg font-mono">QR Code</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">Scan this QR code with your phone</p>

                  <CustomButton variant="outline" size="sm" className="text-sm py-1 px-3">
                    Download QR Code
                  </CustomButton>
                </motion.div>

                <motion.div
                  className="mt-6"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-xl p-4 flex items-center gap-3">
                    <Award className="w-8 h-8 text-purple-600" />
                    <div className="text-left">
                      <p className="font-bold text-purple-900">You earned 200 potential reviews!</p>
                      <p className="text-sm text-purple-700">Keep going to unlock more features</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-6 flex justify-between">
          {currentStep > 0 ? (
            <CustomButton variant="outline" onClick={handlePrevious} className="text-gray-800 py-2 px-4">
              Back
            </CustomButton>
          ) : (
            <div></div>
          )}

          {currentStep < steps.length - 1 ? (
            <CustomButton onClick={handleNext} className="py-2 px-4">
              Continue
            </CustomButton>
          ) : (
            <CustomButton onClick={handleComplete} className="py-2 px-4">
              Finish Setup
            </CustomButton>
          )}
        </div>
      </motion.div>
    </div>
  )
}

