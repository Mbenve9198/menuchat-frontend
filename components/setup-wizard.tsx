"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star, Award, Sparkles, Send, Upload, Clock, MessageSquare, Loader2, Check } from "lucide-react"
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
import LanguageSelector, { MenuLanguage } from "./language-selector"
import MenuLanguageItem from "./menu-language-item"
import { signIn } from "next-auth/react"
import { useTranslation } from "react-i18next"
import UILanguageSelector from "@/components/ui-language-selector"
import { useRouter } from "next/navigation"

interface Restaurant {
  id: string;
  name: string;
  address: string;
  phoneNumber?: string;
  website?: string;
  openingHours?: string[];
  cuisineTypes?: string[];
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  ratingsTotal?: number;
  priceLevel?: number;
  photos?: string[];
  googleMapsUrl?: string;
  reviews?: Array<{
    author_name: string;
    rating: number;
    text: string;
    time: number;
  }>;
  // Manteniamo photo per retrocompatibilità con la ricerca base
  photo?: string | null;
}

interface SetupWizardProps {
  onComplete: () => void
  onCoinEarned: (amount: number) => void
}

// Define the interface for form data
interface WizardFormData {
  restaurantName: string;
  restaurantId?: string;
  address?: string;
  location?: {
    lat: number;
    lng: number;
  };
  menuUrl: string;
  hasMenuFile: boolean;
  reviewPlatform: string;
  reviewLink: string;
  welcomeMessage: string;
  reviewTimer: number;
  reviewTemplate: string;
  triggerWord: string;
  userEmail: string;
  userPassword: string;
  userFullName: string;
}

export default function SetupWizard({ onComplete, onCoinEarned }: SetupWizardProps) {
  const { t } = useTranslation()
  const isMountedRef = useRef(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isExploding, setIsExploding] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false)
  const [isEditingMessage, setIsEditingMessage] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // Steps array - moved inside component to use t()
  const steps = [
    t("setup.steps.restaurantBasics"),
    t("setup.steps.menuSetup"),
    t("setup.steps.reviewLink"),
    t("setup.steps.welcomeMessage"),
    t("setup.steps.reviewRequest"),
    t("setup.steps.triggerWord"),
    t("setup.steps.signUp"),
    t("setup.steps.success"),
  ]

  // Form state
  const [restaurantName, setRestaurantName] = useState("")
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [menuUrl, setMenuUrl] = useState("")
  const [hasMenuFile, setHasMenuFile] = useState(false)
  const [menuLanguages, setMenuLanguages] = useState<MenuLanguage[]>([
    { code: "en", name: "English", phonePrefix: ["1", "44"], menuUrl: "", menuFile: null }
  ])
  const [reviewLink, setReviewLink] = useState("")
  const [reviewPlatform, setReviewPlatform] = useState("google")
  const [welcomeMessage, setWelcomeMessage] = useState("")
  const [reviewTimer, setReviewTimer] = useState(120)
  const [selectedTemplate, setSelectedTemplate] = useState<number>(-1)
  const [triggerWord, setTriggerWord] = useState("")
  const [reviewTemplates, setReviewTemplates] = useState<string[]>([])
  const [isGeneratingTemplates, setIsGeneratingTemplates] = useState(false)
  const [customReviewMessage, setCustomReviewMessage] = useState("")
  
  // User signup info
  const [userEmail, setUserEmail] = useState("")
  const [userPassword, setUserPassword] = useState("")
  const [userFullName, setUserFullName] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")

  // New states for trigger validation
  const [isTriggerValid, setIsTriggerValid] = useState(false)
  const [isCheckingTrigger, setIsCheckingTrigger] = useState(false)
  const [triggerErrorMessage, setTriggerErrorMessage] = useState("")
  const [triggerTimeout, setTriggerTimeout] = useState<NodeJS.Timeout | null>(null)
  const [setupResponseData, setSetupResponseData] = useState<any>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isSetupCompleted, setIsSetupCompleted] = useState(false)

  // Step validation
  const hasAnyMenuContent = () => {
    return menuLanguages.some(lang => 
      (lang.menuUrl && lang.menuUrl.trim() !== "") || lang.menuFile !== null
    );
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        // Require both a restaurant name AND a selected restaurant from Google
        return restaurantName.trim() !== "" && selectedRestaurant !== null;
      case 1: 
        return hasAnyMenuContent();
      case 2: // Review Link
        return reviewPlatform && reviewLink.trim().length > 0;
      case 3: // Welcome Message
        return welcomeMessage.trim().length > 0;
      case 4: // Review Request
        // Sempre valido perché ha valori di default
        return true;
      case 5: // Trigger Word
        return triggerWord.trim().length > 0 && isTriggerValid;
      case 6: // Sign Up
        return (
          userEmail.trim().length > 0 && 
          userPassword.trim().length > 0 && 
          userPassword === passwordConfirm &&
          userFullName.trim().length > 0
        );
      default:
        return true;
    }
  };

  useEffect(() => {
    // Update progress based on current step
    if (isSetupCompleted) {
      setProgress(100);
    } else {
      setProgress(Math.round((currentStep / (steps.length - 1)) * 100));
    }
  }, [currentStep, isSetupCompleted])

  // Add this new function to check trigger phrase availability
  const checkTriggerAvailability = async (phrase: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/check-trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ triggerPhrase: phrase })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella verifica del trigger');
      }
      
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error("Error checking trigger availability:", error);
      return false;
    }
  };

  // Add this new function to check email availability
  const checkEmailAvailability = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/check-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella verifica dell\'email');
      }
      
      const data = await response.json();
      return data.available;
    } catch (error) {
      console.error("Error checking email availability:", error);
      return false;
    }
  };

  // Modify the handleNext function to check trigger availability
  const handleNext = async () => {
    if (!isStepValid()) {
      toast({
        title: "Please complete all required fields",
        description: "All fields are required to proceed to the next step.",
        variant: "destructive",
      });
      return;
    }

    // If we're on the trigger phrase step, verify it's unique
    if (currentStep === 5) {
      const isAvailable = await checkTriggerAvailability(triggerWord);
      
      if (!isAvailable) {
        toast({
          title: "Trigger phrase already taken",
          description: "Please choose a different trigger phrase. This one is already in use by another restaurant.",
          variant: "destructive",
        });
        return;
      }
    }

    // If we're on the signup step, verify email and submit data
    if (currentStep === 6) {
      // Check if email is available
      const isEmailAvailable = await checkEmailAvailability(userEmail);
      
      if (!isEmailAvailable) {
        toast({
          title: "Email already registered",
          description: "This email is already in use. Please use a different email address.",
          variant: "destructive",
        });
        return;
      }

      // Submit data to backend
      setIsSubmitting(true);
      setIsExploding(true);

      try {
        const firstMenuWithUrl = menuLanguages.find(lang => lang.menuUrl && lang.menuUrl.trim() !== "");
        const effectiveMenuUrl = firstMenuWithUrl?.menuUrl || "";

        const mainPhoto = selectedRestaurant?.photos && selectedRestaurant.photos.length > 0 
          ? selectedRestaurant.photos[0] 
          : selectedRestaurant?.photo || null;

        const mapMenuLanguagesToBotConfig = () => {
          return menuLanguages.map(lang => ({
            language: {
              code: lang.code,
              name: lang.name,
              phonePrefix: lang.phonePrefix || []
            },
            menuUrl: lang.menuUrl || '',
            menuPdfUrl: lang.menuPdfUrl || '',
            menuPdfName: lang.menuPdfName || ''
          }));
        };

        const formData = {
          restaurantName,
          restaurantId: selectedRestaurant?.id,
          address: {
            formattedAddress: selectedRestaurant?.address || "",
            latitude: selectedRestaurant?.location?.lat,
            longitude: selectedRestaurant?.location?.lng
          },
          googlePlaceId: selectedRestaurant?.id,
          googleMapsUrl: selectedRestaurant?.googleMapsUrl,
          mainPhoto,
          photos: selectedRestaurant?.photos || [],
          googleRating: {
            rating: selectedRestaurant?.rating,
            reviewCount: selectedRestaurant?.ratingsTotal,
            initialReviewCount: selectedRestaurant?.ratingsTotal
          },
          reviews: selectedRestaurant?.reviews?.map(review => ({
            authorName: review.author_name,
            rating: review.rating,
            text: review.text,
            time: review.time
          })),
          cuisineTypes: selectedRestaurant?.cuisineTypes || [],
          priceLevel: selectedRestaurant?.priceLevel,
          contact: {
            phone: selectedRestaurant?.phoneNumber || "",
            website: selectedRestaurant?.website || ""
          },
          operatingHours: selectedRestaurant?.openingHours?.map((hour, index) => ({
            day: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][index % 7],
            rawText: hour
          })) || [],
          menuUrl: effectiveMenuUrl,
          menuLanguages: mapMenuLanguagesToBotConfig(),
          hasMenuFile,
          reviewPlatform,
          reviewLink,
          welcomeMessage,
          reviewTimer,
          reviewTemplate: customReviewMessage,
          triggerWord,
          userEmail,
          userPassword,
          userFullName
        };

        console.log("Form data being sent:", formData);

        const response = await fetch('/api/restaurants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Server response error:", errorData);
          throw new Error(`Failed to save restaurant data: ${errorData.error || 'Unknown error'}`);
        }

        const responseData = await response.json();
        console.log("Setup success response:", responseData);
        
        // Salviamo i dati di risposta per il redirect successivo
        setSetupResponseData(responseData);
        
        // Invece di cambiare step, impostiamo il flag di completamento
        if (isMountedRef.current) {
          setIsSetupCompleted(true);
        }
        
      } catch (error: any) {
        console.error("Setup error:", error);
        
        if (isMountedRef.current) {
          toast({
            title: "Error",
            description: error.message || "There was an error saving your data. Please try again.",
            variant: "destructive",
          });
          setIsExploding(false);
        }
        return;
      } finally {
        if (isMountedRef.current) {
          setIsSubmitting(false);
        }
      }
    } else {
      // Normal step progression
      if (currentStep < steps.length - 1) {
        setCurrentStep((prev) => prev + 1)

        // Award coins for completing a step
        const coinsEarned = 25
        onCoinEarned(coinsEarned)
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const handleComplete = async () => {
    // Questa funzione non dovrebbe più essere chiamata dato che i dati vengono inviati nello step 6
    console.log("handleComplete called - this should not happen");
  };

  const getMascotImage = () => {
    // Use the rock mascot for the final success step
    if (currentStep === steps.length - 1) {
      return "/mascottes/mascotte_rock.png"
    }
    // Use the setup wizard mascot for all other steps
    return "/mascottes/mascotte_setupwizard.png"
  }

  // Function to update a language item in our array
  const handleLanguageChange = (updatedLanguage: MenuLanguage) => {
    setMenuLanguages(prev => 
      prev.map(lang => 
        lang.code === updatedLanguage.code ? updatedLanguage : lang
      )
    );
  };

  // Update hasMenuFile when a file is selected in any language
  useEffect(() => {
    const hasAnyFile = menuLanguages.some(lang => lang.menuFile !== null);
    setHasMenuFile(hasAnyFile);
  }, [menuLanguages]);

  // Update menuUrl when menuLanguages change
  useEffect(() => {
    const firstMenuWithUrl = menuLanguages.find(lang => lang.menuUrl && lang.menuUrl.trim() !== "");
    if (firstMenuWithUrl?.menuUrl) {
      setMenuUrl(firstMenuWithUrl.menuUrl);
    }
  }, [menuLanguages]);

  // Get Google review link from selected restaurant (if available)
  useEffect(() => {
    if (selectedRestaurant?.id && reviewPlatform === "google") {
      // Format the place ID in the correct format for Google Maps reviews
      // Using the format that opens directly the review form
      const googleReviewLink = `https://search.google.com/local/writereview?placeid=${selectedRestaurant.id}`;
      setReviewLink(googleReviewLink);
    }
  }, [selectedRestaurant, reviewPlatform]);

  useEffect(() => {
    if (currentStep === 3 && selectedRestaurant?.id && !welcomeMessage) {
      generateWelcomeMessage();
    }
  }, [currentStep, selectedRestaurant]);

  const generateWelcomeMessage = async () => {
    try {
      setIsGeneratingMessage(true);
      
      if (!selectedRestaurant) {
        throw new Error("No restaurant selected");
      }

      // Determine menu type
      const firstMenuWithFile = menuLanguages.find(lang => lang.menuFile !== null);
      const firstMenuWithUrl = menuLanguages.find(lang => lang.menuUrl && lang.menuUrl.trim() !== "");
      const menuType = firstMenuWithFile ? 'pdf' : 'url';

      const response = await fetch("/api/welcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantId: selectedRestaurant.id,
          restaurantName: selectedRestaurant.name,
          restaurantDetails: selectedRestaurant,
          menuType,
          modelId: "claude-3-7-sonnet-20250219"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella generazione del messaggio');
      }

      const data = await response.json();
      if (data.success) {
        setWelcomeMessage(data.message);
      } else {
        toast({
          title: "Errore",
          description: `Non è stato possibile generare il messaggio: ${data.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Errore di connessione",
        description: "Non è stato possibile contattare il server",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  // Aggiungi questa funzione per generare i template di recensione
  const generateReviewTemplates = async () => {
    try {
      setIsGeneratingTemplates(true);
      
      if (!selectedRestaurant) {
        throw new Error("Nessun ristorante selezionato");
      }

      const response = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          restaurantName: selectedRestaurant.name,
          restaurantDetails: selectedRestaurant,
          reviewLink: reviewLink,
          modelId: "claude-3-7-sonnet-20250219"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella generazione dei template');
      }

      const data = await response.json();
      if (data.success) {
        // Salviamo direttamente il primo template come messaggio personalizzato
        setCustomReviewMessage(data.templates[0]);
      } else {
        toast({
          title: "Errore",
          description: `Non è stato possibile generare il template: ${data.error}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Errore di connessione",
        description: "Non è stato possibile contattare il server",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingTemplates(false);
    }
  };

  // Aggiungi questo useEffect per generare i template quando lo step diventa attivo
  useEffect(() => {
    if (currentStep === 4 && selectedRestaurant?.id && reviewTemplates.length === 0) {
      generateReviewTemplates();
    }
  }, [currentStep, selectedRestaurant]);

  // Funzione corretta per controllare il trigger con debounce senza lodash
  const checkTriggerPhrase = (phrase: string) => {
    // Cancella qualsiasi timeout esistente
    if (triggerTimeout) {
      clearTimeout(triggerTimeout);
    }
    
    if (!phrase || phrase.trim().length < 3) {
      setIsTriggerValid(false);
      setTriggerErrorMessage("Trigger phrase must be at least 3 characters long");
      return;
    }
    
    // Imposta un nuovo timeout
    const newTimeout = setTimeout(async () => {
      try {
        setIsCheckingTrigger(true);
        
        // Utilizziamo l'endpoint corretto con metodo POST
        const response = await fetch('/api/check-trigger', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ triggerPhrase: phrase.trim() })
        });
        
        if (!response.ok) {
          throw new Error("Failed to validate trigger phrase");
        }
        
        const data = await response.json();
        
        if (data.available) {
          setIsTriggerValid(true);
          setTriggerErrorMessage("");
        } else {
          setIsTriggerValid(false);
          setTriggerErrorMessage("This trigger phrase is already in use. Please choose another one.");
        }
      } catch (error) {
        console.error("Error checking trigger availability:", error);
        setIsTriggerValid(false);
        setTriggerErrorMessage("Error checking availability. Please try again.");
      } finally {
        setIsCheckingTrigger(false);
      }
    }, 500); // Esegui la verifica dopo 500ms di inattività
    
    setTriggerTimeout(newTimeout);
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Funzione per gestire il redirect finale
  const handleFinalRedirect = async () => {
    if (!setupResponseData) return;
    
    setIsRedirecting(true);
    
    try {
      // Effettua l'auto-login dopo la registrazione
      const loginResponse = await signIn('credentials', {
        email: userEmail,
        password: userPassword,
        redirect: false,
        callbackUrl: `${window.location.origin}/dashboard`
      });
      
      console.log("Auto-login response:", loginResponse);
      
      if (loginResponse?.error) {
        console.error("Login error:", loginResponse.error);
        // In caso di errore nel login, reindirizza comunque alla dashboard
        router.push(`/dashboard?restaurantId=${setupResponseData.restaurantId}`);
      } else {
        // Login effettuato con successo, reindirizzo con autenticazione
        router.push(loginResponse?.url || "/dashboard");
      }
    } catch (loginError) {
      console.error("Auto-login error:", loginError);
      // Se il login automatico fallisce, reindirizza comunque alla dashboard
      router.push(`/dashboard?restaurantId=${setupResponseData.restaurantId}`);
    } finally {
      setIsRedirecting(false);
    }
  };

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
            <h2 className="text-2xl font-extrabold text-[#EF476F]">
              {isSetupCompleted ? steps[steps.length - 1] : steps[currentStep]}
            </h2>
            <p className="text-gray-700">
              {(currentStep === steps.length - 1 || isSetupCompleted) ? t("setup.navigation.youDidIt") : t("setup.navigation.stepOf", { current: currentStep + 1, total: steps.length })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <UILanguageSelector variant="compact" />

          {/* Rimuovi la mascotte in alto a destra nell'ultimo step */}
          {currentStep !== steps.length - 1 && (
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
                width={160}
                height={160}
                className="drop-shadow-lg"
              />
            </motion.div>
          )}
          </div>
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
            {currentStep === 0 && !isSetupCompleted && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-[#EF476F]" />
                  <span className="text-sm font-medium text-[#EF476F]">{t("setup.restaurantBasics.title")}</span>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="restaurant-name" className="text-gray-800 font-medium">
                    {t("setup.restaurantBasics.restaurantName")}
                  </Label>
                  <Input
                    id="restaurant-name"
                    placeholder={t("setup.restaurantBasics.restaurantNamePlaceholder")}
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
                  restaurantName={restaurantName}
                  labelText={t("setup.restaurantBasics.restaurantAddress")}
                />
              </div>
            )}

            {/* Step 2: Menu Setup */}
            {currentStep === 1 && !isSetupCompleted && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Upload className="w-5 h-5 text-[#EF476F]" />
                  <span className="text-sm font-medium text-[#EF476F]">{t("setup.menuSetup.title")}</span>
                </div>

                <div className="space-y-1">
                  <Label className="text-gray-800 font-medium">
                    {t("setup.menuSetup.selectLanguages")}
                  </Label>
                  <p className="text-sm text-gray-500 mb-3">
                    {t("setup.menuSetup.languagesDescription")}
                  </p>
                  
                  <LanguageSelector 
                    selectedLanguages={menuLanguages}
                    onLanguagesChange={setMenuLanguages}
                  />
                </div>

                <div className="border-t pt-4 mt-6">
                  <Label className="text-gray-800 font-medium mb-3 block">
                    {t("setup.menuSetup.configureMenus")}
                  </Label>
                  
                  <div className="space-y-4">
                    {menuLanguages.map(language => (
                      <MenuLanguageItem
                        key={language.code}
                        language={language}
                        onLanguageChange={handleLanguageChange}
                        restaurantName={restaurantName}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Welcome Message */}
            {currentStep === 3 && !isSetupCompleted && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-[#EF476F]" />
                  <span className="text-sm font-medium text-[#EF476F]">{t("setup.welcomeMessage.title")}</span>
                </div>

                {isGeneratingMessage ? (
                  <div className="flex flex-col items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-4"></div>
                    <p className="text-sm text-gray-700">{t("setup.welcomeMessage.generating")}</p>
                  </div>
                ) : (
                  <>
                    {/* WhatsApp Mockup */}
                    <div className="mt-3 mb-4">
                      <div className="flex justify-center">
                        <div className="w-[320px] border-[8px] border-gray-800 rounded-3xl overflow-hidden shadow-xl bg-white relative">
                          {/* Notch superiore */}
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-gray-800 rounded-b-lg z-10"></div>
                          
                          {/* Barra superiore */}
                          <div className="bg-[#075E54] text-white p-3 pt-6">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                                {selectedRestaurant?.photos && selectedRestaurant.photos.length > 0 ? (
                                  <img 
                                    src={selectedRestaurant.photos[0]} 
                                    alt={selectedRestaurant?.name || "Restaurant"} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                      <path fillRule="evenodd" d="M10 0a10 10 0 100 20 10 10 0 000-20zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="ml-3">
                                <div className="text-base font-semibold truncate max-w-[180px]">{selectedRestaurant?.name || "Restaurant"}</div>
                                <div className="text-xs opacity-80">{t("setup.welcomeMessage.online")}</div>
                              </div>
                              <div className="ml-auto flex gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          {/* Corpo chat */}
                          <div className="bg-[#E5DDD5] h-[400px] p-3 overflow-y-auto" style={{ 
                            backgroundImage: "url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png')",
                            backgroundRepeat: "repeat"
                          }}>
                            <div className="flex flex-col gap-3">
                              {/* Data */}
                              <div className="flex justify-center mb-1">
                                <div className="bg-white bg-opacity-80 px-2 py-1 rounded-lg text-[10px] text-gray-500">
                                  {new Date().toLocaleDateString()}
                                </div>
                              </div>
                              
                              {/* Messaggio dell'utente */}
                              <div className="self-end max-w-[85%]">
                                <div className="bg-[#DCF8C6] p-2 rounded-lg shadow-sm relative">
                                  <p className="text-sm">{triggerWord || `Hello ${selectedRestaurant?.name || "Restaurant"}`}</p>
                                  <div className="text-right mt-1">
                                    <span className="text-[10px] text-gray-500">{new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')}</span>
                                    <span className="text-[10px] text-[#4FC3F7] ml-1">✓✓</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Messaggio del ristorante */}
                              <div className="self-start max-w-[85%]">
                                <div className="bg-white p-2 rounded-lg shadow-sm relative">
                                  {/* Se il menu è un PDF, mostra l'anteprima del file */}
                                  {menuLanguages.some(lang => lang.menuFile) && (
                                    <div className="mb-2 flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                                      <div className="w-8 h-8 bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold">
                                        PDF
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-900">Menu.pdf</p>
                                        <p className="text-[10px] text-gray-500">PDF Document</p>
                                      </div>
                                    </div>
                                  )}
                                  
                                  <p className="text-sm whitespace-pre-wrap">{welcomeMessage.replace('{customerName}', 'Marco')}</p>
                                  
                                  {/* Se il menu è un URL, mostra il pulsante CTA */}
                                  {!menuLanguages.some(lang => lang.menuFile) && menuLanguages.some(lang => lang.menuUrl) && (
                                    <div className="mt-2 border-t pt-2">
                                      <button className="w-full text-center py-2 text-[#0277BD] text-sm font-medium hover:bg-gray-50 rounded transition-colors">
                                        {t("setup.welcomeMessage.viewMenu")}
                                      </button>
                                    </div>
                                  )}
                                  
                                  <div className="text-right mt-1">
                                    <span className="text-[10px] text-gray-500">{new Date().getHours()}:{(new Date().getMinutes() + 1).toString().padStart(2, '0')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Barra inferiore */}
                          <div className="bg-[#F0F0F0] p-2">
                            <div className="flex items-center">
                              <div className="flex-grow bg-white rounded-full px-3 py-2 flex items-center">
                                <span className="text-gray-400 text-sm">{t("setup.welcomeMessage.typeMessage")}</span>
                              </div>
                              <div className="ml-2 w-8 h-8 rounded-full bg-[#075E54] flex items-center justify-center text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottoni di azione */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
                      <CustomButton
                        variant="outline"
                        size="sm"
                        className="text-sm w-full sm:w-auto"
                        onClick={() => {
                          setIsEditingMessage(!isEditingMessage);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        {t("setup.welcomeMessage.editMessage")}
                      </CustomButton>
                      
                      <CustomButton
                        variant="outline"
                        size="sm"
                        className="text-sm w-full sm:w-auto"
                        onClick={generateWelcomeMessage}
                        disabled={isGeneratingMessage}
                      >
                        {isGeneratingMessage ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                            {t("setup.welcomeMessage.regenerating")}
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" /> 
                            {t("setup.welcomeMessage.regenerateAI")}
                          </>
                        )}
                      </CustomButton>
                    </div>
                    
                    {isEditingMessage && (
                      <div className="mt-4 space-y-2">
                        <label htmlFor="welcomeMessage" className="block text-sm font-medium text-gray-700">
                          {t("setup.welcomeMessage.customizeMessage")}
                        </label>
                        <div>
                          <textarea
                            id="welcomeMessage"
                            rows={6}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={welcomeMessage}
                            onChange={(e) => setWelcomeMessage(e.target.value)}
                            placeholder={t("setup.welcomeMessage.messagePlaceholder")}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          <MessageSquare className="w-3 h-3 inline mr-1" />
                          {t("setup.welcomeMessage.autoTranslate")}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Step 4: Review Link */}
            {currentStep === 2 && !isSetupCompleted && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-[#EF476F] fill-[#EF476F]" />
                  <span className="text-sm font-medium text-[#EF476F]">{t("setup.reviewLink.title")}</span>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="review-link" className="text-gray-800 font-medium">
                    {t("setup.reviewLink.whereReviews")}
                  </Label>
                  <RadioGroup 
                    value={reviewPlatform} 
                    onValueChange={setReviewPlatform}
                    className="space-y-2"
                  >
                    {[
                      { value: "google", label: t("setup.reviewLink.platforms.google") },
                      { value: "yelp", label: t("setup.reviewLink.platforms.yelp") },
                      { value: "tripadvisor", label: t("setup.reviewLink.platforms.tripadvisor") },
                      { value: "custom", label: t("setup.reviewLink.platforms.custom") },
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
                    {t("setup.reviewLink.reviewLink")}
                  </Label>
                  <Input
                    id="custom-review-link"
                    placeholder={reviewPlatform === "google" ? "https://g.page/r/..." : 
                            reviewPlatform === "yelp" ? "https://www.yelp.com/biz/..." :
                            reviewPlatform === "tripadvisor" ? "https://www.tripadvisor.com/..." :
                            "https://your-review-link.com"}
                    value={reviewLink}
                    onChange={(e) => setReviewLink(e.target.value)}
                    className="rounded-xl border-blue-200 focus:border-blue-400 focus:ring-blue-400 transition-all"
                  />
                  {reviewPlatform === "google" && (
                    <p className="text-xs text-blue-600">
                      {t("setup.reviewLink.googleDescription")}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Review Request */}
            {currentStep === 4 && !isSetupCompleted && (
              <div className="space-y-6">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-[#EF476F]" />
                  <span className="text-sm font-medium text-[#EF476F]">{t("setup.reviewRequest.title")}</span>
                </div>

                {isGeneratingTemplates ? (
                  <div className="flex flex-col items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-900 mb-4"></div>
                    <p className="text-sm text-gray-700">{t("setup.reviewRequest.generating")}</p>
                  </div>
                ) : (
                  <>
                    {/* WhatsApp Mockup */}
                    <div className="mt-3 mb-4">
                      <div className="flex justify-center">
                        <div className="w-[320px] border-[8px] border-gray-800 rounded-3xl overflow-hidden shadow-xl bg-white relative">
                          {/* Notch superiore */}
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/3 h-5 bg-gray-800 rounded-b-lg z-10"></div>
                          
                          {/* Barra superiore */}
                          <div className="bg-[#075E54] text-white p-3 pt-6">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden flex-shrink-0">
                                {selectedRestaurant?.photos && selectedRestaurant.photos.length > 0 ? (
                                  <img 
                                    src={selectedRestaurant.photos[0]} 
                                    alt={selectedRestaurant?.name || "Restaurant"} 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                      <path fillRule="evenodd" d="M10 0a10 10 0 100 20 10 10 0 000-20zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" clipRule="evenodd" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="ml-3">
                                <div className="text-base font-semibold truncate max-w-[180px]">{selectedRestaurant?.name || "Restaurant"}</div>
                                <div className="text-xs opacity-80">{t("setup.welcomeMessage.online")}</div>
                              </div>
                              <div className="ml-auto flex gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                          
                          {/* Corpo chat */}
                          <div className="bg-[#E5DDD5] h-[400px] p-3 overflow-y-auto" style={{ 
                            backgroundImage: "url('https://web.whatsapp.com/img/bg-chat-tile-dark_a4be512e7195b6b733d9110b408f075d.png')",
                            backgroundRepeat: "repeat"
                          }}>
                            <div className="flex flex-col gap-3">
                              {/* Data */}
                              <div className="flex justify-center mb-1">
                                <div className="bg-white bg-opacity-80 px-2 py-1 rounded-lg text-[10px] text-gray-500">
                                  {new Date().toLocaleDateString()}
                                </div>
                              </div>
                              
                              {/* Messaggio dell'utente */}
                              <div className="self-end max-w-[85%]">
                                <div className="bg-[#DCF8C6] p-2 rounded-lg shadow-sm relative">
                                  <p className="text-sm">Order completed! 🎉</p>
                                  <div className="text-right mt-1">
                                    <span className="text-[10px] text-gray-500">{new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')}</span>
                                    <span className="text-[10px] text-[#4FC3F7] ml-1">✓✓</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Messaggio del ristorante */}
                              <div className="self-start max-w-[85%]">
                                <div className="bg-white p-2 rounded-lg shadow-sm relative">
                                  <p className="text-sm whitespace-pre-wrap">
                                    {customReviewMessage || "Generating review message..."}
                                  </p>
                                  <div className="mt-2 border-t pt-2">
                                    <button className="w-full text-center py-2 text-[#0277BD] text-sm font-medium hover:bg-gray-50 rounded transition-colors">
                                      Leave a Review
                                    </button>
                                  </div>
                                  <div className="text-right mt-1">
                                    <span className="text-[10px] text-gray-500">{new Date().getHours()}:{(new Date().getMinutes() + 1).toString().padStart(2, '0')}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Barra inferiore */}
                          <div className="bg-[#F0F0F0] p-2">
                            <div className="flex items-center">
                              <div className="flex-grow bg-white rounded-full px-3 py-2 flex items-center">
                                <span className="text-gray-400 text-sm">Type a message</span>
                              </div>
                              <div className="ml-2 w-8 h-8 rounded-full bg-[#075E54] flex items-center justify-center text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
                                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottoni di azione */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 mt-4">
                      <CustomButton
                        variant="outline"
                        size="sm"
                        className="text-sm w-full sm:w-auto"
                        onClick={() => {
                          setIsEditingMessage(!isEditingMessage);
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit Message
                      </CustomButton>
                      
                      <CustomButton
                        variant="outline"
                        size="sm"
                        className="text-sm w-full sm:w-auto"
                        onClick={generateReviewTemplates}
                        disabled={isGeneratingTemplates}
                      >
                        {isGeneratingTemplates ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" /> 
                            Regenerate with AI
                          </>
                        )}
                      </CustomButton>
                    </div>
                    
                    {isEditingMessage && (
                      <div className="mt-4 space-y-2">
                        <label htmlFor="customReviewMessage" className="block text-sm font-medium text-gray-700">
                          Customize Message
                        </label>
                        <div>
                          <textarea
                            id="customReviewMessage"
                            rows={6}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={customReviewMessage || reviewTemplates[0] || ""}
                            onChange={(e) => setCustomReviewMessage(e.target.value)}
                            placeholder="Enter your review request message..."
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          <MessageSquare className="w-3 h-3 inline mr-1" />
                          The review link will be automatically added as a button below your message.
                        </p>
                      </div>
                    )}

                    {/* Timing Settings Section */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="space-y-4">
                        <Label className="text-gray-800 font-medium">When should we ask for a review?</Label>
                        <div className="bg-white rounded-xl p-4 border border-orange-200">
                          <div className="flex justify-between mb-2">
                            <span className="text-sm text-orange-700">After order completion</span>
                            <span className="text-sm font-medium text-purple-800">{reviewTimer / 60} hours</span>
                          </div>
                          <Slider
                            defaultValue={[120]}
                            max={1440}
                            min={120}
                            step={60}
                            onValueChange={(value) => setReviewTimer(value[0])}
                            className="py-4"
                          />
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>2h</span>
                            <span>12h</span>
                            <span>24h</span>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                          <div className="flex items-start gap-2">
                            <div className="mt-1">
                              <Clock className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm text-blue-700 font-medium mb-1">
                                Optimal timing for best results
                              </p>
                              <p className="text-xs text-blue-600">
                                Based on our research, 2 hours after an order is the perfect time to request a review. 
                                Your customers have finished their meal and are likely to leave positive feedback.
                              </p>
                              <p className="text-xs text-blue-600 mt-2">
                                <strong>Note:</strong> For customer convenience, review requests will never be sent after midnight or before 8 AM, regardless of your timing settings.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 6: Trigger Phrase */}
            {currentStep === 5 && !isSetupCompleted && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Send className="w-5 h-5 text-[#EF476F]" />
                  <span className="text-sm font-medium text-[#EF476F]">Set your trigger phrase!</span>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="trigger-phrase" className="text-gray-800 font-medium">
                    Choose your restaurant's trigger phrase
                  </Label>
                  <p className="text-sm text-gray-600">
                    This can be a greeting + your restaurant name (e.g. "Hello Pizzeria Italia") or any unique phrase. 
                    When customers scan your table QR code, WhatsApp will open with your trigger phrase pre-filled.
                  </p>
                  <div className="relative">
                    <Input
                      id="trigger-phrase"
                      placeholder={`Hello ${selectedRestaurant?.name || "Restaurant"}`}
                      value={triggerWord}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setTriggerWord(newValue);
                        setIsTriggerValid(false); // Reset validation on change
                        
                        if (newValue.trim().length >= 3) {
                          checkTriggerPhrase(newValue);
                        } else {
                          setTriggerErrorMessage("Trigger phrase must be at least 3 characters long");
                        }
                      }}
                      className={`rounded-xl text-center text-xl font-bold transition-all ${
                        triggerErrorMessage
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : isTriggerValid
                            ? "border-green-300 focus:border-green-500 focus:ring-green-500"
                            : "border-cyan-200 focus:border-cyan-400 focus:ring-cyan-400"
                      }`}
                    />
                    {isCheckingTrigger && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      </div>
                    )}
                    {isTriggerValid && !isCheckingTrigger && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Check className="w-5 h-5 text-green-500" />
                      </div>
                    )}
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      animate={{
                        boxShadow: triggerWord && isTriggerValid
                          ? [
                              "0 0 0px rgba(34, 197, 94, 0)",
                              "0 0 15px rgba(34, 197, 94, 0.5)",
                              "0 0 0px rgba(34, 197, 94, 0)",
                            ]
                          : "none",
                      }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 2 }}
                    />
                  </div>
                  {triggerErrorMessage && (
                    <p className="text-sm text-red-500">
                      {triggerErrorMessage}
                    </p>
                  )}
                  {triggerWord.length > 30 && !triggerErrorMessage && (
                    <p className="text-sm text-amber-600">
                      Keep your trigger phrase short and memorable (under 30 characters recommended).
                    </p>
                  )}
                  {isTriggerValid && (
                    <p className="text-sm text-green-500">
                      <Check className="w-4 h-4 inline mr-1" />
                      This trigger phrase is available!
                    </p>
                  )}
                </div>

                <div className="mt-6 bg-gray-100 rounded-xl p-4">
                  <div className="flex flex-col gap-3">
                    <div className="self-end bg-green-100 rounded-lg p-3 max-w-[200px]">
                      <p className="text-sm">{triggerWord || `Hello ${selectedRestaurant?.name || "Restaurant"}`}</p>
                    </div>
                    <div className="self-start bg-white rounded-lg p-3 shadow-sm max-w-[220px]">
                      <p className="text-sm">
                        Welcome to {selectedRestaurant?.name || "Restaurant"}! Here's our menu:
                        <br />
                        <br />🍔 Burgers
                        <br />🍕 Pizza
                        <br />🥗 Salads
                        <br />🍦 Desserts
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
                  <p className="text-sm text-blue-700">
                    <strong>Important:</strong> Your trigger phrase must be unique across our system. 
                    This phrase is what connects customers to your specific restaurant when 
                    they scan your QR code, as our WhatsApp number serves many restaurants worldwide.
                  </p>
                </div>
              </div>
            )}

            {/* New Step: Sign Up */}
            {currentStep === 6 && !isSetupCompleted && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-[#EF476F]" />
                  <span className="text-sm font-medium text-[#EF476F]">Create your account!</span>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-xl mb-6 border border-blue-100">
                  <div className="flex items-start gap-2">
                    <Award className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-700">You're almost there!</p>
                      <p className="text-xs text-blue-600 mt-1">
                        Just one more step to go! Create your account now and in the next step, 
                        you'll be able to start using your WhatsApp Menu Bot service right away.
                        All your configuration will be saved with your account.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="full-name" className="text-gray-800 font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="full-name"
                    placeholder="John Doe"
                    value={userFullName}
                    onChange={(e) => setUserFullName(e.target.value)}
                    className="rounded-xl border-purple-200 focus:border-purple-400 focus:ring-purple-400 transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="email" className="text-gray-800 font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="rounded-xl border-purple-200 focus:border-purple-400 focus:ring-purple-400 transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password" className="text-gray-800 font-medium">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="rounded-xl border-purple-200 focus:border-purple-400 focus:ring-purple-400 transition-all"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="password-confirm" className="text-gray-800 font-medium">
                    Confirm Password
                  </Label>
                  <Input
                    id="password-confirm"
                    type="password"
                    placeholder="••••••••"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className={`rounded-xl transition-all ${
                      passwordConfirm.length > 0 && userPassword !== passwordConfirm
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-purple-200 focus:border-purple-400 focus:ring-purple-400"
                    }`}
                  />
                  {passwordConfirm.length > 0 && userPassword !== passwordConfirm && (
                    <p className="text-xs text-red-500">Passwords do not match</p>
                  )}
                </div>

                <div className="mt-4 bg-blue-50 rounded-xl p-3 border border-blue-100">
                  <p className="text-sm text-blue-700">
                    By creating an account, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            )}

            {/* Step 7: Success */}
            {(currentStep === 7 || isSetupCompleted) && (
              <div className="space-y-4 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ 
                    scale: 1,
                    opacity: 1 
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeOut"
                  }}
                  className="mx-auto mb-4 relative"
                >
                  {/* Effetti rock animati dietro */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Onde sonore */}
                    <motion.div
                      className="absolute w-40 h-40 border-4 border-yellow-400 rounded-full opacity-30"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.3, 0.1, 0.3]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.div
                      className="absolute w-32 h-32 border-4 border-orange-400 rounded-full opacity-40"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.4, 0.1, 0.4]
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.3
                      }}
                    />
                    <motion.div
                      className="absolute w-24 h-24 border-4 border-red-400 rounded-full opacity-50"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 0.1, 0.5]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.6
                      }}
                    />
                  </div>
                  
                  {/* Particelle rock */}
                  <motion.div
                    className="absolute -top-4 -left-4 w-3 h-3 bg-yellow-400 rounded-full"
                    animate={{
                      y: [0, -20, 0],
                      x: [0, -10, 0],
                      scale: [1, 0.5, 1],
                      opacity: [1, 0.3, 1]
                    }}
                    transition={{
                      duration: 1.2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <motion.div
                    className="absolute -top-2 -right-6 w-2 h-2 bg-orange-400 rounded-full"
                    animate={{
                      y: [0, -15, 0],
                      x: [0, 8, 0],
                      scale: [1, 0.3, 1],
                      opacity: [1, 0.2, 1]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.4
                    }}
                  />
                  <motion.div
                    className="absolute top-2 -left-6 w-2.5 h-2.5 bg-red-400 rounded-full"
                    animate={{
                      y: [0, -18, 0],
                      x: [0, -12, 0],
                      scale: [1, 0.4, 1],
                      opacity: [1, 0.25, 1]
                    }}
                    transition={{
                      duration: 1.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.8
                    }}
                  />
                  <motion.div
                    className="absolute -bottom-2 -right-4 w-3 h-3 bg-purple-400 rounded-full"
                    animate={{
                      y: [0, -25, 0],
                      x: [0, 15, 0],
                      scale: [1, 0.6, 1],
                      opacity: [1, 0.3, 1]
                    }}
                    transition={{
                      duration: 1.3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.2
                    }}
                  />
                  
                  {/* Note musicali */}
                  <motion.div
                    className="absolute -top-6 right-2 text-2xl"
                    animate={{
                      y: [0, -30, 0],
                      rotate: [0, 15, 0],
                      opacity: [1, 0.2, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    🎵
                  </motion.div>
                  <motion.div
                    className="absolute top-4 -right-8 text-xl"
                    animate={{
                      y: [0, -25, 0],
                      rotate: [0, -12, 0],
                      opacity: [1, 0.3, 1]
                    }}
                    transition={{
                      duration: 1.7,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  >
                    🎶
                  </motion.div>
                  <motion.div
                    className="absolute -bottom-4 left-0 text-lg"
                    animate={{
                      y: [0, -20, 0],
                      rotate: [0, 10, 0],
                      opacity: [1, 0.25, 1]
                    }}
                    transition={{
                      duration: 1.4,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                  >
                    🎼
                  </motion.div>

                  {/* Mascotte rock statica */}
                  <Image
                    src="/mascottes/mascotte_rock.png"
                    alt="Rock Star Mascot"
                    width={160}
                    height={160}
                    className="mx-auto drop-shadow-2xl relative z-10"
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
                    {triggerWord ? (
                      <div className="w-32 h-32 flex items-center justify-center border rounded-lg overflow-hidden">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://wa.me/393516541218?text=${encodeURIComponent(triggerWord)}`)}`}
                          alt="QR Code"
                          className="w-full h-full"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-mono">QR Code</span>
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">Scansiona questo codice QR con il tuo telefono</p>

                  <CustomButton 
                    variant="outline" 
                    size="sm" 
                    className="text-sm py-1 px-3"
                    onClick={() => {
                      const qrLink = `https://wa.me/393516541218?text=${encodeURIComponent(triggerWord)}`;
                      window.open(qrLink, '_blank');
                    }}
                  >
                    Open on Whatsapp
                  </CustomButton>
                  
                  <div className="mt-4 text-left bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-700">
                      <strong>Note:</strong> This QR code is configured to use our default WhatsApp number (+39 351 654 1218). 
                      In the app, you can request to activate your own business phone number for a more personalized experience.
                    </p>
                  </div>
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

          {currentStep < steps.length - 1 && !isSetupCompleted ? (
            <CustomButton 
              onClick={handleNext} 
              className="py-2 px-4"
              disabled={!isStepValid() || isSubmitting}
            >
              {isSubmitting && currentStep === 6 ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Creating Account...
                </>
              ) : (
                "Continue"
              )}
            </CustomButton>
          ) : (
            <CustomButton 
              onClick={(currentStep === steps.length - 1 || isSetupCompleted) ? handleFinalRedirect : handleComplete} 
              className="py-2 px-4"
              disabled={isSubmitting || isRedirecting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Processing...
                </>
              ) : isRedirecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Redirecting...
                </>
              ) : (currentStep === steps.length - 1 || isSetupCompleted) ? (
                "Go to Dashboard"
              ) : (
                "Finish Setup"
              )}
            </CustomButton>
          )}
        </div>
      </motion.div>
    </div>
  )
}

