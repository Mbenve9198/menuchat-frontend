"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { 
  MapPin, 
  Star, 
  Clock,
  X
} from "lucide-react"

// --- TYPES ---
interface RestaurantInfo {
  name: string
  profileImage?: string
  address?: {
    formattedAddress: string
  }
  googleRating?: {
    rating: number
    reviewCount: number
  }
  description?: string
}

interface DesignSettings {
  primaryColor: string
  secondaryColor: string
  backgroundColor: string
  textColor: string
  coverImageUrl?: string
  logoUrl?: string
  showImages: boolean
  showPrices: boolean
  hideDescription?: boolean
  hideIngredients?: boolean
  tagDisplayMode?: string
  fontFamily?: string
  suppliers?: Supplier[]
}

interface Supplier {
  id: string
  name: string
  logoUrl: string
  logoCloudinaryId?: string
  sortOrder: number
  isActive: boolean
}

interface Tag {
  id: string
  text: string
  color: string
  emoji?: string
}

interface Dish {
  id: string
  name: string
  price: number
  available: boolean
  photoUrl?: string
  tags: Tag[]
  description?: string
  ingredients?: string[]
}

interface Category {
  id: string
  name: string
  icon: string
  dishes: Dish[]
}

// Aggiungo l'interfaccia per le lingue supportate
interface SupportedLanguage {
  code: string
  name: string
  flag: string
  isDefault: boolean
}

interface MenuData {
  menu: {
    id: string
    name: string
    designSettings: DesignSettings
    supportedLanguages?: SupportedLanguage[]
  }
  categories: Category[]
  availableTags: Tag[]
  currentLanguage?: string
}

export default function PublicMenuPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const restaurantId = params.restaurantId as string
  const customerName = searchParams.get('customerName') || searchParams.get('name') || null
  
  // States
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>(null)
  const [menuData, setMenuData] = useState<MenuData | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>("")
  
  // Stati per il modal di dettaglio piatto
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null)
  const [showDishModal, setShowDishModal] = useState(false)
  
  // Stati per navigation intelligente
  const [showNavigation, setShowNavigation] = useState(true) // Mostra sempre inizialmente
  const navigationRef = useRef<HTMLDivElement>(null)
  const coverRef = useRef<HTMLDivElement>(null)

  // Stati per la gestione delle lingue
  const [currentLanguage, setCurrentLanguage] = useState('it')
  const [hasMultipleLanguages, setHasMultipleLanguages] = useState(false)
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false)
  const [availableLanguages, setAvailableLanguages] = useState<SupportedLanguage[]>([])
  const [isLoadingLanguage, setIsLoadingLanguage] = useState(false)

  // Aggiunge CSS per nascondere scrollbar
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .scrollbar-hide {
        -webkit-overflow-scrolling: touch;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Load data
  useEffect(() => {
    loadData()
  }, [restaurantId])

  // Polling automatico RIMOSSO per migliorare UX
  // (Era fastidioso per i clienti che stavano navigando il menu)

  // Ricaricamento automatico RIMOSSO per migliorare UX
  // (I clienti possono ricaricare manualmente se necessario)

  // Gestione tasto ESC per chiudere il modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showDishModal) {
        closeDishModal()
      }
    }

    if (showDishModal) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden' // Previene scroll della pagina
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset' // Ripristina scroll
    }
  }, [showDishModal])

  // Auto-selezione categoria durante scroll
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const categoryId = entry.target.id.replace('category-', '')
          setActiveCategory(categoryId)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    // Osserva tutte le categorie
    const categoryElements = document.querySelectorAll('[id^="category-"]')
    categoryElements.forEach((el) => observer.observe(el))

    return () => {
      categoryElements.forEach((el) => observer.unobserve(el))
    }
  }, [menuData])

  // Intersection Observer per mostrare/nascondere navigation quando la copertina non è visibile
  useEffect(() => {
    // Aspetta che menuData sia caricato
    if (!menuData) return

    // Se non c'è immagine di copertina, mantieni sempre la navigation visibile
    const coverImageUrl = menuData.menu?.designSettings?.coverImageUrl
    if (!coverImageUrl) {
      console.log('📄 Nessuna copertina, navigation sempre visibile')
      setShowNavigation(true)
      return
    }

    const coverElement = coverRef.current
    if (!coverElement) {
      console.log('⚠️ Cover element non trovato, mostro navigation')
      setShowNavigation(true)
      return
    }

    console.log('🔍 Setting up intersection observer for cover')

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        const isVisible = entry.isIntersecting
        console.log('📊 Cover visibility changed:', isVisible ? 'VISIBLE' : 'NOT VISIBLE')
        // Se la copertina è visibile, nascondi la navigation
        // Se la copertina non è visibile, mostra la navigation
        setShowNavigation(!isVisible)
      },
      { 
        threshold: 0.3, // Aumentato per essere più preciso
        rootMargin: '0px 0px -20px 0px'
      }
    )

    observer.observe(coverElement)
    return () => {
      console.log('🧹 Cleaning up cover observer')
      observer.unobserve(coverElement)
    }
  }, [menuData])

  // Auto-scroll orizzontale quando cambia categoria attiva
  useEffect(() => {
    if (!activeCategory || !navigationRef.current) return

    const navigationElement = navigationRef.current
    const activeCategoryButton = navigationElement.querySelector(`[data-category-id="${activeCategory}"]`) as HTMLElement

    if (activeCategoryButton) {
      const navRect = navigationElement.getBoundingClientRect()
      const buttonRect = activeCategoryButton.getBoundingClientRect()
      
      const isVisible = buttonRect.left >= navRect.left && buttonRect.right <= navRect.right
      
      if (!isVisible) {
        const scrollLeft = activeCategoryButton.offsetLeft - (navRect.width / 2) + (buttonRect.width / 2)
        navigationElement.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        })
      }
    }
  }, [activeCategory])



  // Load menu data with language support
  const loadData = async (languageCode?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const langToUse = languageCode || currentLanguage
      
      // Load restaurant info and menu data (parallel)
      const [restaurantResponse, menuResponse] = await Promise.all([
        fetch(`/api/restaurants-public/${restaurantId}`),
        fetch(`/api/menu/${restaurantId}${langToUse !== 'it' ? `?lang=${langToUse}` : ''}`)
      ])

      // Handle restaurant info
      if (restaurantResponse.ok) {
        const restaurantData = await restaurantResponse.json()
        if (restaurantData.success) {
          setRestaurantInfo(restaurantData.restaurant)
        }
      }

      // Handle menu data
      if (!menuResponse.ok) {
        throw new Error('Menu non trovato')
      }

      const menuData = await menuResponse.json()
      if (!menuData.success) {
        throw new Error(menuData.error || 'Errore nel caricamento del menu')
      }

      console.log('🔍 Menu data ricevuta:', menuData.data)
      
      setMenuData(menuData.data)
      
      // Update available languages and current language
      if (menuData.data.menu?.supportedLanguages) {
        setAvailableLanguages(menuData.data.menu.supportedLanguages)
        setHasMultipleLanguages(menuData.data.menu.supportedLanguages.length > 1)
      }
      
      if (menuData.data.currentLanguage) {
        setCurrentLanguage(menuData.data.currentLanguage)
      }
      
      // Set first category as active
      if (menuData.data.categories && menuData.data.categories.length > 0) {
        setActiveCategory(menuData.data.categories[0].id)
        console.log('✅ Prima categoria attiva:', menuData.data.categories[0].name)
      } else {
        console.log('⚠️ Nessuna categoria trovata!')
      }

    } catch (err: any) {
      console.error('Error loading data:', err)
      setError(err.message || 'Errore nel caricamento')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle language change
  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === currentLanguage) return
    
    setIsLoadingLanguage(true)
    await loadData(languageCode)
    setIsLoadingLanguage(false)
  }

  // Get only tags that are actually used by available dishes, sorted by popularity
  const getUsedTags = () => {
    if (!menuData) return []

    const tagUsageMap = new Map() // text -> { tag, count }
    
    menuData.categories.forEach(category => {
      category.dishes.forEach(dish => {
        if (dish.available) {
          dish.tags.forEach(tag => {
            const existing = tagUsageMap.get(tag.text)
            if (existing) {
              existing.count++
            } else {
              tagUsageMap.set(tag.text, { tag, count: 1 })
            }
          })
        }
      })
    })

    // Ordinamento per popolarità (count) e poi alfabeticamente
    return Array.from(tagUsageMap.values())
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count // Più usati per primi
        }
        return a.tag.text.localeCompare(b.tag.text) // Alfabeticamente se stesso count
      })
      .map(item => item.tag)
  }

  // Filter dishes based on search and tags
  const getFilteredCategories = () => {
    if (!menuData) return []

    const allCategories = menuData.categories.map(category => ({
      ...category,
      dishes: category.dishes.filter(dish => {
        // Tag filter - controlla se il piatto ha almeno uno dei tag selezionati
        const matchesTags = selectedTags.length === 0 || 
          selectedTags.some(tagText => 
            dish.tags.some(tag => tag.text === tagText)
          )

        // Available filter
        const isAvailable = dish.available

        return matchesTags && isAvailable
      })
    })).filter(category => category.dishes.length > 0)
    
    console.log('🔍 Filtri applicati:')
    console.log('   - Tag selezionati:', selectedTags)
    console.log('   - Categorie totali:', menuData.categories.length)
    console.log('   - Categorie dopo filtro:', allCategories.length)
    
    if (allCategories.length === 0 && menuData.categories.length > 0) {
      console.log('⚠️ Tutte le categorie sono state filtrate! Dettagli:')
      menuData.categories.forEach(cat => {
        console.log(`   Categoria "${cat.name}": ${cat.dishes.length} piatti totali`)
        const availableDishes = cat.dishes.filter(d => d.available)
        console.log(`   - ${availableDishes.length} piatti disponibili`)
      })
    }
    
    return allCategories
  }

  const scrollToCategory = (categoryId: string) => {
    setActiveCategory(categoryId)
    const element = document.getElementById(`category-${categoryId}`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const toggleTag = (tagText: string) => {
    setSelectedTags(prev => 
      prev.includes(tagText) 
        ? prev.filter(text => text !== tagText)
        : [...prev, tagText]
    )
  }

  const clearFilters = () => {
    setSelectedTags([])
  }

  const openDishModal = (dish: Dish) => {
    setSelectedDish(dish)
    setShowDishModal(true)
  }

  const closeDishModal = () => {
    setSelectedDish(null)
    setShowDishModal(false)
  }

  // Funzione per ottenere emoji appropriate per i tag
  const getTagEmoji = (tagText: string, tagObject?: Tag) => {
    // Se il tag ha un'emoji dal database, usala
    if (tagObject?.emoji) {
      return tagObject.emoji
    }
    
    // Altrimenti usa la logica di fallback
    const text = tagText.toLowerCase()
    if (text.includes('vegano') || text.includes('vegan')) return '🌱'
    if (text.includes('vegetariano') || text.includes('vegetarian')) return '🥬'
    if (text.includes('glutine') || text.includes('gluten')) return '🌾'
    if (text.includes('piccante') || text.includes('spicy')) return '🌶️'
    if (text.includes('bio') || text.includes('organic')) return '🌿'
    if (text.includes('senza lattosio') || text.includes('lactose')) return '🥛'
    if (text.includes('proteico') || text.includes('protein')) return '🥩'
    if (text.includes('dolce') || text.includes('sweet')) return '🍯'
    if (text.includes('fresco') || text.includes('fresh')) return '❄️'
    if (text.includes('caldo') || text.includes('hot')) return '🔥'
    if (text.includes('stagionale') || text.includes('seasonal')) return '🍂'
    if (text.includes('locale') || text.includes('local')) return '🏘️'
    if (text.includes('mare') || text.includes('sea') || text.includes('pesce')) return '🐟'
    if (text.includes('carne') || text.includes('meat')) return '🥩'
    if (text.includes('healthy') || text.includes('salutare')) return '💚'
    if (text.includes('formaggio') || text.includes('cheese')) return '🧀'
    return '🏷️'
  }

  // Funzione per renderizzare le etichette basata su tagDisplayMode
  // Funzione per ottenere la classe CSS del font
  const getFontClass = (fontFamily: string) => {
    const fontMap: { [key: string]: string } = {
      'Inter': 'font-sans',
      'Cooper': 'font-cooper',
      'Roboto': 'font-roboto',
      'Poppins': 'font-poppins',
      'Playfair Display': 'font-playfair',
      'Montserrat': 'font-montserrat',
      'Merriweather': 'font-merriweather',
      'Oswald': 'font-oswald',
      'Dancing Script': 'font-dancing'
    }
    
    return fontMap[fontFamily] || 'font-sans'
  }

  const renderTag = (tag: Tag, isFilter: boolean = false) => {
    const tagDisplayMode = designSettings.tagDisplayMode || 'full'
    
    // Per i filtri, usiamo sempre il formato completo per chiarezza
    if (isFilter) {
      return (
        <>
          <span className="text-base">{getTagEmoji(tag.text, tag)}</span>
          {tag.text}
        </>
      )
    }
    
    // Per le etichette sui piatti, rispettiamo tagDisplayMode
    switch (tagDisplayMode) {
      case 'emoji-only':
        return (
          <span className="text-base" title={tag.text}>
            {getTagEmoji(tag.text, tag)}
          </span>
        )
      case 'hidden':
        return null
      case 'full':
      default:
        return (
          <>
            <span>{getTagEmoji(tag.text, tag)}</span>
            {tag.text}
          </>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento menu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => loadData()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  if (!menuData) return null

  // Design settings con valori di default
  const defaultDesignSettings = {
    primaryColor: '#3B82F6',
    secondaryColor: '#64748B', 
    backgroundColor: '#F9FAFB',
    textColor: '#1F2937',
    showImages: true,
    showPrices: true,
    hideDescription: false,
    hideIngredients: false,
    coverImageUrl: '',
    logoUrl: '',
    tagDisplayMode: 'full',
    fontFamily: 'Inter'
  }
  
  const designSettings = {
    ...defaultDesignSettings,
    ...(menuData.menu?.designSettings || {})
  }
  
  console.log('🎨 Design settings utilizzate:', designSettings)
  
  const filteredCategories = getFilteredCategories()
  const usedTags = getUsedTags()
  
  console.log('📋 Categorie filtrate:', filteredCategories.length, filteredCategories)
  console.log('🏷️ Tag utilizzati:', usedTags.length, usedTags)

  return (
    <div 
      className={`min-h-screen bg-gray-50 ${getFontClass(designSettings.fontFamily || 'Inter')}`}
      style={{ 
        backgroundColor: designSettings.backgroundColor,
        color: designSettings.textColor 
      }}
    >
      {/* Cover Image */}
      {designSettings.coverImageUrl && (
        <div ref={coverRef} className="relative h-48 w-full">
          <Image
            src={designSettings.coverImageUrl}
            alt="Cover"
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Header with floating profile */}
      <div className="relative">
        {/* Profile Image floating - moved to left */}
        {(designSettings.logoUrl || restaurantInfo?.profileImage) && (
          <div className={`absolute ${designSettings.coverImageUrl ? '-top-12' : 'top-4'} left-6 z-10`}>
            <div className="w-20 h-20 rounded-full bg-white p-1 shadow-xl">
              <img
                src={designSettings.logoUrl || restaurantInfo?.profileImage}
                alt={restaurantInfo?.name || 'Restaurant'}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
          </div>
        )}

        {/* Language Selector - top right */}
        {hasMultipleLanguages && availableLanguages.length > 1 && (
          <div className={`absolute ${designSettings.coverImageUrl ? '-top-8' : 'top-8'} right-6 z-10`}>
            <div className="relative">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full shadow-xl flex items-center justify-center border-2 border-white hover:shadow-2xl transition-all duration-200"
                disabled={isLoadingLanguage}
              >
                {isLoadingLanguage ? (
                  <div className="animate-spin w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
                ) : (
                  <span className="text-xl">
                    {availableLanguages.find(lang => lang.code === currentLanguage)?.flag || '🌍'}
                  </span>
                )}
              </button>

              {/* Dropdown menu */}
              {showLanguageDropdown && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute top-14 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden min-w-[160px] z-50"
                >
                  {availableLanguages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        handleLanguageChange(language.code)
                        setShowLanguageDropdown(false)
                      }}
                      disabled={isLoadingLanguage || language.code === currentLanguage}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                        language.code === currentLanguage 
                          ? 'bg-blue-50 text-blue-700 font-medium' 
                          : 'text-gray-700'
                      } ${isLoadingLanguage ? 'opacity-50' : ''}`}
                    >
                      <span className="text-lg">{language.flag}</span>
                      <span className="flex-1">{language.name}</span>
                      {language.code === currentLanguage && (
                        <span className="text-blue-500 text-sm">✓</span>
                      )}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        )}

        {/* Main content with wave top - più compatto */}
        <div 
          className="bg-white shadow-sm" 
          style={designSettings.coverImageUrl ? {
            clipPath: 'ellipse(100% 100% at 50% 0%)',
            paddingTop: '20px' // Ridotto da 40px
          } : {}}
          ref={!designSettings.coverImageUrl ? coverRef : undefined}
        >
          <div className={`max-w-4xl mx-auto px-4 ${designSettings.coverImageUrl ? 'pt-4 pb-2' : 'pt-12 pb-2'}`}>
            <div className="text-left ml-28">
              {/* Personalized Greeting - più piccolo */}
              {customerName && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-base font-medium mb-1"
                  style={{ color: designSettings.primaryColor }}
                >
                  Ciao <span className="font-bold">{customerName}</span>! 👋
                </motion.p>
              )}

              {restaurantInfo?.address && (
                <div className="flex items-center gap-1 text-gray-600 text-sm mb-1">
                  <MapPin className="w-4 h-4" />
                  <span>{restaurantInfo.address.formattedAddress}</span>
                </div>
              )}

              {restaurantInfo?.googleRating && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{restaurantInfo.googleRating.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-gray-500">
                    ({restaurantInfo.googleRating.reviewCount} recensioni)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Smart Navigation - appare solo quando la copertina non è visibile */}
      {showNavigation && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ 
            duration: 0.3,
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
          className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-lg"
        >
          <div className="max-w-4xl mx-auto p-3">
            {/* Filter Tags - solo quelli utilizzati con scorrimento orizzontale */}
            {usedTags.length > 0 && (
              <div className="mb-3">
                <div className="relative">
                  {/* Indicatore gradiente sinistra */}
                  <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-white/95 to-transparent z-10 pointer-events-none" />
                  
                  {/* Container scorrevole */}
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {usedTags.map((tag) => (
                      <motion.button
                        key={tag.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleTag(tag.text)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${
                          selectedTags.includes(tag.text)
                            ? `${tag.color} text-white shadow-lg`
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                        }`}
                      >
                        {renderTag(tag, true)}
                      </motion.button>
                    ))}
                  </div>
                  
                  {/* Indicatore gradiente destra */}
                  <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white/95 to-transparent z-10 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Clear Filters */}
            {selectedTags.length > 0 && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 mb-2"
              >
                <X className="w-3 h-3" />
                Cancella filtri
              </motion.button>
            )}

            {/* Category Navigation - mobile-friendly con indicatori scorrimento */}
            <div className="relative">
              {/* Indicatore gradiente sinistra */}
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white/95 to-transparent z-10 pointer-events-none" />
              
              {/* Container scorrevole */}
              <div 
                ref={navigationRef}
                className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide px-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {filteredCategories.map((category) => (
                  <motion.button
                    key={category.id}
                    data-category-id={category.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => scrollToCategory(category.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap transition-all text-sm font-medium shadow-sm ${
                      activeCategory === category.id
                        ? "text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-md"
                    }`}
                    style={{
                      backgroundColor: activeCategory === category.id ? designSettings.primaryColor : undefined
                    }}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-semibold">{category.name}</span>
                    <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded-full">
                      {category.dishes.length}
                    </span>
                  </motion.button>
                ))}
              </div>
              
              {/* Indicatore gradiente destra */}
              <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white/95 to-transparent z-10 pointer-events-none" />
              

            </div>
          </div>
        </motion.div>
      )}

      {/* Menu Content */}
      <div className={`max-w-4xl mx-auto px-4 pb-8 ${showNavigation ? 'pt-20' : 'pt-2'}`}>
        {filteredCategories.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-8xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Nessun piatto trovato</h3>
            {selectedTags.length > 0 ? (
              <div className="max-w-md mx-auto">
                <p className="text-gray-600 mb-4">
                  Non ci sono piatti che corrispondono ai filtri selezionati:
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {selectedTags.map((tagText, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                      {getTagEmoji(tagText)} {tagText}
                    </span>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={clearFilters}
                  className="px-6 py-3 text-white rounded-xl shadow-lg font-semibold"
                  style={{ backgroundColor: designSettings.primaryColor }}
                >
                  ✨ Mostra tutti i piatti
                </motion.button>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  Tutti i piatti sono attualmente non disponibili
                </p>
                <p className="text-gray-500 text-sm">
                  💡 Puoi ricaricare la pagina se pensi sia un errore
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <div className="space-y-6">
            {filteredCategories.map((category) => (
              <motion.div
                key={category.id}
                id={`category-${category.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                {/* Category Header */}
                <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
                  <span className="text-3xl">{category.icon}</span>
                  <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                  <span className="text-gray-500 text-sm">({category.dishes.length})</span>
                </div>

                {/* Dishes */}
                <div className="space-y-4">
                  {category.dishes.map((dish) => (
                    <motion.div
                      key={dish.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ 
                        duration: 0.2,
                        type: "spring", 
                        stiffness: 300,
                        damping: 20
                      }}
                      onClick={() => openDishModal(dish)}
                      className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
                      style={{
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
                      }}
                    >
                      <div className="flex gap-5">
                        {/* Dish Image - Larger */}
                        {designSettings.showImages && dish.photoUrl && (
                          <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                            <img
                              src={dish.photoUrl}
                              alt={dish.name}
                              className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                            />
                          </div>
                        )}

                        {/* Dish Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start gap-3 mb-2">
                            <h3 className="font-bold text-xl text-gray-900 leading-tight">
                              {dish.name}
                            </h3>
                            {designSettings.showPrices && (
                              <span 
                                className="font-bold text-lg whitespace-nowrap"
                                style={{ color: designSettings.primaryColor }}
                              >
                                €{dish.price.toFixed(2)}
                              </span>
                            )}
                          </div>

                          {dish.description && !designSettings.hideDescription && (
                            <div className="text-gray-600 text-base mt-2 leading-relaxed">
                              {dish.description.length > 120 ? (
                                <p>
                                  {dish.description.substring(0, 120)}...{' '}
                                  <button 
                                    onClick={() => setSelectedDish(dish)}
                                    className="text-blue-600 hover:text-blue-800 font-medium underline"
                                  >
                                    leggi tutto
                                  </button>
                                </p>
                              ) : (
                                <p>{dish.description}</p>
                              )}
                            </div>
                          )}

                          {dish.ingredients && dish.ingredients.length > 0 && !designSettings.hideIngredients && (
                            <div className="mt-3">
                              <span className="text-gray-700 font-medium text-sm">Ingredienti: </span>
                              <span className="text-gray-500 text-sm">{dish.ingredients.join(', ')}</span>
                            </div>
                          )}

                          {dish.tags.length > 0 && designSettings.tagDisplayMode !== 'hidden' && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {dish.tags.map((tag) => {
                                const tagContent = renderTag(tag, false)
                                if (!tagContent) return null
                                
                                return (
                                  <span
                                    key={tag.id}
                                    className={`flex items-center ${designSettings.tagDisplayMode === 'emoji-only' ? 'gap-0 text-lg' : 'gap-1'} px-3 py-1 rounded-full text-xs font-bold text-white shadow-md ${tag.color}`}
                                  >
                                    {tagContent}
                                  </span>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto">
          {/* Suppliers Section */}
          {designSettings.suppliers && designSettings.suppliers.length > 0 && (
            <div className="py-10 px-6">
              <h3 className="text-center text-xl font-bold text-gray-800 mb-8">
                I nostri fornitori
              </h3>
              
              {/* Scrolling Suppliers Container */}
              <div className="relative overflow-hidden">
                <div className="flex animate-scroll-x space-x-12 w-max">
                  {/* Duplicate suppliers for seamless loop */}
                  {[...designSettings.suppliers, ...designSettings.suppliers].map((supplier, index) => (
                    <div 
                      key={`${supplier.id || (supplier as any)._id || index}-${index}`}
                      className="flex flex-col items-center space-y-3 min-w-[160px]"
                    >
                      <div className="w-24 h-24 bg-white rounded-xl border-2 border-gray-200 flex items-center justify-center p-3 shadow-sm">
                        <img
                          src={supplier.logoUrl}
                          alt={supplier.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                      <p className="text-sm text-gray-700 text-center font-semibold leading-tight max-w-[140px]">
                        {supplier.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Powered by MenuChat */}
          <div className="p-6 text-center text-gray-500 text-sm border-t border-gray-100">
            <p>Powered by <span className="font-medium">MenuChat</span></p>
          </div>
        </div>
      </div>

      {/* Dish Detail Modal */}
      {showDishModal && selectedDish && (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
            onClick={closeDishModal}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ 
              duration: 0.3,
              type: "spring",
              stiffness: 300,
              damping: 30
            }}
            className="relative bg-white w-full max-w-2xl mx-0 rounded-t-3xl md:rounded-3xl md:mx-4 max-h-[95vh] md:max-h-[90vh] overflow-hidden shadow-2xl"
            style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)'
            }}
          >
            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={closeDishModal}
              className="absolute top-3 right-3 md:top-4 md:right-4 z-10 w-10 h-10 md:w-12 md:h-12 bg-white bg-opacity-95 rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl transition-all"
            >
              <X className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
            </motion.button>

            {/* Dish Image */}
            {designSettings.showImages && selectedDish.photoUrl && (
              <div className="relative h-48 md:h-80 bg-gray-200 overflow-hidden">
                <motion.img
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                  src={selectedDish.photoUrl}
                  alt={selectedDish.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            )}

            {/* Content */}
            <div className="p-4 md:p-6 space-y-4 md:space-y-5 overflow-y-auto pb-6 md:pb-8"
                 style={{ maxHeight: 'calc(95vh - 120px)' }}>
              {/* Title and Price */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-3"
              >
                <h2 className="text-2xl md:text-4xl font-bold text-gray-900 leading-tight">
                  {selectedDish.name}
                </h2>
                
                {designSettings.showPrices && (
                  <div className="flex items-center">
                    <span 
                      className="text-2xl md:text-3xl font-bold px-3 py-2 md:px-4 rounded-xl shadow-lg"
                      style={{ 
                        color: designSettings.primaryColor,
                        backgroundColor: `${designSettings.primaryColor}15`
                      }}
                    >
                      €{selectedDish.price.toFixed(2)}
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Description */}
              {selectedDish.description && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-3"
                >
                  <h3 className="font-bold text-base md:text-lg text-gray-900 flex items-center gap-2">
                    <span>📝</span> Descrizione
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-base md:text-lg">
                    {selectedDish.description}
                  </p>
                </motion.div>
              )}

              {/* Ingredients */}
              {selectedDish.ingredients && selectedDish.ingredients.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-3"
                >
                  <h3 className="font-bold text-base md:text-lg text-gray-900 flex items-center gap-2">
                    <span>🥘</span> Ingredienti
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedDish.ingredients.map((ingredient, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="px-4 py-2 bg-gray-50 text-gray-700 rounded-full text-sm font-medium shadow-sm border"
                      >
                        {ingredient}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tags */}
              {selectedDish.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-3"
                >
                  <h3 className="font-bold text-base md:text-lg text-gray-900 flex items-center gap-2">
                    <span>⭐</span> Caratteristiche
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {selectedDish.tags.map((tag, index) => (
                      <motion.span
                        key={tag.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white shadow-lg ${tag.color}`}
                      >
                        <span>{getTagEmoji(tag.text, tag)}</span>
                        {tag.text}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
} 