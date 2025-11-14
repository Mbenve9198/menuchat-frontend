"use client"

import * as React from "react"

// Custom CSS per animation delays
const customStyles = `
  .animation-delay-300 { animation-delay: 300ms; }
  .animation-delay-600 { animation-delay: 600ms; }
  
  /* Stili per drag and drop */
  .dish-dragging {
    cursor: grabbing !important;
    transform: rotate(2deg);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    z-index: 1000;
  }
  
  .category-drop-target {
    transition: all 0.2s ease;
  }
  
  .category-drop-target.is-over {
    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
    border-color: #3b82f6;
    transform: scale(1.02);
  }
`
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import {
  Sparkles,
  Eye,
  Copy,
  PlusCircle,
  Upload,
  Trash2,
  DollarSign,
  Percent,
  Plus,
  FileText,
  ImageIcon,
  Loader2,
  Zap,
  Check,
  Camera,
  X,
  GripVertical,
  Search,
  Wand2,
  Edit3,
} from "lucide-react"
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { CustomButton } from "@/components/ui/custom-button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { MultipleMediaUpload } from "@/components/ui/multiple-media-upload"
import { MediaUpload } from "@/components/ui/media-upload"
import { AsyncTaskProgress } from "@/components/ui/async-task-progress"
import { useToast } from "@/hooks/use-toast"

// --- TYPES ---
type Tag = { 
  id: string
  text: string
  color: string
  emoji?: string
}

type Variant = {
  name: string
  price: number
  available: boolean
}

type Dish = {
  id: string
  name: string
  price: number
  available: boolean
  photoUrl?: string
  tags: Tag[]
  description?: string
  ingredients?: string[]
  variants?: Variant[]
}

type Category = {
  id: string
  name: string
  icon: string
  dishes: Dish[]
}

type Supplier = {
  id: string
  name: string
  logoUrl: string
  logoCloudinaryId?: string
  sortOrder: number
  isActive: boolean
}

type MenuData = {
  menu: {
    id: string
    name: string
    menuType: string
  }
  categories: Category[]
  availableTags: Tag[]
  allItems: any[]
}

// --- SORTABLE DISH COMPONENT ---
const SortableDish = ({
  dish,
  onUpdateDish,
  onDuplicateDish,
  onDeleteDish,
  availableTags,
  restaurantId,
  showBulkCheckbox = false,
  isSelectedForBulk = false,
  onBulkToggle,
}: {
  dish: Dish
  onUpdateDish: (updatedDish: Dish) => void
  onDuplicateDish: () => void
  onDeleteDish: () => void
  availableTags: Tag[]
  restaurantId: string
  showBulkCheckbox?: boolean
  isSelectedForBulk?: boolean
  onBulkToggle?: (dishId: string) => void
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: dish.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "z-50" : ""}>
      <DishAccordionItem
        dish={dish}
        onUpdateDish={onUpdateDish}
        onDuplicateDish={onDuplicateDish}
        onDeleteDish={onDeleteDish}
        availableTags={availableTags}
        restaurantId={restaurantId}
        showBulkCheckbox={showBulkCheckbox}
        isSelectedForBulk={isSelectedForBulk}
        onBulkToggle={onBulkToggle}
        dragAttributes={attributes}
        dragListeners={listeners}
        isDragging={isDragging}
      />
    </div>
  )
}

// --- DISH COMPONENT ---
const DishAccordionItem = ({
  dish,
  onUpdateDish,
  onDuplicateDish,
  onDeleteDish,
  availableTags,
  restaurantId,
  showBulkCheckbox = false,
  isSelectedForBulk = false,
  onBulkToggle,
  dragAttributes,
  dragListeners,
  isDragging = false,
}: {
  dish: Dish
  onUpdateDish: (updatedDish: Dish) => void
  onDuplicateDish: () => void
  onDeleteDish: () => void
  availableTags: Tag[]
  restaurantId: string
  showBulkCheckbox?: boolean
  isSelectedForBulk?: boolean
  onBulkToggle?: (dishId: string) => void
  dragAttributes?: any
  dragListeners?: any
  isDragging?: boolean
}) => {
  const { toast } = useToast()
  const [name, setName] = React.useState(dish.name)
  const [price, setPrice] = React.useState(dish.price.toFixed(2))
  const [description, setDescription] = React.useState(dish.description || "")
  const [ingredients, setIngredients] = React.useState((dish.ingredients || []).join(", "))
  const [newTagText, setNewTagText] = React.useState("")
  const [isCreatingTag, setIsCreatingTag] = React.useState(false)
  
  // Stati per le varianti
  const [hasVariants, setHasVariants] = React.useState(dish.variants && dish.variants.length > 0)
  const [variants, setVariants] = React.useState<Variant[]>(dish.variants || [])
  const [localVariantsModified, setLocalVariantsModified] = React.useState(false)
  
  // Stati per gestione immagine
  const [showImageDialog, setShowImageDialog] = React.useState(false)
  const [isUpdatingImage, setIsUpdatingImage] = React.useState(false)
  
  // Stati per generazione AI
  const [isGeneratingDescription, setIsGeneratingDescription] = React.useState(false)
  const [isGeneratingIngredients, setIsGeneratingIngredients] = React.useState(false)
  
  // Stati per generazione immagine AI
  const [showImageGenerationDialog, setShowImageGenerationDialog] = React.useState(false)
  const [isGeneratingImage, setIsGeneratingImage] = React.useState(false)
  const [customPrompt, setCustomPrompt] = React.useState('')
  const [useAutoPrompt, setUseAutoPrompt] = React.useState(true)
  const [imageGenerationTaskId, setImageGenerationTaskId] = React.useState<string | null>(null)
  
  // Stati per miglioramento immagine AI
  const [isEnhancingImage, setIsEnhancingImage] = React.useState(false)
  const [imageEnhancementTaskId, setImageEnhancementTaskId] = React.useState<string | null>(null)

  React.useEffect(() => {
    setName(dish.name)
    setPrice(dish.price.toFixed(2))
    setDescription(dish.description || "")
    setIngredients((dish.ingredients || []).join(", "))
    
    // Aggiorna le varianti solo se NON sono state modificate localmente
    if (!localVariantsModified) {
      if (dish.variants && dish.variants.length > 0) {
        setHasVariants(true)
        setVariants(dish.variants)
      } else {
        setHasVariants(false)
        setVariants([])
      }
    }
  }, [dish, localVariantsModified])

  const handleFieldBlur = async (field: "name" | "description" | "ingredients" | "price") => {
    const updates: any = {}
    
    if (field === "name" && name.trim() && name !== dish.name) {
      const trimmedName = name.trim()
      if (trimmedName.length > 150) {
        alert('Il nome del piatto non può superare i 150 caratteri')
        setName(dish.name)
        return
      }
      updates.name = trimmedName
    } else if (field === "description" && description !== (dish.description || "")) {
      if (description.length > 700) {
        alert('La descrizione non può superare i 700 caratteri')
        setDescription(dish.description || '')
        return
      }
      updates.description = description
    } else if (field === "ingredients" && ingredients !== (dish.ingredients || []).join(", ")) {
      updates.ingredients = ingredients.split(",").map(i => i.trim()).filter(Boolean)
    } else if (field === "price") {
      const newPrice = parseFloat(price)
      if (!isNaN(newPrice) && newPrice !== dish.price) {
        updates.price = newPrice
      } else {
        setPrice(dish.price.toFixed(2))
        return
      }
    }

    if (Object.keys(updates).length > 0) {
      try {
        const response = await fetch(`/api/menu/item/${dish.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        })
        
        if (response.ok) {
          onUpdateDish({ ...dish, ...updates })
        } else {
          const errorData = await response.json()
          if (errorData.field === 'description' && errorData.currentLength) {
            alert(`La descrizione è troppo lunga: ${errorData.currentLength}/${errorData.maxLength} caratteri`)
            setDescription(dish.description || '')
          } else if (errorData.field === 'name' && errorData.currentLength) {
            alert(`Il nome è troppo lungo: ${errorData.currentLength}/${errorData.maxLength} caratteri`)
            setName(dish.name)
          } else {
            alert(errorData.error || 'Errore nel salvataggio')
          }
        }
      } catch (err) {
        console.error('Error updating dish:', err)
        alert('Errore di connessione. Riprova.')
      }
    }
  }

  const toggleTag = async (tag: Tag) => {
    const hasTag = dish.tags.some((t) => t.id === tag.id)
    
    // Se sta aggiungendo un tag e già ne ha 2, blocca l'operazione
    if (!hasTag && dish.tags.length >= 2) {
      toast({
        title: "🏷️ Limite etichette raggiunto",
        description: "Puoi assegnare massimo 2 etichette per piatto. Rimuovi prima un'etichetta esistente.",
        variant: "destructive",
        duration: 4000,
      })
      return
    }
    
    const newTags = hasTag 
      ? dish.tags.filter((t) => t.id !== tag.id)
      : [...dish.tags, tag]

    try {
      const response = await fetch(`/api/menu/item/${dish.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tags: newTags.map(t => t.id) })
      })
      
      if (response.ok) {
        onUpdateDish({ ...dish, tags: newTags })
      }
    } catch (err) {
      console.error('Error updating tags:', err)
    }
  }

  const createNewTag = async () => {
    if (newTagText.trim()) {
      // Controlla se già ha 2 tag prima di aggiungere un nuovo tag
      if (dish.tags.length >= 2) {
        toast({
          title: "🏷️ Limite etichette raggiunto",
          description: "Puoi assegnare massimo 2 etichette per piatto. Rimuovi prima un'etichetta esistente.",
          variant: "destructive",
          duration: 4000,
        })
        setIsCreatingTag(false)
        setNewTagText("")
        return
      }
      
      try {
        const response = await fetch('/api/menu/tag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurantId,
            text: newTagText.trim(),
            color: 'bg-blue-200'
          })
        })
        
        if (response.ok) {
          const result = await response.json()
          const newTag = result.tag
          // Aggiorna la lista globale dei tag disponibili
          const updatedAvailableTags = [...availableTags, newTag]
          onUpdateDish({ ...dish, tags: [...dish.tags, newTag] })
          setNewTagText("")
          setIsCreatingTag(false)
          // Notifica il componente parent per aggiornare la lista globale
          window.dispatchEvent(new CustomEvent('tagsUpdated', { detail: updatedAvailableTags }))
        }
      } catch (err) {
        console.error('Error creating tag:', err)
      }
    }
  }

  const handleAvailabilityChange = async (available: boolean) => {
    try {
      const response = await fetch(`/api/menu/item/${dish.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ available })
      })
      
      if (response.ok) {
        onUpdateDish({ ...dish, available })
      }
    } catch (err) {
      console.error('Error updating availability:', err)
    }
  }

  const handleImageUpload = async (fileUrl: string, fileType: "image" | "video" | "pdf") => {
    if (fileType !== "image") {
      alert("Solo le immagini sono supportate per i piatti")
      return
    }

    try {
      setIsUpdatingImage(true)
      const response = await fetch(`/api/menu/item/${dish.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl: fileUrl })
      })
      
      if (response.ok) {
        onUpdateDish({ ...dish, photoUrl: fileUrl })
        setShowImageDialog(false)
      } else {
        alert("Errore nell'aggiornamento dell'immagine")
      }
    } catch (err) {
      console.error('Error updating image:', err)
      alert("Errore nell'aggiornamento dell'immagine")
    } finally {
      setIsUpdatingImage(false)
    }
  }

  const handleImageDelete = async () => {
    if (!dish.photoUrl) return
    
    if (!confirm("Sei sicuro di voler eliminare l'immagine di questo piatto?")) {
      return
    }

    try {
      setIsUpdatingImage(true)
      const response = await fetch(`/api/menu/item/${dish.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl: "" })
      })
      
      if (response.ok) {
        onUpdateDish({ ...dish, photoUrl: "" })
        setShowImageDialog(false)
      } else {
        alert("Errore nell'eliminazione dell'immagine")
      }
    } catch (err) {
      console.error('Error deleting image:', err)
      alert("Errore nell'eliminazione dell'immagine")
    } finally {
      setIsUpdatingImage(false)
    }
  }

  const handleGenerateDescription = async () => {
    try {
      setIsGeneratingDescription(true)
      const response = await fetch(`/api/menu/item/${dish.id}/generate-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'description',
          autoUpdate: true
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data?.description) {
          setDescription(result.data.description)
          onUpdateDish({ ...dish, description: result.data.description })
        } else {
          alert('Errore nella generazione della descrizione')
        }
      } else {
        const errorData = await response.json()
        alert(`Errore: ${errorData.error || 'Errore nella generazione della descrizione'}`)
      }
    } catch (err) {
      console.error('Error generating description:', err)
      alert('Errore nella generazione della descrizione')
    } finally {
      setIsGeneratingDescription(false)
    }
  }

  const handleGenerateIngredients = async () => {
    try {
      setIsGeneratingIngredients(true)
      const response = await fetch(`/api/menu/item/${dish.id}/generate-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ingredients',
          autoUpdate: true
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data?.ingredients) {
          const ingredientsText = result.data.ingredients.join(', ')
          setIngredients(ingredientsText)
          onUpdateDish({ ...dish, ingredients: result.data.ingredients })
        } else {
          alert('Errore nella generazione degli ingredienti')
        }
      } else {
        const errorData = await response.json()
        alert(`Errore: ${errorData.error || 'Errore nella generazione degli ingredienti'}`)
      }
    } catch (err) {
      console.error('Error generating ingredients:', err)
      alert('Errore nella generazione degli ingredienti')
    } finally {
      setIsGeneratingIngredients(false)
    }
  }

  const handleGenerateImage = async () => {
    try {
      setIsGeneratingImage(true)
      setImageGenerationTaskId(null)
      
      const requestBody = {
        useAutoPrompt,
        ...(useAutoPrompt ? {} : { customPrompt })
      }
      
      console.log('🎨 Avvio generazione immagine AI asincrona...', requestBody)
      
      const response = await fetch(`/api/menu/item/${dish.id}/generate-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.taskId) {
          console.log('✅ Task generazione immagine avviato:', result.taskId)
          setImageGenerationTaskId(result.taskId)
        } else {
          console.error('❌ Errore nella risposta:', result)
          alert('❌ Errore nell\'avvio della generazione immagine')
          setIsGeneratingImage(false)
        }
      } else {
        const errorData = await response.json()
        console.error('❌ Errore HTTP:', response.status, errorData)
        alert(`❌ Errore: ${errorData.error || 'Errore nell\'avvio della generazione'}`)
        setIsGeneratingImage(false)
      }
    } catch (err) {
      console.error('❌ Errore di rete:', err)
      toast({
        title: "❌ Errore di connessione",
        description: "Impossibile generare l'immagine. Verifica la connessione internet.",
        variant: "destructive",
        duration: 4000,
      })
      setIsGeneratingImage(false)
    }
  }

  const handleImageGenerationComplete = (result: any) => {
    try {
      console.log('✅ Generazione immagine completata:', result)
      console.log('📊 Dettagli result ricevuto:', {
        photoUrl: result.photoUrl,
        dishId: result.dishId,
        dishName: result.dishName,
        updatedAt: result.updatedAt,
        hasAllData: !!(result.photoUrl && result.dishId)
      })
      
      // Reset stati in modo più robusto con timeout per evitare re-render issues
      setTimeout(() => {
        setImageGenerationTaskId(null)
        setIsGeneratingImage(false)
        setShowImageGenerationDialog(false)
        setShowImageDialog(false)
        setCustomPrompt('') // Reset anche il prompt personalizzato
        setUseAutoPrompt(true) // Reset alla modalità automatica
      }, 100)
      
      if (result.photoUrl) {
        console.log('🖼️ Aggiornamento piatto con nuova immagine:', result.photoUrl)
        console.log('📝 Piatto prima dell\'aggiornamento:', { id: dish.id, name: dish.name, photoUrl: dish.photoUrl })
        
        // Verifica che stiamo aggiornando il piatto corretto
        if (result.dishId && result.dishId !== dish.id) {
          console.warn('⚠️ Warning: dishId del risultato non corrisponde al piatto corrente')
          console.warn(`   - Piatto corrente: ${dish.id}`)
          console.warn(`   - Piatto del risultato: ${result.dishId}`)
        }
        
        const updatedDish = { ...dish, photoUrl: result.photoUrl }
        console.log('📝 Piatto dopo l\'aggiornamento:', { id: updatedDish.id, name: updatedDish.name, photoUrl: updatedDish.photoUrl })
        
        onUpdateDish(updatedDish)
        
        // Toast di successo
        toast({
          title: "🎉 Immagine generata con successo!",
          description: `L'immagine è stata creata e associata a "${result.dishName || dish.name}".`,
          duration: 4000,
        })
        
        // Forza un piccolo re-render per assicurarsi che l'immagine sia visibile
        setTimeout(() => {
          console.log('🔄 Verifica stato piatto dopo timeout:', { id: dish.id, photoUrl: dish.photoUrl })
          
                     // Se dopo 3 secondi l'immagine non è ancora visibile, ricarica tutto il menu
           setTimeout(() => {
             if (!dish.photoUrl || dish.photoUrl !== result.photoUrl) {
               console.log('🔄 Immagine non visibile dopo 3 secondi, ricarico menu...')
               window.location.reload() // Forza ricaricamento completo della pagina
             }
           }, 3000)
        }, 500)
        
      } else {
        console.error('❌ Result non contiene photoUrl:', result)
        toast({
          title: "⚠️ Immagine generata ma URL non disponibile",
          description: "L'immagine è stata generata ma non è possibile mostrarla. Prova a ricaricare la pagina.",
          variant: "destructive",
          duration: 6000,
        })
      }
      
    } catch (error) {
      console.error('❌ Errore nel gestire completamento generazione immagine:', error)
      
      // Fallback reset con timeout
      setTimeout(() => {
        setImageGenerationTaskId(null)
        setIsGeneratingImage(false)
        setShowImageGenerationDialog(false)
        setCustomPrompt('')
        setUseAutoPrompt(true)
      }, 100)
      
      toast({
        title: "⚠️ Problema durante l'aggiornamento",
        description: "L'immagine è stata generata ma c'è stato un problema. Ricarica la pagina per vedere l'immagine.",
        variant: "destructive",
        duration: 8000,
      })
    }
  }

  const handleImageGenerationError = (error: any) => {
    console.error('❌ Generazione immagine fallita:', error)
    
    let errorMessage = '❌ Errore nella generazione dell\'immagine'
    
    if (error?.type === 'safety_error') {
      errorMessage = '⚠️ ' + error.message
    } else if (error?.type === 'quota_error') {
      errorMessage = '🔒 ' + error.message
    } else if (error?.message) {
      errorMessage = '❌ ' + error.message
    }
    
    // Reset stati con timeout per evitare problemi di timing
    setTimeout(() => {
      setImageGenerationTaskId(null)
      setIsGeneratingImage(false)
      setShowImageGenerationDialog(false)
      setCustomPrompt('')
      setUseAutoPrompt(true)
    }, 100)
    
    // Mostra errore con toast
    toast({
      title: "Errore nella generazione dell'immagine",
      description: errorMessage.replace(/^[❌⚠️🔒]\s?/, ""),
      variant: "destructive",
      duration: 6000,
    })
  }

  // Funzioni per miglioramento immagine AI
  const handleEnhanceImage = async () => {
    if (!dish.photoUrl) {
      toast({
        title: "❌ Nessuna immagine",
        description: "Devi prima caricare un'immagine per poterla migliorare.",
        variant: "destructive",
        duration: 4000,
      })
      return
    }

    try {
      setIsEnhancingImage(true)
      setImageEnhancementTaskId(null)
      
      console.log('✨ Avvio miglioramento immagine AI...')
      
      const response = await fetch(`/api/menu/item/${dish.id}/enhance-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.taskId) {
          console.log('✅ Task miglioramento immagine avviato:', result.taskId)
          setImageEnhancementTaskId(result.taskId)
        } else {
          console.error('❌ Errore nella risposta:', result)
          toast({
            title: "❌ Errore",
            description: "Errore nell'avvio del miglioramento immagine",
            variant: "destructive",
            duration: 4000,
          })
          setIsEnhancingImage(false)
        }
      } else {
        const errorData = await response.json()
        console.error('❌ Errore HTTP:', response.status, errorData)
        toast({
          title: "❌ Errore",
          description: errorData.error || "Errore nell'avvio del miglioramento",
          variant: "destructive",
          duration: 4000,
        })
        setIsEnhancingImage(false)
      }
    } catch (err) {
      console.error('❌ Errore di rete:', err)
      toast({
        title: "❌ Errore di connessione",
        description: "Impossibile migliorare l'immagine. Verifica la connessione internet.",
        variant: "destructive",
        duration: 4000,
      })
      setIsEnhancingImage(false)
    }
  }

  const handleImageEnhancementComplete = (result: any) => {
    try {
      console.log('✅ Miglioramento immagine completato:', result)
      
      // Reset stati
      setTimeout(() => {
        setImageEnhancementTaskId(null)
        setIsEnhancingImage(false)
        setShowImageDialog(false)
      }, 100)
      
      if (result.photoUrl) {
        console.log('🖼️ Aggiornamento piatto con immagine migliorata:', result.photoUrl)
        
        const updatedDish = { ...dish, photoUrl: result.photoUrl }
        onUpdateDish(updatedDish)
        
        // Toast di successo
        toast({
          title: "🎉 Immagine migliorata con successo!",
          description: `L'immagine di "${dish.name}" è stata ottimizzata da un AI fotografo professionista.`,
          duration: 4000,
        })
        
        // Forza re-render per assicurarsi che l'immagine sia visibile
        setTimeout(() => {
          if (!dish.photoUrl || dish.photoUrl !== result.photoUrl) {
            console.log('🔄 Immagine non visibile, ricarico menu...')
            window.location.reload()
          }
        }, 3000)
        
      } else {
        console.error('❌ Result non contiene photoUrl:', result)
        toast({
          title: "⚠️ Immagine migliorata ma URL non disponibile",
          description: "L'immagine è stata migliorata ma non è possibile mostrarla. Prova a ricaricare la pagina.",
          variant: "destructive",
          duration: 6000,
        })
      }
      
    } catch (error) {
      console.error('❌ Errore nel gestire completamento miglioramento immagine:', error)
      
      setTimeout(() => {
        setImageEnhancementTaskId(null)
        setIsEnhancingImage(false)
      }, 100)
      
      toast({
        title: "⚠️ Problema durante l'aggiornamento",
        description: "L'immagine è stata migliorata ma c'è stato un problema. Ricarica la pagina.",
        variant: "destructive",
        duration: 8000,
      })
    }
  }

  const handleImageEnhancementError = (error: any) => {
    console.error('❌ Miglioramento immagine fallito:', error)
    
    let errorMessage = '❌ Errore nel miglioramento dell\'immagine'
    
    if (error?.type === 'safety_error') {
      errorMessage = '⚠️ ' + error.message
    } else if (error?.type === 'quota_error') {
      errorMessage = '🔒 ' + error.message
    } else if (error?.message) {
      errorMessage = '❌ ' + error.message
    }
    
    // Reset stati
    setTimeout(() => {
      setImageEnhancementTaskId(null)
      setIsEnhancingImage(false)
    }, 100)
    
    // Mostra errore
    toast({
      title: "Errore nel miglioramento dell'immagine",
      description: errorMessage.replace(/^[❌⚠️🔒]\s?/, ""),
      variant: "destructive",
      duration: 6000,
    })
  }

  // Funzioni per gestire le varianti
  const handleVariantModeToggle = async (enabled: boolean) => {
    setHasVariants(enabled)
    setLocalVariantsModified(true) // Marca come modificato localmente
    
    if (enabled && variants.length === 0) {
      // Inizializza con varianti di esempio SENZA salvare
      const exampleVariants = [
        { name: "Piccola", price: Math.round(dish.price * 0.8 * 100) / 100, available: true },
        { name: "Media", price: dish.price, available: true },
        { name: "Grande", price: Math.round(dish.price * 1.3 * 100) / 100, available: true }
      ]
      setVariants(exampleVariants)
      // NON salviamo automaticamente - l'utente deve salvare manualmente
    } else if (!enabled) {
      // Disattiva le varianti e salva
      setVariants([])
      await updateDishVariants([])
      setLocalVariantsModified(false) // Reset flag dopo salvataggio
    }
  }

  const saveVariantsManually = async () => {
    await updateDishVariants(hasVariants ? variants : [])
    setLocalVariantsModified(false) // Reset flag dopo salvataggio
    toast({
      title: "✅ Salvato",
      description: "Varianti salvate con successo"
    })
  }

  const updateVariant = (index: number, field: keyof Variant, value: any) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
    setLocalVariantsModified(true) // Marca come modificato localmente
  }

  const addVariant = () => {
    const newVariant: Variant = {
      name: `Variante ${variants.length + 1}`,
      price: dish.price,
      available: true
    }
    const newVariants = [...variants, newVariant]
    setVariants(newVariants)
    setLocalVariantsModified(true) // Marca come modificato localmente
  }

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      const newVariants = variants.filter((_, i) => i !== index)
      setVariants(newVariants)
      setLocalVariantsModified(true) // Marca come modificato localmente
    }
  }

  const updateDishVariants = async (newVariants: Variant[]) => {
    try {
      console.log('🔄 Salvando varianti:', newVariants)
      
      const response = await fetch(`/api/menu/item/${dish.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variants: newVariants })
      })

      if (response.ok) {
        const result = await response.json()
        console.log('✅ Risposta backend:', result)
        
        if (result.success && result.item) {
          // Aggiorna solo se abbiamo una risposta valida
          onUpdateDish(result.item)
        } else {
          console.error('❌ Risposta backend non valida:', result)
        }
      } else {
        const errorText = await response.text()
        console.error('❌ Errore HTTP:', response.status, errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
    } catch (error) {
      console.error('❌ Errore updating variants:', error)
      toast({
        title: "❌ Errore",
        description: "Errore durante il salvataggio delle varianti",
        variant: "destructive"
      })
    }
  }



  return (
    <>
      <Accordion type="single" collapsible className="w-full bg-white rounded-xl border border-gray-200">
        <AccordionItem value={dish.id} className="border-b-0">
          <AccordionTrigger className="p-3 hover:no-underline data-[state=open]:border-b">
            <div className="flex items-center gap-4 w-full">
              {showBulkCheckbox && (
                <div onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelectedForBulk}
                    onChange={() => onBulkToggle?.(dish.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                </div>
              )}
              <div className="w-16 h-16 shrink-0 relative group" onClick={(e) => e.stopPropagation()}>
                {dish.photoUrl ? (
                  <div className="relative w-full h-full">
                    <img
                      src={dish.photoUrl}
                      alt={dish.name}
                      className="w-full h-full rounded-lg object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                      <Camera 
                        className="w-6 h-6 text-white cursor-pointer" 
                        onClick={() => setShowImageDialog(true)}
                      />
                    </div>
                  </div>
                ) : (
                  <div 
                    className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                    onClick={() => setShowImageDialog(true)}
                  >
                    <Camera className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-grow text-left" onClick={(e) => e.stopPropagation()}>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => handleFieldBlur("name")}
                  className="font-bold text-gray-800 text-base border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto bg-transparent w-full"
                />
                {!hasVariants && (
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-400">€</span>
                    <Input
                      type="text"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      onBlur={() => handleFieldBlur("price")}
                      className="w-20 h-8 p-1 text-lg font-semibold border-gray-300 focus:ring-green-500"
                    />
                  </div>
                )}

                {hasVariants && (
                  <div className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-2 mt-1">
                    💡 <strong>Prezzo gestito dalle varianti</strong>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center gap-2 px-2" onClick={(e) => e.stopPropagation()}>
                <Switch
                  checked={dish.available}
                  onCheckedChange={handleAvailabilityChange}
                />
                <div className="flex items-center gap-1">
                  {dragListeners && (
                    <button
                      className="h-7 w-7 flex items-center justify-center rounded-md bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150 cursor-grab active:cursor-grabbing"
                      title="Trascina per riordinare"
                      {...dragAttributes}
                      {...dragListeners}
                    >
                      <GripVertical className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    className="h-7 w-7 flex items-center justify-center rounded-md bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-150"
                    onClick={onDuplicateDish}
                    title="Duplica piatto"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    className="h-7 w-7 flex items-center justify-center rounded-md bg-transparent text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-150"
                    onClick={onDeleteDish}
                    title="Elimina piatto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-2">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-600">Descrizione</label>
                  <button
                    className="h-6 w-6 flex items-center justify-center rounded-md bg-transparent text-purple-500 hover:text-purple-700 hover:bg-purple-50 transition-colors duration-150"
                    onClick={handleGenerateDescription}
                    title="Genera descrizione con AI"
                    disabled={isGeneratingDescription}
                  >
                    {isGeneratingDescription ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <div className="space-y-2">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    onBlur={() => handleFieldBlur("description")}
                    className="mt-1 w-full border rounded-md p-2 h-20 text-sm"
                    placeholder="Descrizione breve del piatto..."
                  />
                  <div className="flex justify-between items-center text-xs">
                    <span className={`${
                      description.length > 700 ? 'text-red-500' : 
                      description.length > 600 ? 'text-orange-500' : 
                      'text-gray-500'
                    }`}>
                      {description.length}/700 caratteri
                    </span>
                    {description.length > 700 && (
                      <span className="text-red-500 text-xs">Limite superato!</span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-600">Ingredienti (separati da virgola)</label>
                  <button
                    className="h-6 w-6 flex items-center justify-center rounded-md bg-transparent text-purple-500 hover:text-purple-700 hover:bg-purple-50 transition-colors duration-150"
                    onClick={handleGenerateIngredients}
                    title="Genera ingredienti con AI"
                    disabled={isGeneratingIngredients}
                  >
                    {isGeneratingIngredients ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <Input
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  onBlur={() => handleFieldBlur("ingredients")}
                  className="mt-1 w-full text-sm"
                  placeholder="Salmone, Olio, Sale..."
                />
              </div>

              {/* Sezione Varianti */}
              <div className="border-t pt-4 mt-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-gray-600">Varianti Piatto</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {hasVariants ? `Multi-formato (${variants.length} varianti)` : "Formato singolo"}
                    </span>
                    <CustomButton
                      type="button"
                      variant={hasVariants ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleVariantModeToggle(!hasVariants)
                      }}
                      className="h-7 px-3 text-xs"
                    >
                      {hasVariants ? "Disabilita" : "Abilita"} varianti
                    </CustomButton>
                  </div>
                </div>

                {hasVariants && (
                  <div className="space-y-3">
                    <div className="text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      💡 <strong>Modalità Multi-formato:</strong> Crea diverse varianti dello stesso piatto (es. pizza piccola/media/grande, bevanda 33cl/50cl, etc.)
                      <br/>⚠️ <strong>Ricordati di cliccare "Salva varianti" per confermare le modifiche!</strong>
                    </div>
                    
                    {variants.map((variant, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <Input
                            value={variant.name}
                            onChange={(e) => updateVariant(index, 'name', e.target.value)}
                            className="flex-1 h-8 text-sm"
                            placeholder="Nome variante (es. Piccola, Media...)"
                          />
                          <div className="flex items-center gap-1">
                            <span className="text-gray-400 text-sm">€</span>
                            <Input
                              type="number"
                              step="0.01"
                              value={variant.price.toFixed(2)}
                              onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                              className="w-20 h-8 text-sm"
                              placeholder="Prezzo"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <Switch
                              checked={variant.available}
                              onCheckedChange={(checked) => updateVariant(index, 'available', checked)}
                              className="scale-75"
                            />
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {variant.available ? "Attiva" : "Disattiva"}
                            </span>
                          </div>
                          {variants.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                removeVariant(index)
                              }}
                              className="h-7 w-7 flex items-center justify-center rounded-md bg-transparent text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors duration-150"
                              title="Rimuovi variante"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-2">
                      <CustomButton
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          addVariant()
                        }}
                        className="flex items-center gap-1 h-8 px-3 text-xs"
                      >
                        ➕ Aggiungi variante
                      </CustomButton>
                      <CustomButton
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          saveVariantsManually()
                        }}
                        className="flex items-center gap-1 h-8 px-3 text-xs"
                      >
                        💾 Salva varianti
                      </CustomButton>
                    </div>
                  </div>
                )}

                {!hasVariants && (
                  <div className="text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    🍽️ <strong>Modalità Formato Singolo:</strong> Il piatto ha un unico prezzo. Attiva le varianti per creare diverse opzioni (taglie, formati, etc.)
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-600">Etichette</label>
                  <div className="flex items-center gap-2 text-xs">
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      dish.tags.length >= 2 
                        ? "bg-red-100 text-red-700" 
                        : dish.tags.length === 1 
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    )}>
                      {dish.tags.length}/2 assegnate
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableTags.map((tag) => {
                    const isSelected = dish.tags.some((t) => t.id === tag.id)
                    const isDisabled = !isSelected && dish.tags.length >= 2
                    
                    return (
                                              <Badge
                          key={tag.id}
                          onClick={() => !isDisabled && toggleTag(tag)}
                          className={cn(
                            isSelected
                              ? `${getValidTagColor(tag.color)} ${getTextColorForBackground(tag.color)} cursor-pointer border-2 border-blue-300`
                              : isDisabled
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50"
                              : "bg-gray-100 text-gray-600 cursor-pointer hover:bg-gray-200 border border-gray-200"
                          )}
                          title={isDisabled ? "Limite 2 etichette per piatto raggiunto" : ""}
                        >
                          {tag.emoji && <span className="mr-1">{tag.emoji}</span>}
                          {tag.text}
                        </Badge>
                    )
                  })}
                  {isCreatingTag ? (
                    <div className="flex items-center gap-1">
                      <Input
                        value={newTagText}
                        onChange={(e) => setNewTagText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") createNewTag()
                          if (e.key === "Escape") {
                            setIsCreatingTag(false)
                            setNewTagText("")
                          }
                        }}
                        onBlur={createNewTag}
                        className="h-6 text-xs px-2 w-24"
                        placeholder="Nuova etichetta"
                        autoFocus
                      />
                    </div>
                  ) : (
                    <Badge
                      onClick={() => dish.tags.length < 2 && setIsCreatingTag(true)}
                      className={cn(
                        "border-2 border-dashed border-gray-300",
                        dish.tags.length >= 2
                          ? "bg-gray-50 text-gray-400 cursor-not-allowed opacity-50"
                          : "cursor-pointer bg-gray-100 text-gray-500 hover:bg-gray-200"
                      )}
                      title={dish.tags.length >= 2 ? "Limite 2 etichette per piatto raggiunto" : "Crea nuova etichetta"}
                    >
                      + Aggiungi
                    </Badge>
                  )}
                </div>
                {dish.tags.length >= 2 && (
                  <p className="text-xs text-orange-600 mt-2 bg-orange-50 p-2 rounded-lg">
                    ⚠️ Limite raggiunto: massimo 2 etichette per piatto. Rimuovi un'etichetta per aggiungerne una nuova.
                  </p>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Dialog per gestione immagine - Mobile Optimized */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="w-full max-w-md h-full max-h-[100vh] m-0 rounded-none sm:rounded-lg sm:max-h-[90vh] sm:m-4 flex flex-col">
          <DialogHeader className="flex-shrink-0 px-4 py-6 border-b border-gray-200">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Camera className="h-6 w-6 text-blue-500" />
              Gestisci Immagine Piatto
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {dish.photoUrl 
                ? "Puoi sostituire o eliminare l'immagine esistente per questo piatto." 
                : "Carica una nuova immagine per questo piatto."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            {/* Anteprima Immagine Attuale */}
            {dish.photoUrl && (
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  🖼️ Immagine Attuale
                </h3>
                <div className="text-center">
                  <img
                    src={dish.photoUrl}
                    alt={dish.name}
                    className="w-full max-w-sm mx-auto rounded-xl object-cover shadow-md border border-gray-200"
                    style={{ maxHeight: '300px' }}
                  />
                  <p className="text-sm text-gray-500 mt-3">
                    Immagine di <strong>{dish.name}</strong>
                  </p>
                </div>
              </div>
            )}
            
            {/* Migliora Immagine con AI - Solo se esiste già un'immagine */}
            {dish.photoUrl && !imageEnhancementTaskId && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-orange-500" />
                  Migliora Immagine con AI
                </h3>
                
                <CustomButton
                  className="w-full h-12 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold"
                  onClick={handleEnhanceImage}
                  disabled={isEnhancingImage || isUpdatingImage || isGeneratingImage}
                >
                  <Sparkles className="mr-2 h-5 w-5" />
                  ✨ Migliora Foto
                </CustomButton>
                
                <p className="text-xs text-orange-600 mt-3 bg-orange-50 p-3 rounded-lg">
                  📸 L'AI ottimizzerà l'immagine esistente come se fosse scattata da un fotografo professionista: migliorerà illuminazione, nitidezza, colori e presentazione mantenendo il piatto originale.
                </p>
              </div>
            )}
            
            {/* Progress bar per miglioramento immagine */}
            {imageEnhancementTaskId && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <AsyncTaskProgress
                  taskId={imageEnhancementTaskId}
                  title="Miglioramento Immagine in Corso"
                  description={`Stiamo ottimizzando l'immagine di "${dish.name}" con l'AI...`}
                  onComplete={handleImageEnhancementComplete}
                  onError={handleImageEnhancementError}
                  onCancel={() => {
                    setImageEnhancementTaskId(null)
                    setIsEnhancingImage(false)
                  }}
                  pollingInterval={2000}
                  className="my-4"
                />
              </div>
            )}
            
            {/* Carica Nuova Immagine */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                📤 {dish.photoUrl ? "Sostituisci Immagine" : "Carica Immagine"}
              </h3>
              
              <MediaUpload
                onFileSelect={handleImageUpload}
                selectedFile={isUpdatingImage ? "updating" : ""}
                mediaType="image"
                maxSize={10}
                uploadType="menu-item"
                restaurantId={restaurantId}
                itemId={dish.id}
                itemName={dish.name}
                label={dish.photoUrl ? "Seleziona nuova immagine" : "Seleziona immagine"}
                className="w-full"
              />
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">
                  <strong>💡 Consiglio:</strong> Usa immagini di alta qualità (JPG/PNG) per risultati migliori. Dimensione massima: 10MB.
                </p>
              </div>
            </div>
            
            {/* Genera con AI */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-purple-500" />
                Genera con AI
              </h3>
              
              <CustomButton
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold"
                onClick={() => setShowImageGenerationDialog(true)}
                disabled={isUpdatingImage || isGeneratingImage}
              >
                <Wand2 className="mr-2 h-5 w-5" />
                Genera Immagine AI
              </CustomButton>
              
              <p className="text-xs text-purple-600 mt-3 bg-purple-50 p-3 rounded-lg">
                🎨 L'AI creerà un'immagine professionale basata sui dettagli del piatto
              </p>
            </div>

            {/* Elimina Immagine */}
            {dish.photoUrl && (
              <div className="bg-white rounded-2xl border border-red-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                  🗑️ Elimina Immagine
                </h3>
                
                <p className="text-sm text-red-600 mb-4">
                  <strong>⚠️ Attenzione:</strong> Questa azione rimuoverà definitivamente l'immagine del piatto.
                </p>
                
                <CustomButton 
                  variant="destructive"
                  onClick={handleImageDelete}
                  disabled={isUpdatingImage}
                  className="w-full h-12"
                >
                  {isUpdatingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Eliminazione in corso...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Elimina Immagine Definitivamente
                    </>
                  )}
                </CustomButton>
              </div>
            )}
          </div>
          
          <div className="flex-shrink-0 px-4 py-6 border-t border-gray-200">
            <CustomButton 
              className="w-full h-14 text-base font-semibold"
              variant="outline"
              onClick={() => {
                if (imageEnhancementTaskId) {
                  // Se c'è un miglioramento in corso, chiedi conferma
                  if (confirm('🚧 C\'è un miglioramento immagine in corso. Sei sicuro di voler chiudere? Il processo continuerà in background.')) {
                    setShowImageDialog(false)
                  }
                } else {
                  setShowImageDialog(false)
                }
              }}
              disabled={isUpdatingImage}
            >
              {imageEnhancementTaskId ? (
                <>
                  <span className="mr-2">🚧</span>
                  Chiudi (Miglioramento in corso)
                </>
              ) : (
                '✅ Chiudi'
              )}
            </CustomButton>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog per generazione immagine AI - Mobile Optimized */}
      <Dialog open={showImageGenerationDialog} onOpenChange={setShowImageGenerationDialog}>
        <DialogContent className="w-full max-w-md h-full max-h-[100vh] m-0 rounded-none sm:rounded-lg sm:max-h-[90vh] sm:m-4 flex flex-col">
          <DialogHeader className="flex-shrink-0 px-4 py-6 border-b border-gray-200">
            <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Wand2 className="h-6 w-6 text-purple-500" />
              Genera Immagine con AI
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Crea un'immagine professionale per <strong>{dish.name}</strong> usando l'intelligenza artificiale
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
            {imageGenerationTaskId ? (
              // Mostra progresso generazione immagine asincrona
              <AsyncTaskProgress
                taskId={imageGenerationTaskId}
                title="Generazione Immagine con AI"
                description={`Stiamo creando un'immagine professionale per "${dish.name}" usando l'intelligenza artificiale...`}
                onComplete={handleImageGenerationComplete}
                onError={handleImageGenerationError}
                onCancel={() => {
                  setImageGenerationTaskId(null)
                  setIsGeneratingImage(false)
                }}
                pollingInterval={2000}
                className="my-4"
              />
            ) : (
              <>
                {/* Opzione automatica */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative">
                      <input
                        type="radio"
                        id="auto-prompt"
                        name="prompt-type"
                        checked={useAutoPrompt}
                        onChange={() => setUseAutoPrompt(true)}
                        className="w-6 h-6 text-purple-600 border-2 border-gray-300 focus:ring-purple-500"
                      />
                    </div>
                    <label htmlFor="auto-prompt" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <Sparkles className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <span className="text-lg font-bold text-gray-800 block">Generazione Automatica</span>
                        <span className="text-sm text-gray-600">L'AI crea il prompt per te</span>
                      </div>
                    </label>
                  </div>
                  
                  {useAutoPrompt && (
                    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                      <p className="text-sm text-purple-800 mb-3 font-medium">
                        ✨ L'AI creerà automaticamente un prompt fotografico professionale usando:
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600 font-medium text-sm">•</span>
                          <span className="text-sm text-purple-700"><strong>Nome:</strong> {dish.name}</span>
                        </div>
                        {description && (
                          <div className="flex items-start gap-2">
                            <span className="text-purple-600 font-medium text-sm">•</span>
                            <span className="text-sm text-purple-700"><strong>Descrizione:</strong> {description.substring(0, 50)}{description.length > 50 ? '...' : ''}</span>
                          </div>
                        )}
                        {ingredients && (
                          <div className="flex items-start gap-2">
                            <span className="text-purple-600 font-medium text-sm">•</span>
                            <span className="text-sm text-purple-700"><strong>Ingredienti:</strong> {ingredients.substring(0, 50)}{ingredients.length > 50 ? '...' : ''}</span>
                          </div>
                        )}
                        <div className="flex items-start gap-2">
                          <span className="text-purple-600 font-medium text-sm">•</span>
                          <span className="text-sm text-purple-700"><strong>Stile:</strong> Fotografia professionale, macro 60mm, studio lighting</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Opzione personalizzata */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className="relative">
                      <input
                        type="radio"
                        id="custom-prompt"
                        name="prompt-type"
                        checked={!useAutoPrompt}
                        onChange={() => setUseAutoPrompt(false)}
                        className="w-6 h-6 text-blue-600 border-2 border-gray-300 focus:ring-blue-500"
                      />
                    </div>
                    <label htmlFor="custom-prompt" className="flex items-center gap-3 cursor-pointer flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Edit3 className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <span className="text-lg font-bold text-gray-800 block">Prompt Personalizzato</span>
                        <span className="text-sm text-gray-600">Scrivi il tuo prompt in inglese</span>
                      </div>
                    </label>
                  </div>
                  
                  {!useAutoPrompt && (
                    <div className="space-y-4">
                      <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800 mb-2 font-medium">
                          ⚠️ Il prompt deve essere in inglese per migliori risultati
                        </p>
                        <p className="text-xs text-yellow-700">
                          <strong>Esempio:</strong> "Professional food photography of pasta carbonara, macro lens 60mm, studio lighting, beautifully plated, restaurant quality"
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <textarea
                          value={customPrompt}
                          onChange={(e) => setCustomPrompt(e.target.value)}
                          className="w-full h-32 p-3 border border-gray-300 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Professional food photography of [your dish], macro lens 60mm, studio lighting, high detail, beautifully plated..."
                          maxLength={480}
                        />
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Limite caratteri prompt</span>
                          <span className={`text-xs font-medium ${customPrompt.length > 400 ? 'text-orange-600' : 'text-gray-500'}`}>
                            {customPrompt.length}/480
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                              {/* Info Generazione AI */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Generazione AI
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-800">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>Qualità professionale</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-800">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>Formato ottimizzato</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-blue-800">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>Specializzato per cibo</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-800">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span>⏱️ 15-60 secondi</span>
                    </div>
                  </div>
                </div>
              </div>
              </>
            )}
          </div>
          
          <div className="flex-shrink-0 px-4 py-6 border-t border-gray-200 space-y-3">
            {!imageGenerationTaskId && (
              <CustomButton
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || (!useAutoPrompt && !customPrompt.trim())}
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Avvio Generazione...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    🎨 Genera Immagine
                  </>
                )}
              </CustomButton>
            )}
            
            <CustomButton
              className="w-full h-12 text-base"
              variant="outline"
              onClick={() => {
                if (imageGenerationTaskId) {
                  // Se c'è un task in corso, chiedi conferma
                  if (confirm('🚧 C\'è una generazione in corso. Sei sicuro di voler chiudere? Il processo continuerà in background.')) {
                    setShowImageGenerationDialog(false)
                  }
                } else {
                  setShowImageGenerationDialog(false)
                }
              }}
            >
              {imageGenerationTaskId ? (
                <>
                  <span className="mr-2">🚧</span>
                  Chiudi (Generazione in corso)
                </>
              ) : (
                'Annulla'
              )}
            </CustomButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// --- SORTABLE CATEGORY COMPONENT ---
const SortableCategory = ({
  category,
  onUpdateCategory,
  onDeleteCategory,
  onAddDish,
  availableTags,
  restaurantId,
  showBulkCheckbox = false,
  selectedBulkItems = [],
  onBulkToggle,
  onDishUpdate,
  onDishDuplicate,
  onDishDelete,
  onDishReorder,
  onCategoryAI,
}: {
  category: Category
  onUpdateCategory: (updatedCategory: Category) => void
  onDeleteCategory: () => void
  onAddDish: (categoryId: string) => void
  availableTags: Tag[]
  restaurantId: string
  showBulkCheckbox?: boolean
  selectedBulkItems?: string[]
  onBulkToggle?: (dishId: string) => void
  onDishUpdate: (categoryId: string, updatedDish: Dish) => void
  onDishDuplicate: (categoryId: string, dish: Dish) => void
  onDishDelete: (categoryId: string, dishId: string) => void
  onDishReorder: (categoryId: string, dishes: Dish[]) => void
  onCategoryAI?: (category: Category) => void
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className={isDragging ? "z-50" : ""}>
      <CategoryAccordion
        category={category}
        onUpdateCategory={onUpdateCategory}
        onDeleteCategory={onDeleteCategory}
        onAddDish={onAddDish}
        availableTags={availableTags}
        restaurantId={restaurantId}
        showBulkCheckbox={showBulkCheckbox}
        selectedBulkItems={selectedBulkItems}
        onBulkToggle={onBulkToggle}
        onDishUpdate={onDishUpdate}
        onDishDuplicate={onDishDuplicate}
        onDishDelete={onDishDelete}
        onDishReorder={onDishReorder}
        onCategoryAI={onCategoryAI}
        dragAttributes={attributes}
        dragListeners={listeners}
        isDragging={isDragging}
      />
    </div>
  )
}

// --- CATEGORY COMPONENT ---
const CategoryAccordion = ({
  category,
  onUpdateCategory,
  onDeleteCategory,
  onAddDish,
  availableTags,
  restaurantId,
  showBulkCheckbox = false,
  selectedBulkItems = [],
  onBulkToggle,
  onDishUpdate,
  onDishDuplicate,
  onDishDelete,
  onDishReorder,
  onCategoryAI,
  dragAttributes,
  dragListeners,
  isDragging = false,
}: {
  category: Category
  onUpdateCategory: (updatedCategory: Category) => void
  onDeleteCategory: () => void
  onAddDish: (categoryId: string) => void
  availableTags: Tag[]
  restaurantId: string
  showBulkCheckbox?: boolean
  selectedBulkItems?: string[]
  onBulkToggle?: (dishId: string) => void
  onDishUpdate: (categoryId: string, updatedDish: Dish) => void
  onDishDuplicate: (categoryId: string, dish: Dish) => void
  onDishDelete: (categoryId: string, dishId: string) => void
  onDishReorder?: (categoryId: string, dishes: Dish[]) => void
  onCategoryAI?: (category: Category) => void
  dragAttributes?: any
  dragListeners?: any
  isDragging?: boolean
}) => {
  const { toast } = useToast()
  const [name, setName] = React.useState(category.name)
  const [icon, setIcon] = React.useState(category.icon)
  
  // Rende l'header della categoria droppable per i piatti
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: category.id,
  })

  React.useEffect(() => {
    setName(category.name)
    setIcon(category.icon)
  }, [category])

  const handleNameBlur = async () => {
    const trimmedName = name.trim()
    
    // Debug logging
    console.log('🏷️ handleNameBlur called:', {
      currentName: name,
      trimmedName,
      categoryName: category.name,
      categoryId: category.id,
      hasChanged: trimmedName !== category.name,
      isEmpty: !trimmedName
    })
    
    // Se il nome è vuoto, ripristina quello originale
    if (!trimmedName) {
      console.log('📝 Nome vuoto, ripristino quello originale')
      setName(category.name)
      return
    }
    
    // Se il nome non è cambiato, non fare nulla
    if (trimmedName === category.name) {
      console.log('📝 Nome non cambiato, non faccio nulla')
      return
    }
    
    // Aggiornamento ottimistico: aggiorna subito lo stato locale
    console.log('⚡ Aggiornamento ottimistico dello stato locale')
    onUpdateCategory({ ...category, name: trimmedName })
    
    try {
      console.log('🌐 Chiamata API per aggiornare categoria:', category.id)
      const response = await fetch(`/api/menu/category/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName })
      })
      
      console.log('📡 Risposta API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
      
      if (response.ok) {
        console.log('✅ Categoria aggiornata con successo')
        // Lo stato è già stato aggiornato ottimisticamente
      } else {
        // La chiamata API è fallita, fai il revert e mostra l'errore
        const errorData = await response.json().catch(() => ({ error: 'Errore sconosciuto' }))
        console.error('❌ Errore API:', errorData)
        
        // Revert allo stato originale
        setName(category.name)
        onUpdateCategory({ ...category, name: category.name })
        
        // Mostra toast di errore
        toast({
          title: "❌ Errore nel salvataggio",
          description: `Impossibile aggiornare il nome della categoria: ${errorData.error || response.statusText}`,
          variant: "destructive",
          duration: 4000,
        })
      }
    } catch (err) {
      console.error('❌ Errore di rete:', err)
      
      // Revert allo stato originale
      setName(category.name)
      onUpdateCategory({ ...category, name: category.name })
      
      // Mostra toast di errore
      toast({
        title: "❌ Errore di connessione",
        description: "Impossibile salvare le modifiche. Verifica la connessione internet.",
        variant: "destructive",
        duration: 4000,
      })
    }
  }

  const handleIconBlur = async () => {
    const trimmedIcon = icon.trim()
    
    // Debug logging
    console.log('🎨 handleIconBlur called:', {
      currentIcon: icon,
      trimmedIcon,
      categoryIcon: category.icon,
      categoryId: category.id,
      hasChanged: trimmedIcon !== category.icon,
      isEmpty: !trimmedIcon
    })
    
    // Se l'icona è vuota, ripristina quella originale
    if (!trimmedIcon) {
      console.log('📝 Icona vuota, ripristino quella originale')
      setIcon(category.icon)
      return
    }
    
    // Se l'icona non è cambiata, non fare nulla
    if (trimmedIcon === category.icon) {
      console.log('📝 Icona non cambiata, non faccio nulla')
      return
    }
    
    // Aggiornamento ottimistico: aggiorna subito lo stato locale
    console.log('⚡ Aggiornamento ottimistico dello stato locale')
    onUpdateCategory({ ...category, icon: trimmedIcon })
    
    try {
      console.log('🌐 Chiamata API per aggiornare icona categoria:', category.id)
      const response = await fetch(`/api/menu/category/${category.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ icon: trimmedIcon })
      })
      
      console.log('📡 Risposta API:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })
      
      if (response.ok) {
        console.log('✅ Icona categoria aggiornata con successo')
        // Lo stato è già stato aggiornato ottimisticamente
      } else {
        // La chiamata API è fallita, fai il revert e mostra l'errore
        const errorData = await response.json().catch(() => ({ error: 'Errore sconosciuto' }))
        console.error('❌ Errore API:', errorData)
        
        // Revert allo stato originale
        setIcon(category.icon)
        onUpdateCategory({ ...category, icon: category.icon })
        
        // Mostra toast di errore
        toast({
          title: "❌ Errore nel salvataggio",
          description: `Impossibile aggiornare l'icona della categoria: ${errorData.error || response.statusText}`,
          variant: "destructive",
          duration: 4000,
        })
      }
    } catch (err) {
      console.error('❌ Errore di rete:', err)
      
      // Revert allo stato originale
      setIcon(category.icon)
      onUpdateCategory({ ...category, icon: category.icon })
      
      // Mostra toast di errore
      toast({
        title: "❌ Errore di connessione",
        description: "Impossibile salvare le modifiche. Verifica la connessione internet.",
        variant: "destructive",
        duration: 4000,
      })
    }
  }

  return (
    <AccordionItem
      value={category.id}
      className="group bg-transparent border-none rounded-2xl shadow-sm overflow-visible"
    >
      <div className={cn(
        "relative rounded-2xl border-b-4 border-[#d8d8d8] transition-transform group-data-[state=open]:translate-y-1 category-drop-target",
        isOver && "is-over"
      )}>
        <span className="absolute inset-0 -bottom-1 rounded-2xl bg-[#e5e5e5]"></span>
        <div className="relative bg-white rounded-2xl overflow-hidden">
          <AccordionTrigger 
            ref={setDropRef}
            className={cn(
              "text-lg font-bold text-gray-700 p-4 hover:no-underline w-full data-[state=open]:border-b transition-colors duration-200",
              isOver && "bg-blue-50 border-blue-300 border-2"
            )}
          >
            <div className="flex items-center gap-3 w-full">
              <Input
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                onBlur={handleIconBlur}
                className="text-3xl w-12 p-0 h-auto bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                onClick={(e) => e.stopPropagation()}
                maxLength={2}
              />
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameBlur}
                className="text-lg font-bold text-gray-700 p-0 h-auto bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 w-full"
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex items-center gap-1 ml-2">
                <button
                  className="h-8 w-8 flex items-center justify-center rounded-md bg-transparent text-purple-500 hover:text-purple-700 hover:bg-purple-50 transition-colors duration-150"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCategoryAI?.(category)
                  }}
                  title="Genera immagini AI per tutti i piatti della categoria"
                >
                  <Wand2 className="h-5 w-5" />
                </button>
                {dragListeners && (
                  <button
                    className="h-8 w-8 flex items-center justify-center rounded-md bg-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150 cursor-grab active:cursor-grabbing"
                    title="Trascina per riordinare categoria"
                    {...dragAttributes}
                    {...dragListeners}
                  >
                    <GripVertical className="h-5 w-5" />
                  </button>
                )}
                <button
                  className="h-8 w-8 flex items-center justify-center rounded-md bg-transparent text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-150"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteCategory()
                  }}
                  title="Elimina categoria"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-6">
            <div className="space-y-3">
              {category.dishes.map((dish) => (
                <SortableDish
                  key={dish.id}
                  dish={dish}
                  onUpdateDish={(updatedDish) => onDishUpdate(category.id, updatedDish)}
                  onDuplicateDish={() => onDishDuplicate(category.id, dish)}
                  onDeleteDish={() => onDishDelete(category.id, dish.id)}
                  availableTags={availableTags}
                  restaurantId={restaurantId}
                  showBulkCheckbox={showBulkCheckbox}
                  isSelectedForBulk={selectedBulkItems.includes(dish.id)}
                  onBulkToggle={onBulkToggle}
                />
              ))}
            </div>
            
            {/* Zona di drop per trasferimento piatti */}
            {isOver && (
              <div className="mt-3 p-3 border-2 border-dashed border-blue-400 bg-blue-50 rounded-xl text-center">
                <p className="text-blue-700 font-medium text-sm">
                  🍽️ Rilascia qui per spostare il piatto in "{category.name}"
                </p>
              </div>
            )}
            
            <button
              className="relative w-full mt-4 rounded-2xl border-b-4 border-gray-900/20 font-bold uppercase tracking-wider transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-1 active:border-b-0"
              onClick={() => onAddDish(category.id)}
            >
              <span className="absolute inset-0 -bottom-1 rounded-2xl bg-gray-200"></span>
              <span className="relative flex h-full w-full items-center justify-center rounded-2xl bg-transparent border-dashed border-2 border-gray-300 text-gray-500 py-3 px-6 transition-transform duration-150">
                <PlusCircle className="mr-2 h-4 w-4" /> Aggiungi Piatto
              </span>
            </button>
          </AccordionContent>
        </div>
      </div>
    </AccordionItem>
  )
}

// --- UTILITY FUNCTIONS ---
const getValidTagColor = (color: string | undefined): string => {
  if (!color) return 'bg-blue-300'
  
  // Lista di colori problematici da sostituire
  const problematicColors = [
    'bg-white', 'bg-gray-50', 'bg-gray-100', 'bg-yellow-50', 'bg-orange-50', 
    'bg-red-50', 'bg-pink-50', 'bg-purple-50', 'bg-indigo-50', 'bg-blue-50',
    'bg-green-50', 'bg-teal-50', 'bg-cyan-50', 'bg-lime-50', 'bg-amber-50',
    'bg-emerald-50', 'bg-violet-50', 'bg-fuchsia-50', 'bg-rose-50', 'bg-sky-50',
    'bg-slate-50', 'bg-zinc-50', 'bg-neutral-50', 'bg-stone-50'
  ]
  
  // Mappatura specifica per colori problematici
  const colorMapping: { [key: string]: string } = {
    'bg-white': 'bg-slate-300',
    'bg-gray-50': 'bg-slate-300',
    'bg-gray-100': 'bg-slate-300',
    'bg-yellow-50': 'bg-amber-300',
    'bg-orange-50': 'bg-orange-300',
    'bg-red-50': 'bg-red-300',
    'bg-pink-50': 'bg-pink-300',
    'bg-purple-50': 'bg-purple-300',
    'bg-indigo-50': 'bg-indigo-300',
    'bg-blue-50': 'bg-blue-300',
    'bg-green-50': 'bg-emerald-300',
    'bg-teal-50': 'bg-teal-300',
    'bg-cyan-50': 'bg-cyan-300',
    'bg-lime-50': 'bg-lime-300',
    'bg-amber-50': 'bg-amber-300',
    'bg-emerald-50': 'bg-emerald-300',
    'bg-violet-50': 'bg-violet-300',
    'bg-fuchsia-50': 'bg-fuchsia-300',
    'bg-rose-50': 'bg-rose-300',
    'bg-sky-50': 'bg-sky-300',
    'bg-slate-50': 'bg-slate-300',
    'bg-zinc-50': 'bg-zinc-300',
    'bg-neutral-50': 'bg-neutral-300',
    'bg-stone-50': 'bg-stone-300'
  }
  
  // Se è un colore problematico, usa la mappatura
  if (problematicColors.includes(color)) {
    return colorMapping[color] || 'bg-slate-300'
  }
  
  // Converte colori scuri (-500/-600/-700) in -300
  if (color.includes('-500') || color.includes('-600') || color.includes('-700')) {
    return color.replace(/-[567]00/, '-300')
  }
  
  // Converte colori chiari (-50/-100/-200) in -300
  if (color.includes('-50') || color.includes('-100') || color.includes('-200')) {
    return color.replace(/-[012]00/, '-300')
  }
  
  // Se ha già -300, mantienilo
  if (color.includes('-300')) {
    return color
  }
  
  // Se è un colore Tailwind senza intensità, aggiungi -300
  if (color.startsWith('bg-') && !color.match(/-\d+$/)) {
    const baseColor = color.replace('bg-', '')
    return `bg-${baseColor}-300`
  }
  
  return color
}

const getTextColorForBackground = (color: string | undefined): string => {
  if (!color) return 'text-gray-800'
  
  // Lista di colori che richiedono testo scuro
  const lightColors = ['bg-white', 'bg-gray-100', 'bg-gray-50', 'bg-yellow-200', 'bg-yellow-100', 'bg-orange-100']
  
  // Per colori chiari, usa testo molto scuro
  if (lightColors.some(lightColor => color.includes(lightColor))) {
    return 'text-gray-900'
  }
  
  // Per tutti gli altri colori tenui -200, usa testo grigio scuro
  return 'text-gray-800'
}

// --- MAIN COMPONENT ---
export default function MenuAdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  
  // States
  const [menuData, setMenuData] = React.useState<MenuData | null>(null)
  const [originalCategories, setOriginalCategories] = React.useState<Category[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [availableTags, setAvailableTags] = React.useState<Tag[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
  // Language states
  const [currentLanguage, setCurrentLanguage] = React.useState('it')
  const [supportedLanguages, setSupportedLanguages] = React.useState<Array<{
    code: string
    name: string
    flag: string
    isDefault: boolean
  }>>([])
  const [isLoadingLanguage, setIsLoadingLanguage] = React.useState(false)
  
  // Bulk operations states
  const [showBulkPriceDialog, setShowBulkPriceDialog] = React.useState(false)
  const [bulkMode, setBulkMode] = React.useState(false)
  const [selectedBulkItems, setSelectedBulkItems] = React.useState<string[]>([])
  const [bulkUpdateType, setBulkUpdateType] = React.useState<"fixed" | "percentage">("fixed")
  const [bulkFixedAmount, setBulkFixedAmount] = React.useState("")
  const [bulkPercentage, setBulkPercentage] = React.useState("")

  // Stati per l'importazione menu
  const [showImportDialog, setShowImportDialog] = React.useState(false)
  const [importedFiles, setImportedFiles] = React.useState<Array<{
    url: string
    type: "image" | "pdf"
    name: string
  }>>([])
  const [isAnalyzing, setIsAnalyzing] = React.useState(false)
  const [analysisTaskId, setAnalysisTaskId] = React.useState<string | null>(null)
  const [analyzedData, setAnalyzedData] = React.useState<{
    categories: Array<{
      name: string
      icon: string
      dishes: Array<{
        name: string
        price?: number
        description?: string
        ingredients?: string[]
      }>
    }>
  } | null>(null)
  const [showAnalysisPreview, setShowAnalysisPreview] = React.useState(false)
  const [addIngredientsDescription, setAddIngredientsDescription] = React.useState(false)

  // Stati per la sezione Brand
  const [showBrandDialog, setShowBrandDialog] = React.useState(false)
  const [brandSettings, setBrandSettings] = React.useState<{
    primaryColor: string
    secondaryColor: string
    coverImageUrl: string
    logoUrl: string
    hideDescription: boolean
    hideIngredients: boolean
    tagDisplayMode: string
    fontFamily: string
    categoryBannerPosition: string
    suppliers: Supplier[]
  }>({
    primaryColor: '#3B82F6',
    secondaryColor: '#64748B',
    coverImageUrl: '',
    logoUrl: '',
    hideDescription: false,
    hideIngredients: false,
    tagDisplayMode: 'full',
    fontFamily: 'Inter',
    categoryBannerPosition: 'dynamic',
    suppliers: []
  })
  const [isUpdatingBrand, setIsUpdatingBrand] = React.useState(false)
  
  // Stati per gestire i fornitori
  const [showAddSupplierDialog, setShowAddSupplierDialog] = React.useState(false)
  const [editingSupplier, setEditingSupplier] = React.useState<Supplier | null>(null)
  const [supplierForm, setSupplierForm] = React.useState({
    name: '',
    logoUrl: ''
  })
  const [isUploadingSupplierLogo, setIsUploadingSupplierLogo] = React.useState(false)

  // Stati per le traduzioni
  const [showTranslationsDialog, setShowTranslationsDialog] = React.useState(false)
  const [isGeneratingTranslation, setIsGeneratingTranslation] = React.useState(false)
  const [selectedLanguageForTranslation, setSelectedLanguageForTranslation] = React.useState('')
  const [translationTaskId, setTranslationTaskId] = React.useState<string | null>(null)
  
  // Stati per cancellazione traduzioni
  const [isDeletingTranslation, setIsDeletingTranslation] = React.useState(false)
  const [deletionTaskId, setDeletionTaskId] = React.useState<string | null>(null)
  
  // Stati per analisi AI piatti
  const [isAnalyzingDishes, setIsAnalyzingDishes] = React.useState(false)
  const [dishAnalysisTaskId, setDishAnalysisTaskId] = React.useState<string | null>(null)
  const [replaceExistingTags, setReplaceExistingTags] = React.useState(true)

  // Stati per generazione AI categoria
  const [showCategoryAIDialog, setShowCategoryAIDialog] = React.useState(false)
  const [selectedCategoryForAI, setSelectedCategoryForAI] = React.useState<Category | null>(null)
  const [selectedDishesForAI, setSelectedDishesForAI] = React.useState<string[]>([])
  const [isCategoryAIGenerating, setIsCategoryAIGenerating] = React.useState(false)
  const [categoryAITaskId, setCategoryAITaskId] = React.useState<string | null>(null)

  // Stati per l'AI
  const [showAIDialog, setShowAIDialog] = React.useState(false)
  const [aiConfig, setAiConfig] = React.useState({
    enabled: false,
    authorizedNumbers: [],
    permissions: {},
    defaultLanguage: 'it',
    stats: {
      totalCommands: 0,
      successfulCommands: 0,
      lastCommandAt: null as string | null
    }
  })
  const [isLoadingAIConfig, setIsLoadingAIConfig] = React.useState(false)
  const [newAuthorizedNumber, setNewAuthorizedNumber] = React.useState({
    phoneNumber: '',
    name: '',
    permission: 'basic'
  })
  const [isAddingNumber, setIsAddingNumber] = React.useState(false)

  // Stati per la ricerca
  const [searchQuery, setSearchQuery] = React.useState('')
  const [filteredCategories, setFilteredCategories] = React.useState<Category[]>([])
  const [openCategories, setOpenCategories] = React.useState<string[]>([])

  const hasChanges = JSON.stringify(categories) !== JSON.stringify(originalCategories)
  const restaurantId = session?.user?.restaurantId

  // Sensori per drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor)
  )

  // Redirect if not authenticated
  React.useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  // Load menu data
  React.useEffect(() => {
    if (status === "authenticated" && restaurantId) {
      loadMenuData()
    }
  }, [status, restaurantId])

  // Reload menu when language changes
  React.useEffect(() => {
    if (status === "authenticated" && restaurantId && currentLanguage) {
      loadMenuData(currentLanguage)
    }
  }, [currentLanguage])

  // Listen for tags updates
  React.useEffect(() => {
    const handleTagsUpdate = (event: CustomEvent) => {
      setAvailableTags(event.detail)
    }
    
    window.addEventListener('tagsUpdated', handleTagsUpdate as EventListener)
    return () => window.removeEventListener('tagsUpdated', handleTagsUpdate as EventListener)
  }, [])

  // Load supported languages
  React.useEffect(() => {
    if (restaurantId) {
      loadSupportedLanguages()
    }
  }, [restaurantId])

  // Initialize filtered categories when categories change
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories)
    }
  }, [categories, searchQuery])

  // Search logic - filter categories and dishes
  React.useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCategories(categories)
      setOpenCategories([])
      return
    }

    const query = searchQuery.toLowerCase().trim()
    const categoriesWithResults: Category[] = []
    const categoriesToOpen: string[] = []

    categories.forEach(category => {
      // Check if category name matches
      const categoryMatches = category.name.toLowerCase().includes(query)
      
      // Check if any dish in this category matches
      const matchingDishes = category.dishes.filter(dish => {
        const dishNameMatches = dish.name.toLowerCase().includes(query)
        const dishDescriptionMatches = dish.description?.toLowerCase().includes(query) || false
        const dishIngredientsMatch = dish.ingredients?.some(ingredient => 
          ingredient.toLowerCase().includes(query)
        ) || false
        
        return dishNameMatches || dishDescriptionMatches || dishIngredientsMatch
      })

      // If category matches or has matching dishes, include it
      if (categoryMatches || matchingDishes.length > 0) {
        categoriesWithResults.push({
          ...category,
          dishes: categoryMatches ? category.dishes : matchingDishes
        })

        // If there are matching dishes (not just category), auto-open the category
        if (matchingDishes.length > 0) {
          categoriesToOpen.push(category.id)
        }
      }
    })

    setFilteredCategories(categoriesWithResults)
    setOpenCategories(categoriesToOpen)
  }, [searchQuery, categories])

  const loadMenuData = async (language?: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const langParam = language || currentLanguage
      const response = await fetch(`/api/menu/${restaurantId}?lang=${langParam}`)
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error)
      }
      
      setMenuData(data.data)
      setCategories(data.data.categories)
      setOriginalCategories(JSON.parse(JSON.stringify(data.data.categories)))
      setAvailableTags(data.data.availableTags)
      
      // Aggiorna le lingue supportate e la lingua corrente
      if (data.data.menu?.supportedLanguages) {
        setSupportedLanguages(data.data.menu.supportedLanguages)
        
        // Trova la lingua di default se non è stata specificata una lingua
        if (!language) {
          const defaultLang = data.data.menu.supportedLanguages.find((lang: any) => lang.isDefault)
          if (defaultLang) {
            setCurrentLanguage(defaultLang.code)
          }
        }
      }
      
      // Carica le impostazioni brand dal menu
      if (data.data.menu?.designSettings) {
        // Normalizza i fornitori per assicurarsi che abbiano sempre un campo id
        const normalizedSuppliers = (data.data.menu.designSettings.suppliers || []).map((supplier: any) => ({
          ...supplier,
          id: supplier.id || supplier._id || Date.now().toString()
        }))

        setBrandSettings({
          primaryColor: data.data.menu.designSettings.primaryColor || '#3B82F6',
          secondaryColor: data.data.menu.designSettings.secondaryColor || '#64748B',
          coverImageUrl: data.data.menu.designSettings.coverImageUrl || '',
          logoUrl: data.data.menu.designSettings.logoUrl || '',
          hideDescription: data.data.menu.designSettings.hideDescription || false,
          hideIngredients: data.data.menu.designSettings.hideIngredients || false,
          tagDisplayMode: data.data.menu.designSettings.tagDisplayMode || 'full',
          fontFamily: data.data.menu.designSettings.fontFamily || 'Inter',
          categoryBannerPosition: data.data.menu.designSettings.categoryBannerPosition || 'dynamic',
          suppliers: normalizedSuppliers
        })
      }
      
    } catch (err: any) {
      console.error('Error loading menu data:', err)
      setError(err.message || 'Errore nel caricamento del menu')
    } finally {
      setIsLoading(false)
    }
  }

  // Load supported languages
  const loadSupportedLanguages = async () => {
    try {
      const response = await fetch(`/api/menu/${restaurantId}/languages`)
      const data = await response.json()
      
      if (data.success) {
        setSupportedLanguages(data.languages)
      }
    } catch (err) {
      console.error('Error loading supported languages:', err)
    }
  }

  // Handle language change
  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === currentLanguage) return
    
    try {
      setIsLoadingLanguage(true)
      setCurrentLanguage(languageCode)
      await loadMenuData(languageCode)
    } catch (err) {
      console.error('Error changing language:', err)
      // Revert language change on error
      setCurrentLanguage(currentLanguage)
      toast({
        title: "Errore nel cambio lingua",
        description: "Impossibile caricare il menu nella lingua selezionata",
        variant: "destructive",
        duration: 4000,
      })
    } finally {
      setIsLoadingLanguage(false)
    }
  }

  // Generate translations for a specific language (async)
  const handleGenerateTranslation = async (languageCode: string, languageName: string) => {
    if (!selectedLanguageForTranslation) return
    
    setIsGeneratingTranslation(true)
    setTranslationTaskId(null)
    
    try {
      const response = await fetch('/api/menu/translations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          targetLanguage: languageName,
          targetLanguageCode: languageCode
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success && result.taskId) {
        setTranslationTaskId(result.taskId)
        console.log(`🌍 Task traduzioni avviato: ${result.taskId} per ${languageName}`)
      } else {
        alert(`❌ Errore nell'avvio delle traduzioni: ${result.error}`)
        setIsGeneratingTranslation(false)
      }
    } catch (err) {
      console.error('Error starting translation task:', err)
      alert('❌ Errore nell\'avvio delle traduzioni')
      setIsGeneratingTranslation(false)
    }
  }

  // Handler per quando le traduzioni sono completate
  const handleTranslationComplete = async (result: any) => {
    try {
      console.log('✅ Traduzioni completate:', result)
      
      // Reset stati prima di tutto
      setTranslationTaskId(null)
      setIsGeneratingTranslation(false)
      setSelectedLanguageForTranslation('')
      setShowTranslationsDialog(false) // Chiude automaticamente il dialog
      
      // Mostra messaggio di successo
      if (result.stats) {
        toast({
          title: `✅ ${result.message || 'Traduzioni completate'}!`,
          description: `${result.stats.categoriesTranslated} categorie e ${result.stats.dishesTranslated} piatti tradotti.`,
          duration: 6000,
        })
      } else {
        toast({
          title: "✅ Traduzioni completate con successo!",
          description: "Il menu è stato tradotto nella lingua selezionata.",
          duration: 4000,
        })
      }
      
      // Ricarica i dati in sequenza con un piccolo delay
      console.log('🔄 Ricaricamento lingue supportate...')
      await loadSupportedLanguages()
      
      // Piccolo delay prima del reload del menu
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log('🔄 Ricaricamento dati menu...')
      await loadMenuData()
      
      console.log('✅ Reload completato')
      
    } catch (error) {
      console.error('❌ Errore nel gestire completamento traduzioni:', error)
      
      // Fallback: almeno resettiamo gli stati e ricarichiamo solo i dati base
      setTranslationTaskId(null)
      setIsGeneratingTranslation(false)
      setSelectedLanguageForTranslation('')
      setShowTranslationsDialog(false) // Chiude il dialog anche in caso di errore
      
      // Prova un reload semplificato
      try {
        console.log('🔄 Tentativo reload semplificato...')
        await loadMenuData()
      } catch (fallbackError) {
        console.error('❌ Anche il reload semplificato è fallito:', fallbackError)
        toast({
          title: "⚠️ Problema di ricaricamento",
          description: "Le traduzioni sono state completate ma c'è stato un problema nel ricaricamento. Aggiorna manualmente la pagina.",
          variant: "destructive",
          duration: 8000,
        })
      }
    }
  }

  // Handler per quando le traduzioni falliscono
  const handleTranslationError = (error: any) => {
    console.error('❌ Traduzioni fallite:', error)
    alert(`❌ Errore nelle traduzioni: ${error?.message || 'Errore sconosciuto'}`)
    setTranslationTaskId(null)
    setIsGeneratingTranslation(false)
    setShowTranslationsDialog(false) // Chiude il dialog in caso di errore
  }

  // Handler per cancellare una traduzione
  const handleDeleteTranslation = async (languageCode: string, languageName: string) => {
    if (!confirm(`🗑️ Sei sicuro di voler eliminare tutte le traduzioni in ${languageName}?\n\nQuesta operazione cancellerà:\n• Traduzioni di tutte le categorie\n• Traduzioni di tutti i piatti\n• Descrizioni e ingredienti tradotti\n\nL'operazione è irreversibile.`)) {
      return
    }

    setIsDeletingTranslation(true)
    setDeletionTaskId(null)
    
    try {
      const response = await fetch(`/api/menu/translations/${restaurantId}/${languageCode}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await response.json()
      
      if (response.ok && result.success && result.taskId) {
        setDeletionTaskId(result.taskId)
        console.log(`🗑️ Task cancellazione traduzione avviato: ${result.taskId} per ${languageName}`)
      } else {
        alert(`❌ Errore nell'avvio della cancellazione: ${result.error}`)
        setIsDeletingTranslation(false)
      }
    } catch (err) {
      console.error('Error starting deletion task:', err)
      alert('❌ Errore nell\'avvio della cancellazione')
      setIsDeletingTranslation(false)
    }
  }

  // Handler per quando la cancellazione è completata
  const handleDeletionComplete = async (result: any) => {
    try {
      console.log('✅ Cancellazione traduzione completata:', result)
      
      // Reset stati
      setDeletionTaskId(null)
      setIsDeletingTranslation(false)
      
      // Mostra messaggio di successo
      if (result.stats) {
        toast({
          title: `✅ ${result.message || 'Traduzione cancellata'}!`,
          description: `${result.stats.categoriesUpdated} categorie e ${result.stats.itemsUpdated} piatti aggiornati.`,
          duration: 6000,
        })
      } else {
        toast({
          title: "✅ Traduzione cancellata con successo!",
          description: "La traduzione è stata rimossa dal menu.",
          duration: 4000,
        })
      }
      
      // Ricarica i dati
      console.log('🔄 Ricaricamento lingue supportate...')
      await loadSupportedLanguages()
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log('🔄 Ricaricamento dati menu...')
      await loadMenuData()
      
      console.log('✅ Reload completato')
      
    } catch (error) {
      console.error('❌ Errore nel gestire completamento cancellazione:', error)
      
      // Fallback reset
      setDeletionTaskId(null)
      setIsDeletingTranslation(false)
      
      // Prova un reload semplificato
      try {
        console.log('🔄 Tentativo reload semplificato...')
        await loadMenuData()
      } catch (fallbackError) {
        console.error('❌ Anche il reload semplificato è fallito:', fallbackError)
        toast({
          title: "⚠️ Problema di ricaricamento",
          description: "La traduzione è stata cancellata ma c'è stato un problema nel ricaricamento. Aggiorna manualmente la pagina.",
          variant: "destructive",
          duration: 8000,
        })
      }
    }
  }

  // Handler per quando la cancellazione fallisce
  const handleDeletionError = (error: any) => {
    console.error('❌ Cancellazione traduzione fallita:', error)
    let errorMessage = '❌ Errore nella cancellazione della traduzione'
    
    if (error?.message) {
      errorMessage = '❌ ' + error.message
    }
    
    alert(errorMessage)
    setDeletionTaskId(null)
    setIsDeletingTranslation(false)
  }

  // Handler per impostare una lingua come predefinita
  const handleSetDefaultLanguage = async (languageCode: string, languageName: string) => {
    if (!confirm(`🔄 Vuoi impostare ${languageName} come lingua predefinita del menu?\n\nQuesta operazione:\n• Cambierà la lingua principale del menu\n• Aggiornerà tutti i contenuti di base\n• Non cancellerà le altre traduzioni\n\nContinuare?`)) {
      return
    }

    try {
      const response = await fetch(`/api/menu/${restaurantId}/languages/default`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newDefaultLanguage: languageCode })
      })

      const result = await response.json()
      
      if (response.ok && result.success) {
        toast({
          title: "✅ Lingua predefinita aggiornata!",
          description: `${languageName} è ora la lingua predefinita del menu.`,
          duration: 4000,
        })
        
        // Ricarica i dati del menu e delle lingue supportate
        await loadSupportedLanguages()
        await loadMenuData()
        
        // Imposta la nuova lingua come corrente
        setCurrentLanguage(languageCode)
      } else {
        alert(`❌ Errore nell'aggiornamento: ${result.error}`)
      }
    } catch (err) {
      console.error('Error setting default language:', err)
      alert('❌ Errore nell\'impostazione della lingua predefinita')
    }
  }

  // Handler per avviare l'analisi AI dei piatti
  const handleAnalyzeDishes = async () => {
    if (!restaurantId) return

    if (!confirm(`🤖 Vuoi che l'AI analizzi tutti i piatti del menu e assegni automaticamente le etichette più appropriate basate sui trend 2024?\n\n${replaceExistingTags ? '⚠️ ATTENZIONE: Questo rimuoverà tutte le etichette esistenti e le sostituirà con quelle generate dall\'AI.' : 'Le nuove etichette si aggiungeranno a quelle esistenti.'}\n\nL'operazione può richiedere alcuni minuti.`)) {
      return
    }

    setIsAnalyzingDishes(true)
    setDishAnalysisTaskId(null)
    
    try {
      const response = await fetch('/api/menu/ai-analyze-dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          replaceExistingTags
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success && result.taskId) {
        setDishAnalysisTaskId(result.taskId)
        console.log(`🤖 Task analisi AI piatti avviato: ${result.taskId}`)
      } else {
        alert(`❌ Errore nell'avvio dell'analisi AI: ${result.error}`)
        setIsAnalyzingDishes(false)
      }
    } catch (err) {
      console.error('Error starting AI dish analysis:', err)
      alert('❌ Errore nell\'avvio dell\'analisi AI')
      setIsAnalyzingDishes(false)
    }
  }

  // Handler per quando l'analisi AI è completata
  const handleDishAnalysisComplete = async (result: any) => {
    try {
      console.log('✅ Analisi AI piatti completata:', result)
      
      // Reset stati
      setDishAnalysisTaskId(null)
      setIsAnalyzingDishes(false)
      
      // Mostra messaggio di successo dettagliato
      if (result.stats) {
        const { totalDishes, tagsCreated, dishesUpdated, mainTrends, recommendations } = result.stats
        let description = `📊 Risultati: ${totalDishes} piatti analizzati, ${tagsCreated} etichette create/utilizzate, ${dishesUpdated} piatti aggiornati.`
        
        if (mainTrends && mainTrends.length > 0) {
          description += ` 🔥 Trend identificati: ${mainTrends.join(', ')}.`
        }
        
        if (recommendations) {
          description += ` 💡 ${recommendations}`
        }
        
        toast({
          title: "🎉 Analisi AI completata con successo!",
          description,
          duration: 8000,
        })
      } else {
        toast({
          title: "✅ Analisi AI completata con successo!",
          description: "I piatti sono stati analizzati e le etichette sono state aggiornate.",
          duration: 4000,
        })
      }
      
      // Ricarica i dati del menu per vedere i nuovi tag
      console.log('🔄 Ricaricamento dati menu completo...')
      await loadMenuData()
      
      // Ricarica esplicitamente le etichette disponibili per essere sicuri
      console.log('🏷️ Ricaricamento esplicito etichette disponibili...')
      try {
        const tagsResponse = await fetch(`/api/menu/tags/${restaurantId}`)
        const tagsData = await tagsResponse.json()
        
        if (tagsData.success) {
          console.log(`✅ Ricaricate ${tagsData.tags.length} etichette disponibili`)
          setAvailableTags(tagsData.tags)
          
          // Forza un aggiornamento dell'evento per notificare eventuali componenti
          window.dispatchEvent(new CustomEvent('tagsUpdated', { detail: tagsData.tags }))
        } else {
          console.warn('⚠️ Errore nel ricaricamento etichette:', tagsData.error)
        }
      } catch (tagsError) {
        console.error('❌ Errore nel ricaricamento etichette:', tagsError)
      }
      
      console.log('✅ Reload completato')
      
    } catch (error) {
      console.error('❌ Errore nel gestire completamento analisi AI:', error)
      
      // Fallback reset
      setDishAnalysisTaskId(null)
      setIsAnalyzingDishes(false)
      
      // Prova un reload semplificato
      try {
        console.log('🔄 Tentativo reload semplificato...')
        await loadMenuData()
        
        // Prova comunque a ricaricare le etichette
        const tagsResponse = await fetch(`/api/menu/tags/${restaurantId}`)
        const tagsData = await tagsResponse.json()
        if (tagsData.success) {
          setAvailableTags(tagsData.tags)
        }
      } catch (fallbackError) {
        console.error('❌ Anche il reload semplificato è fallito:', fallbackError)
        toast({
          title: "⚠️ Problema di ricaricamento",
          description: "L'analisi è stata completata ma c'è stato un problema nel ricaricamento. Aggiorna manualmente la pagina.",
          variant: "destructive",
          duration: 8000,
        })
      }
    }
  }

  // Handler per quando l'analisi AI fallisce
  const handleDishAnalysisError = (error: any) => {
    console.error('❌ Analisi AI piatti fallita:', error)
    let errorMessage = '❌ Errore nell\'analisi AI dei piatti'
    
    if (error?.message) {
      errorMessage = '❌ ' + error.message
    }
    
    alert(errorMessage)
    setDishAnalysisTaskId(null)
    setIsAnalyzingDishes(false)
  }

  // Handler per generazione AI categoria
  const handleCategoryAIToggleDish = (dishId: string) => {
    setSelectedDishesForAI(prev => 
      prev.includes(dishId) 
        ? prev.filter(id => id !== dishId)
        : [...prev, dishId]
    )
  }

  const handleCategoryAISelectAll = () => {
    if (!selectedCategoryForAI) return
    const allDishIds = selectedCategoryForAI.dishes.map(dish => dish.id)
    setSelectedDishesForAI(allDishIds)
  }

  const handleCategoryAIDeselectAll = () => {
    setSelectedDishesForAI([])
  }

  const handleStartCategoryAI = async () => {
    if (!selectedCategoryForAI || selectedDishesForAI.length === 0) return

    setIsCategoryAIGenerating(true)
    setCategoryAITaskId(null)

    try {
      const response = await fetch(`/api/menu/category/${selectedCategoryForAI.id}/generate-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dishIds: selectedDishesForAI,
          useAutoPrompt: true
        })
      })

      const result = await response.json()
      
      if (response.ok && result.success && result.taskId) {
        setCategoryAITaskId(result.taskId)
        console.log(`🎨 [CATEGORY AI] Task avviato: ${result.taskId} per categoria "${selectedCategoryForAI.name}"`)
      } else {
        alert(`❌ Errore nell'avvio della generazione: ${result.error}`)
        setIsCategoryAIGenerating(false)
      }
    } catch (err) {
      console.error('Error starting category AI generation:', err)
      alert('❌ Errore nell\'avvio della generazione AI')
      setIsCategoryAIGenerating(false)
    }
  }

  const handleCategoryAIComplete = async (result: any) => {
    try {
      console.log('✅ Generazione categoria AI completata:', result)
      
      // Reset stati
      setCategoryAITaskId(null)
      setIsCategoryAIGenerating(false)
      setShowCategoryAIDialog(false)
      setSelectedCategoryForAI(null)
      setSelectedDishesForAI([])
      
      // Mostra messaggio di successo
      if (result.stats) {
        toast({
          title: `🎉 Generazione categoria completata!`,
          description: `${result.stats.successCount}/${result.stats.totalDishes} immagini create per "${result.stats.categoryName}".`,
          duration: 6000,
        })
      } else {
        toast({
          title: "✅ Immagini generate con successo!",
          description: "Le immagini AI sono state create per i piatti selezionati.",
          duration: 4000,
        })
      }
      
      // Ricarica i dati del menu
      await loadMenuData()
      
    } catch (error) {
      console.error('❌ Errore nel gestire completamento categoria AI:', error)
      
      // Fallback reset
      setCategoryAITaskId(null)
      setIsCategoryAIGenerating(false)
      setShowCategoryAIDialog(false)
      setSelectedCategoryForAI(null)
      setSelectedDishesForAI([])
      
      toast({
        title: "⚠️ Problema di aggiornamento",
        description: "Le immagini sono state generate ma c'è stato un problema. Aggiorna la pagina per vedere i risultati.",
        variant: "destructive",
        duration: 8000,
      })
    }
  }

  const handleCategoryAIError = (error: any) => {
    console.error('❌ Generazione categoria AI fallita:', error)
    let errorMessage = '❌ Errore nella generazione delle immagini'
    
    if (error?.message) {
      errorMessage = '❌ ' + error.message
    }
    
    alert(errorMessage)
    setCategoryAITaskId(null)
    setIsCategoryAIGenerating(false)
    setShowCategoryAIDialog(false)
    setSelectedCategoryForAI(null)
    setSelectedDishesForAI([])
  }

  // Handler per aprire il dialog AI categoria
  const handleOpenCategoryAI = (category: Category) => {
    setSelectedCategoryForAI(category)
    setSelectedDishesForAI([])
    setShowCategoryAIDialog(true)
  }

  // Predefined languages available for translation
  const availableLanguages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'nl', name: 'Nederlands', flag: '🇳🇱' },
    { code: 'sv', name: 'Svenska', flag: '🇸🇪' },
    { code: 'da', name: 'Dansk', flag: '🇩🇰' },
    { code: 'no', name: 'Norsk', flag: '🇳🇴' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
    { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
    { code: 'he', name: 'עברית', flag: '🇮🇱' },
    { code: 'th', name: 'ไทย', flag: '🇹🇭' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
    { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
    { code: 'hu', name: 'Magyar', flag: '🇭🇺' },
    { code: 'ro', name: 'Română', flag: '🇷🇴' },
    { code: 'fi', name: 'Suomi', flag: '🇫🇮' }
  ]

  // Get languages not yet translated
  const getUntranslatedLanguages = () => {
    const supportedCodes = supportedLanguages.map(lang => lang.code)
    
    // Add all available languages including common ones
    const allLanguages = [
      { code: 'it', name: 'Italiano', flag: '🇮🇹' },
      ...availableLanguages
    ]
    
    return allLanguages.filter(lang => !supportedCodes.includes(lang.code))
  }

  // Load AI configuration
  const loadAIConfig = async () => {
    try {
      setIsLoadingAIConfig(true)
      const response = await fetch('/api/ai-commands/config')
      const data = await response.json()
      
      if (data.success) {
        setAiConfig(data.data)
      }
    } catch (err) {
      console.error('Error loading AI config:', err)
    } finally {
      setIsLoadingAIConfig(false)
    }
  }

  // Update AI configuration
  const updateAIConfig = async (updates: Partial<typeof aiConfig>) => {
    try {
      const response = await fetch('/api/ai-commands/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      })
      
      const data = await response.json()
      
      if (data.success) {
        setAiConfig(prev => ({ ...prev, ...updates }))
        alert('✅ Configurazione AI aggiornata con successo!')
      } else {
        alert('❌ Errore nell\'aggiornamento: ' + data.message)
      }
    } catch (err) {
      console.error('Error updating AI config:', err)
      alert('❌ Errore nell\'aggiornamento della configurazione AI')
    }
  }

  // Add authorized number
  const addAuthorizedNumber = async () => {
    if (!newAuthorizedNumber.phoneNumber || !newAuthorizedNumber.name) {
      alert('Inserisci numero di telefono e nome')
      return
    }

    try {
      setIsAddingNumber(true)
      const response = await fetch('/api/ai-commands/authorized-numbers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAuthorizedNumber)
      })
      
      const data = await response.json()
      
      if (data.success) {
        await loadAIConfig() // Reload config
        setNewAuthorizedNumber({ phoneNumber: '', name: '', permission: 'basic' })
        alert('✅ Numero autorizzato aggiunto con successo!')
      } else {
        alert('❌ Errore: ' + data.message)
      }
    } catch (err) {
      console.error('Error adding authorized number:', err)
      alert('❌ Errore nell\'aggiunta del numero autorizzato')
    } finally {
      setIsAddingNumber(false)
    }
  }

  // Remove authorized number
  const removeAuthorizedNumber = async (numberId: string) => {
    if (!confirm('Sei sicuro di voler rimuovere questo numero autorizzato?')) {
      return
    }

    try {
      const response = await fetch(`/api/ai-commands/authorized-numbers/${numberId}`, {
        method: 'DELETE'
      })
      
      const data = await response.json()
      
      if (data.success) {
        await loadAIConfig() // Reload config
        alert('✅ Numero rimosso con successo!')
      } else {
        alert('❌ Errore: ' + data.message)
      }
    } catch (err) {
      console.error('Error removing authorized number:', err)
      alert('❌ Errore nella rimozione del numero')
    }
  }

  // Load AI config when dialog opens
  React.useEffect(() => {
    if (showAIDialog && restaurantId) {
      loadAIConfig()
    }
  }, [showAIDialog, restaurantId])

  // Handler functions
  const handleAddDish = async (categoryId: string) => {
    try {
      const response = await fetch('/api/menu/item', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          restaurantId
        })
      })
      if (response.ok) {
        loadMenuData() // Reload to get the new dish
      }
    } catch (err) {
      console.error('Error adding dish:', err)
    }
  }

  const handleDishUpdate = (categoryId: string, updatedDish: Dish) => {
    setCategories(categories.map((cat: Category) => 
      cat.id === categoryId 
        ? { ...cat, dishes: cat.dishes.map(d => d.id === updatedDish.id ? updatedDish : d) }
        : cat
    ))
  }

  const handleDishDuplicate = async (categoryId: string, dish: Dish) => {
    try {
      const response = await fetch(`/api/menu/item/${dish.id}/duplicate`, {
        method: 'POST'
      })
      if (response.ok) {
        loadMenuData() // Reload to get the new dish
      }
    } catch (err) {
      console.error('Error duplicating dish:', err)
    }
  }

  const handleDishDelete = async (categoryId: string, dishId: string) => {
    try {
      const response = await fetch(`/api/menu/item/${dishId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setCategories(categories.map((cat: Category) => 
          cat.id === categoryId 
            ? { ...cat, dishes: cat.dishes.filter(d => d.id !== dishId) }
            : cat
        ))
      }
    } catch (err) {
      console.error('Error deleting dish:', err)
    }
  }

  const handleBulkPriceUpdate = () => {
    setBulkMode(true)
    setSelectedBulkItems([])
    // Scroll automatico verso l'alto per mostrare la modal
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleExitBulkMode = () => {
    setBulkMode(false)
    setSelectedBulkItems([])
  }

  const handleBulkItemToggle = (dishId: string) => {
    setSelectedBulkItems(prev => 
      prev.includes(dishId) 
        ? prev.filter(id => id !== dishId)
        : [...prev, dishId]
    )
  }

  const handleApplyBulkPriceUpdate = async () => {
    const updateAmount = bulkUpdateType === "fixed" 
      ? parseFloat(bulkFixedAmount) || 0 
      : parseFloat(bulkPercentage) || 0

    if (updateAmount === 0) return

    try {
      const response = await fetch('/api/menu/item', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          operation: 'bulk-price-update',
          restaurantId,
          selectedItems: selectedBulkItems,
          updateType: bulkUpdateType,
          amount: updateAmount
        })
      })

      if (response.ok) {
        setShowBulkPriceDialog(false)
        setBulkMode(false)
        setSelectedBulkItems([])
        setBulkFixedAmount("")
        setBulkPercentage("")
        loadMenuData() // Reload to get updated prices
      }
    } catch (err) {
      console.error('Error updating prices:', err)
    }
  }

  const handleImportMenu = () => {
    setShowImportDialog(true)
  }

  const handleFilesImport = (files: Array<{ url: string; type: "image" | "pdf"; name: string }>) => {
    setImportedFiles(files)
  }

  const handleAnalyzeMenu = async () => {
    if (importedFiles.length === 0) return

    setIsAnalyzing(true)
    setAnalysisTaskId(null)
    setAnalyzedData(null)
    
    try {
      const response = await fetch('/api/menu/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: importedFiles,
          restaurantId
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.taskId) {
          setAnalysisTaskId(data.taskId)
          console.log('📋 Analisi avviata con taskId:', data.taskId)
        } else {
          throw new Error('Risposta non valida dal server')
        }
      } else {
        const error = await response.json()
        alert('Errore nell\'analisi: ' + (error.error || 'Errore sconosciuto'))
      }
    } catch (err) {
      console.error('Error analyzing menu:', err)
      alert('Errore nell\'analisi del menu')
      setAnalysisTaskId(null)
    }
    setIsAnalyzing(false)
  }

  // Handler per quando l'analisi asincrona è completata
  const handleAnalysisComplete = (result: any) => {
    console.log('✅ Analisi completata:', result)
    if (result.menuData) {
      setAnalyzedData(result.menuData)
      setShowAnalysisPreview(true)
    }
    setAnalysisTaskId(null)
  }

  // Handler per quando l'analisi asincrona fallisce
  const handleAnalysisError = (error: any) => {
    console.error('❌ Analisi fallita:', error)
    alert('Errore nell\'analisi: ' + (error?.message || 'Errore sconosciuto'))
    setAnalysisTaskId(null)
  }

  const handleConfirmImport = async () => {
    if (!analyzedData) return

    try {
      const response = await fetch('/api/menu/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          menuData: analyzedData,
          addIngredientsDescription
        })
      })

      if (response.ok) {
        setShowImportDialog(false)
        setShowAnalysisPreview(false)
        setImportedFiles([])
        setAnalyzedData(null)
        setAnalysisTaskId(null) // Reset del task ID per fermare il polling
        loadMenuData() // Reload to show imported data
        alert('Menu importato con successo!')
      } else {
        const error = await response.json()
        alert('Errore nell\'importazione: ' + (error.error || 'Errore sconosciuto'))
      }
    } catch (err) {
      console.error('Error importing menu:', err)
      alert('Errore nell\'importazione del menu')
    }
  }

  // Funzioni per gestione Brand
  const handleBrandImageUpload = async (fileUrl: string, imageType: 'cover' | 'logo') => {
    try {
      setIsUpdatingBrand(true)
      
      const updatedSettings = {
        ...brandSettings,
        [imageType === 'cover' ? 'coverImageUrl' : 'logoUrl']: fileUrl
      }
      
      const response = await fetch(`/api/menu/${restaurantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designSettings: updatedSettings
        })
      })
      
      if (response.ok) {
        setBrandSettings(updatedSettings)
        alert(`${imageType === 'cover' ? 'Immagine copertina' : 'Logo'} aggiornato con successo!`)
      } else {
        alert('Errore nell\'aggiornamento dell\'immagine')
      }
    } catch (err) {
      console.error('Error updating brand image:', err)
      alert('Errore nell\'aggiornamento dell\'immagine')
    } finally {
      setIsUpdatingBrand(false)
    }
  }

  const handleBrandColorUpdate = async (colorType: 'primary' | 'secondary', color: string) => {
    try {
      const updatedSettings = {
        ...brandSettings,
        [colorType === 'primary' ? 'primaryColor' : 'secondaryColor']: color
      }
      
      const response = await fetch(`/api/menu/${restaurantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designSettings: updatedSettings
        })
      })
      
      if (response.ok) {
        setBrandSettings(updatedSettings)
      }
    } catch (err) {
      console.error('Error updating brand color:', err)
    }
  }

  const handleBrandVisibilityUpdate = async (visibilityType: 'description' | 'ingredients', visible: boolean) => {
    try {
      const updatedSettings = {
        ...brandSettings,
        [visibilityType === 'description' ? 'hideDescription' : 'hideIngredients']: !visible
      }
      
      const response = await fetch(`/api/menu/${restaurantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designSettings: updatedSettings
        })
      })
      
      if (response.ok) {
        setBrandSettings(updatedSettings)
      }
    } catch (err) {
      console.error('Error updating brand visibility:', err)
    }
  }

  const handleBrandTagDisplayUpdate = async (tagDisplayMode: string) => {
    try {
      const updatedSettings = {
        ...brandSettings,
        tagDisplayMode
      }
      
      const response = await fetch(`/api/menu/${restaurantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designSettings: updatedSettings
        })
      })
      
      if (response.ok) {
        setBrandSettings(updatedSettings)
      }
    } catch (err) {
      console.error('Error updating tag display mode:', err)
    }
  }

  const handleBrandFontUpdate = async (fontFamily: string) => {
    try {
      const updatedSettings = {
        ...brandSettings,
        fontFamily
      }
      
      const response = await fetch(`/api/menu/${restaurantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designSettings: updatedSettings
        })
      })
      
      if (response.ok) {
        setBrandSettings(updatedSettings)
      }
    } catch (err) {
      console.error('Error updating font family:', err)
    }
  }

  const handleBrandCategoryBannerUpdate = async (categoryBannerPosition: string) => {
    try {
      const updatedSettings = {
        ...brandSettings,
        categoryBannerPosition
      }
      
      const response = await fetch(`/api/menu/${restaurantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designSettings: updatedSettings
        })
      })
      
      if (response.ok) {
        setBrandSettings(updatedSettings)
      }
    } catch (err) {
      console.error('Error updating category banner position:', err)
    }
  }

  // Funzioni per gestione Fornitori
  const handleOpenSupplierDialog = (supplier: Supplier | null = null) => {
    if (supplier) {
      setEditingSupplier(supplier)
      setSupplierForm({
        name: supplier.name,
        logoUrl: supplier.logoUrl
      })
    } else {
      setEditingSupplier(null)
      setSupplierForm({
        name: '',
        logoUrl: ''
      })
    }
    setShowAddSupplierDialog(true)
  }

  const handleSupplierLogoUpload = (fileUrl: string) => {
    setSupplierForm(prev => ({
      ...prev,
      logoUrl: fileUrl
    }))
  }

  const handleSaveSupplier = async () => {
    if (!supplierForm.name.trim()) {
      alert('Il nome del fornitore è obbligatorio')
      return
    }
    
    if (!supplierForm.logoUrl) {
      alert('Il logo del fornitore è obbligatorio')
      return
    }

    try {
      const suppliers = [...brandSettings.suppliers]
      
      if (editingSupplier) {
        // Modifica fornitore esistente
        const index = suppliers.findIndex(s => (s.id || (s as any)._id) === (editingSupplier.id || (editingSupplier as any)._id))
        if (index !== -1) {
          suppliers[index] = {
            ...suppliers[index],
            id: editingSupplier.id || (editingSupplier as any)._id || Date.now().toString(), // Assicura che ci sia sempre un id
            name: supplierForm.name.trim(),
            logoUrl: supplierForm.logoUrl
          }
        }
      } else {
        // Aggiungi nuovo fornitore
        const newSupplier = {
          id: Date.now().toString(), // ID temporaneo per il frontend
          name: supplierForm.name.trim(),
          logoUrl: supplierForm.logoUrl,
          sortOrder: suppliers.length,
          isActive: true
        }
        suppliers.push(newSupplier)
      }
      
      const updatedSettings = {
        ...brandSettings,
        suppliers
      }
      
      const response = await fetch(`/api/menu/${restaurantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designSettings: updatedSettings
        })
      })
      
      if (response.ok) {
        setBrandSettings(updatedSettings)
        setShowAddSupplierDialog(false)
        setSupplierForm({ name: '', logoUrl: '' })
        setEditingSupplier(null)
        alert(`Fornitore ${editingSupplier ? 'aggiornato' : 'aggiunto'} con successo!`)
      } else {
        alert('Errore nel salvataggio del fornitore')
      }
    } catch (err) {
      console.error('Error saving supplier:', err)
      alert('Errore nel salvataggio del fornitore')
    }
  }

  const handleDeleteSupplier = async (supplierId: string) => {
    if (!confirm('Sei sicuro di voler eliminare questo fornitore?')) {
      return
    }

    try {
      const suppliers = brandSettings.suppliers.filter(s => (s.id || (s as any)._id) !== supplierId)
      
      const updatedSettings = {
        ...brandSettings,
        suppliers
      }
      
      const response = await fetch(`/api/menu/${restaurantId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designSettings: updatedSettings
        })
      })
      
      if (response.ok) {
        setBrandSettings(updatedSettings)
        alert('Fornitore eliminato con successo!')
      } else {
        alert('Errore nell\'eliminazione del fornitore')
      }
    } catch (err) {
      console.error('Error deleting supplier:', err)
      alert('Errore nell\'eliminazione del fornitore')
    }
  }

  // Gestori per drag and drop
  const handleCategoryReorder = async (newCategories: Category[]) => {
    setCategories(newCategories)
    
    try {
      const categoryOrders = newCategories.map((cat, index) => ({
        categoryId: cat.id,
        sortOrder: index
      }))
      
      await fetch('/api/menu/categories/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantId,
          categoryOrders
        })
      })
    } catch (err) {
      console.error('Error reordering categories:', err)
    }
  }

  const handleDishReorder = async (categoryId: string, newDishes: Dish[]) => {
    // Aggiorna lo stato locale
    setCategories(categories.map(cat => 
      cat.id === categoryId 
        ? { ...cat, dishes: newDishes }
        : cat
    ))
    
    try {
      const dishOrders = newDishes.map((dish, index) => ({
        dishId: dish.id,
        sortOrder: index
      }))
      
      await fetch('/api/menu/dishes/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          dishOrders
        })
      })
    } catch (err) {
      console.error('Error reordering dishes:', err)
    }
  }

  // Funzione per trasferire un piatto tra categorie
  const handleDishTransfer = async (dishId: string, targetCategoryId: string) => {
    // Trova il piatto e le categorie coinvolte
    const sourceDish = categories.flatMap(cat => cat.dishes).find(dish => dish.id === dishId)
    const sourceCategory = findCategoryByDishId(dishId)
    const targetCategory = categories.find(cat => cat.id === targetCategoryId)
    
    if (!sourceDish || !sourceCategory || !targetCategory) {
      console.error('❌ Piatto o categorie non trovati per il trasferimento')
      toast({
        title: "❌ Errore nel trasferimento",
        description: "Impossibile trovare il piatto o le categorie di origine/destinazione.",
        variant: "destructive",
        duration: 4000,
      })
      return
    }
    
    console.log('🍽️ Trasferisco piatto:', { 
      dishId, 
      dishName: sourceDish.name,
      sourceCategory: sourceCategory.name,
      targetCategory: targetCategory.name,
      targetCategoryId 
    })
    
    // Salva una copia dello stato originale per il revert
    const originalCategories = JSON.parse(JSON.stringify(categories))
    
    // AGGIORNAMENTO OTTIMISTICO: sposta il piatto immediatamente nell'interfaccia
    const updatedCategories = categories.map(cat => {
      if (cat.id === sourceCategory.id) {
        // Rimuovi il piatto dalla categoria sorgente
        return {
          ...cat,
          dishes: cat.dishes.filter(dish => dish.id !== dishId)
        }
      } else if (cat.id === targetCategoryId) {
        // Aggiungi il piatto alla categoria destinazione
        return {
          ...cat,
          dishes: [...cat.dishes, sourceDish]
        }
      }
      return cat
    })
    
    // Aggiorna immediatamente lo stato locale
    console.log('⚡ Aggiornamento ottimistico stato locale:', {
      originalCategoriesCount: originalCategories.length,
      updatedCategoriesCount: updatedCategories.length,
      sourceCategory: {
        id: sourceCategory.id,
        name: sourceCategory.name,
        originalDishCount: originalCategories.find((c: Category) => c.id === sourceCategory.id)?.dishes.length,
        newDishCount: updatedCategories.find((c: Category) => c.id === sourceCategory.id)?.dishes.length
      },
      targetCategory: {
        id: targetCategory.id,
        name: targetCategory.name,
        originalDishCount: originalCategories.find((c: Category) => c.id === targetCategoryId)?.dishes.length,
        newDishCount: updatedCategories.find((c: Category) => c.id === targetCategoryId)?.dishes.length
      }
    })
    setCategories(updatedCategories)
    
    try {
      const response = await fetch(`/api/menu/item/${dishId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: targetCategoryId })
      })
      
      if (response.ok) {
        console.log('✅ Piatto trasferito con successo nel backend')
        
        toast({
          title: "✅ Piatto spostato!",
          description: `"${sourceDish.name}" è stato trasferito in "${targetCategory.name}".`,
          duration: 3000,
        })
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Errore sconosciuto' }))
        console.error('❌ Errore API nel trasferimento:', errorData)
        
        // REVERT: ripristina lo stato originale se l'API fallisce
        setCategories(originalCategories)
        
        toast({
          title: "❌ Errore nel trasferimento",
          description: `Impossibile spostare il piatto: ${errorData.error || 'Errore sconosciuto'}`,
          variant: "destructive",
          duration: 4000,
        })
      }
    } catch (err) {
      console.error('❌ Errore di rete nel trasferimento:', err)
      
      // REVERT: ripristina lo stato originale in caso di errore di rete
      setCategories(originalCategories)
      
      toast({
        title: "❌ Errore di connessione",
        description: "Impossibile spostare il piatto. Verifica la connessione internet.",
        variant: "destructive",
        duration: 4000,
      })
    }
  }

  // Funzione helper per trovare la categoria di un piatto
  const findCategoryByDishId = (dishId: string): Category | undefined => {
    return categories.find(cat => cat.dishes.some(dish => dish.id === dishId))
  }

  // Gestione drag and drop unificata per piatti e categorie
  const handleUnifiedDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) return
    
    console.log('🖱️ Drag end event:', {
      activeId: active.id,
      overId: over.id,
      activeType: typeof active.id,
      overType: typeof over.id
    })
    
    // Determina se stiamo trascinando una categoria o un piatto
    const isActiveCategory = categories.some(cat => cat.id === active.id)
    const isOverCategory = categories.some(cat => cat.id === over.id)
    
    if (isActiveCategory && isOverCategory) {
      // Drag di categoria: riordino categorie
      console.log('📂 Riordinando categorie')
      const oldIndex = categories.findIndex((cat) => cat.id === active.id)
      const newIndex = categories.findIndex((cat) => cat.id === over.id)
      const newCategories = arrayMove(categories, oldIndex, newIndex)
      handleCategoryReorder(newCategories)
    } else if (!isActiveCategory) {
      // Drag di piatto
      const activeDish = categories.flatMap(cat => cat.dishes).find(dish => dish.id === active.id)
      const activeCategory = findCategoryByDishId(active.id as string)
      
      if (!activeDish || !activeCategory) {
        console.warn('⚠️ Piatto o categoria non trovati')
        return
      }
      
      if (isOverCategory) {
        // Trasferimento a categoria diversa
        const targetCategoryId = over.id as string
        
        if (targetCategoryId !== activeCategory.id) {
          console.log(`🔄 Trasferendo piatto "${activeDish.name}" da "${activeCategory.name}" alla categoria ${targetCategoryId}`)
          handleDishTransfer(activeDish.id, targetCategoryId)
        }
      } else {
        // Riordino all'interno della stessa categoria o tra categorie
        const overDish = categories.flatMap(cat => cat.dishes).find(dish => dish.id === over.id)
        const overCategory = findCategoryByDishId(over.id as string)
        
        if (!overDish || !overCategory) {
          console.warn('⚠️ Piatto o categoria target non trovati')
          return
        }
        
        if (activeCategory.id === overCategory.id) {
          // Riordino nella stessa categoria
          console.log(`🔄 Riordinando piatti nella categoria "${activeCategory.name}"`)
          const oldIndex = activeCategory.dishes.findIndex((dish) => dish.id === active.id)
          const newIndex = activeCategory.dishes.findIndex((dish) => dish.id === over.id)
          const newDishes = arrayMove(activeCategory.dishes, oldIndex, newIndex)
          handleDishReorder(activeCategory.id, newDishes)
        } else {
          // Trasferimento a categoria diversa
          console.log(`🔄 Trasferendo piatto "${activeDish.name}" da "${activeCategory.name}" a "${overCategory.name}"`)
          handleDishTransfer(activeDish.id, overCategory.id)
        }
      }
    }
  }

  const handleCategoryDragEnd = (event: DragEndEvent) => {
    // Questa funzione ora è deprecata, usiamo handleUnifiedDragEnd
    handleUnifiedDragEnd(event)
  }

  if (status === "loading" || isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Caricamento menu...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => loadMenuData()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Riprova
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: customStyles }} />
      <div className="bg-gray-50 min-h-screen font-cooper">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-md">
        <div className="w-full max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h1 className="text-xl font-extrabold text-[#1B9AAA]">Il Tuo Menù Digitale</h1>
              <p className="text-sm text-gray-700">Gestisci il tuo menu digitale</p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Language Selector */}
              {supportedLanguages.length > 1 && (
                <div className="relative">
                  <select
                    value={currentLanguage}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    disabled={isLoadingLanguage}
                    className="bg-white rounded-xl border-2 border-gray-300 h-10 w-16 px-2 shadow-md font-medium text-lg transition-all hover:border-[#1B9AAA] focus:outline-none focus:ring-2 focus:ring-[#1B9AAA] text-center appearance-none"
                  >
                    {supportedLanguages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag}
                      </option>
                    ))}
                  </select>
                  {isLoadingLanguage && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80">
                      <Loader2 className="h-4 w-4 animate-spin text-gray-700" />
                    </div>
                  )}
                </div>
              )}
              
              {/* Eye Button */}
              <button 
                className="bg-white rounded-xl border-2 border-gray-300 h-10 w-10 shadow-md transition-all hover:border-[#1B9AAA] hover:bg-gray-50 flex items-center justify-center"
                onClick={() => window.open(`/menu/${restaurantId}`, '_blank')}
              >
                <Eye className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      
      <main className="pt-24 pb-32 max-w-md mx-auto px-4">

        {bulkMode && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">Modalità Aggiornamento Prezzi</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {selectedBulkItems.length} selezionati
                </Badge>
              </div>
              <button
                className="px-3 py-1 text-sm bg-gray-100 border border-gray-300 rounded text-gray-700 hover:bg-gray-200"
                onClick={handleExitBulkMode}
              >
                Esci
              </button>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                className="px-3 py-1 text-sm bg-gray-100 border border-gray-300 rounded text-gray-700 hover:bg-gray-200"
                onClick={() => {
                  const visibleDishIds = filteredCategories.flatMap(cat => cat.dishes.map(dish => dish.id))
                  setSelectedBulkItems(visibleDishIds)
                }}
              >
                Seleziona Tutto{searchQuery && " (Visibili)"}
              </button>
              <button
                className="px-3 py-1 text-sm bg-gray-100 border border-gray-300 rounded text-gray-700 hover:bg-gray-200"
                onClick={() => setSelectedBulkItems([])}
              >
                Deseleziona Tutto
              </button>
              <button
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => setShowBulkPriceDialog(true)}
                disabled={selectedBulkItems.length === 0}
              >
                Applica Modifiche ({selectedBulkItems.length})
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Cerca categorie, piatti, ingredienti..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 w-full text-base border-gray-300 rounded-xl focus:border-blue-500 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {searchQuery && (
            <div className="mt-2 text-sm text-gray-600">
              {filteredCategories.length === 0 ? (
                <span className="text-orange-600">🔍 Nessun risultato trovato per "{searchQuery}"</span>
              ) : (
                <span className="text-blue-600">
                  🔍 {filteredCategories.reduce((sum, cat) => sum + cat.dishes.length, 0)} risultati trovati in {filteredCategories.length} categorie
                </span>
              )}
            </div>
          )}
        </div>

        <DndContext
          sensors={searchQuery ? [] : sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleUnifiedDragEnd}
        >
          <SortableContext
            items={[
              ...filteredCategories.map(cat => cat.id),
              ...filteredCategories.flatMap(cat => cat.dishes.map(dish => dish.id))
            ]}
            strategy={verticalListSortingStrategy}
          >
            <Accordion 
              type="multiple" 
              className="w-full space-y-4" 
              value={searchQuery ? openCategories : undefined}
              defaultValue={searchQuery ? undefined : []}
              onValueChange={searchQuery ? undefined : setOpenCategories}
            >
              {filteredCategories.map((category) => (
                <SortableCategory
                  key={category.id}
                  category={category}
                  onUpdateCategory={(updatedCategory: Category) => {
                    setCategories(categories.map((cat: Category) => cat.id === updatedCategory.id ? updatedCategory : cat))
                  }}
                  onDeleteCategory={async () => {
                    if (confirm(`Sei sicuro di voler eliminare la categoria "${category.name}" e tutti i suoi piatti?`)) {
                      try {
                        const response = await fetch(`/api/menu/category/${category.id}`, {
                          method: 'DELETE'
                        })
                        if (response.ok) {
                          setCategories(categories.filter((cat: Category) => cat.id !== category.id))
                        } else {
                          alert('Errore nell\'eliminazione della categoria')
                        }
                      } catch (err) {
                        console.error('Error deleting category:', err)
                        alert('Errore nell\'eliminazione della categoria')
                      }
                    }
                  }}
                  onAddDish={handleAddDish}
                  availableTags={availableTags}
                  restaurantId={restaurantId!}
                  showBulkCheckbox={bulkMode}
                  selectedBulkItems={selectedBulkItems}
                  onBulkToggle={handleBulkItemToggle}
                  onDishUpdate={handleDishUpdate}
                  onDishDuplicate={handleDishDuplicate}
                  onDishDelete={handleDishDelete}
                  onDishReorder={handleDishReorder}
                  onCategoryAI={handleOpenCategoryAI}
                />
              ))}
            </Accordion>
          </SortableContext>
        </DndContext>

        {/* Add Category Button */}
        <div className="mt-6 space-y-4">
          <button
            className="relative w-full rounded-2xl border-b-4 border-gray-900/20 font-bold uppercase tracking-wider transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-1 active:border-b-0"
            onClick={async () => {
              try {
                const response = await fetch('/api/menu/category', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    menuId: menuData?.menu.id,
                    restaurantId,
                    name: 'Nuova Categoria',
                    icon: '🍽️'
                  })
                })
                if (response.ok) {
                  loadMenuData() // Reload to get the new category
                }
              } catch (err) {
                console.error('Error adding category:', err)
              }
            }}
          >
            <span className="absolute inset-0 -bottom-1 rounded-2xl bg-gray-200"></span>
            <span className="relative flex h-full w-full items-center justify-center rounded-2xl bg-transparent border-dashed border-2 border-gray-300 text-gray-500 py-3 px-6 transition-transform duration-150">
              <PlusCircle className="mr-2 h-4 w-4" /> Aggiungi Categoria
            </span>
          </button>

          {/* Import Menu Button */}
          <button
            className="relative w-full rounded-2xl border-b-4 border-blue-600/20 font-bold uppercase tracking-wider transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-1 active:border-b-0"
            onClick={handleImportMenu}
          >
            <span className="absolute inset-0 -bottom-1 rounded-2xl bg-blue-100"></span>
            <span className="relative flex h-full w-full items-center justify-center rounded-2xl bg-white border-2 border-blue-300 text-blue-600 py-3 px-6 transition-transform duration-150">
              <Upload className="mr-2 h-4 w-4" /> Importa Menu
            </span>
          </button>
        </div>

        {/* Bulk Price Update Dialog - Mobile Optimized */}
        <Dialog open={showBulkPriceDialog} onOpenChange={setShowBulkPriceDialog}>
          <DialogContent className="w-full max-w-md h-full max-h-[100vh] m-0 rounded-none sm:rounded-lg sm:max-h-[90vh] sm:m-4 flex flex-col">
            <DialogHeader className="flex-shrink-0 px-4 py-6 border-b border-gray-200">
              <DialogTitle className="text-2xl font-bold text-gray-800">💰 Aggiorna Prezzi</DialogTitle>
              <DialogDescription className="text-gray-600">
                Seleziona il tipo di aggiornamento per {selectedBulkItems.length} elementi selezionati
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
              {/* Opzione Importo Fisso */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <input
                      type="radio"
                      id="fixed-amount"
                      name="bulk-type"
                      checked={bulkUpdateType === "fixed"}
                      onChange={() => setBulkUpdateType("fixed")}
                      className="w-6 h-6 text-green-600 border-2 border-gray-300 focus:ring-green-500"
                    />
                  </div>
                  <label htmlFor="fixed-amount" className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Plus className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <span className="text-lg font-bold text-gray-800 block">Importo Fisso</span>
                      <span className="text-sm text-gray-600">Aumenta di un importo uguale per tutti</span>
                    </div>
                  </label>
                </div>
                
                {bulkUpdateType === "fixed" && (
                  <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-green-600">€</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={bulkFixedAmount}
                          onChange={(e) => setBulkFixedAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-32 h-12 text-lg font-semibold border-green-300 focus:border-green-500 focus:ring-green-500"
                        />
                      </div>
                      <span className="text-sm text-green-700 font-medium">per ogni piatto</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Opzione Percentuale */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative">
                    <input
                      type="radio"
                      id="percentage"
                      name="bulk-type"
                      checked={bulkUpdateType === "percentage"}
                      onChange={() => setBulkUpdateType("percentage")}
                      className="w-6 h-6 text-blue-600 border-2 border-gray-300 focus:ring-blue-500"
                    />
                  </div>
                  <label htmlFor="percentage" className="flex items-center gap-3 cursor-pointer flex-1">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Percent className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-lg font-bold text-gray-800 block">Percentuale</span>
                      <span className="text-sm text-gray-600">Aumenta di una percentuale</span>
                    </div>
                  </label>
                </div>
                
                {bulkUpdateType === "percentage" && (
                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.1"
                          value={bulkPercentage}
                          onChange={(e) => setBulkPercentage(e.target.value)}
                          placeholder="0"
                          className="w-24 h-12 text-lg font-semibold border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-2xl font-bold text-blue-600">%</span>
                      </div>
                      <span className="text-sm text-blue-700 font-medium">di aumento</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Anteprima */}
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">👀</span>
                  </div>
                  <h4 className="font-bold text-orange-900">Anteprima</h4>
                </div>
                <p className="text-sm text-orange-800 bg-orange-100 p-3 rounded-lg">
                  <span className="font-bold">{selectedBulkItems.length} elementi</span> verranno aggiornati con i nuovi prezzi
                </p>
              </div>
            </div>
            
            <div className="flex-shrink-0 px-4 py-6 border-t border-gray-200 space-y-3">
              <CustomButton
                className="w-full h-14 text-base font-semibold"
                onClick={handleApplyBulkPriceUpdate}
                disabled={
                  (bulkUpdateType === "fixed" && !bulkFixedAmount) ||
                  (bulkUpdateType === "percentage" && !bulkPercentage)
                }
              >
                🚀 Applica Modifiche
              </CustomButton>
              
              <CustomButton
                className="w-full h-12 text-base"
                variant="outline"
                onClick={() => setShowBulkPriceDialog(false)}
              >
                Annulla
              </CustomButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* Menu Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="w-full max-w-md mx-auto h-[90vh] flex flex-col p-0 gap-0">
            <DialogHeader className="flex-shrink-0 px-4 py-6 border-b border-gray-200">
              <DialogTitle className="text-2xl font-bold text-gray-800">📸 Importa Menu</DialogTitle>
              <DialogDescription className="text-gray-600">
                Analizza le immagini del menu con l'intelligenza artificiale
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
              {!showAnalysisPreview && (
                <>
                  {analysisTaskId ? (
                    // Mostra progresso analisi asincrona
                    <AsyncTaskProgress
                      taskId={analysisTaskId}
                      title="Analisi Menu con AI"
                      description={`Stiamo analizzando ${importedFiles.length} immagini del tuo menu...`}
                      onComplete={handleAnalysisComplete}
                      onError={handleAnalysisError}
                      onCancel={() => {
                        setAnalysisTaskId(null)
                        setImportedFiles([])
                      }}
                      pollingInterval={2000}
                      hideProgress={true}
                      showDetails={false}
                      className="my-4"
                    />
                  ) : (
                    // Mostra interfaccia normale di upload
                    <>
                      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          📸 Carica Immagini
                        </h3>
                        
                        <MultipleMediaUpload
                          onFilesSelect={handleFilesImport}
                          selectedFiles={importedFiles}
                          mediaType="image"
                          maxFiles={5}
                          label="Seleziona fino a 5 immagini"
                          className="w-full"
                        />
                      </div>
                      
                      {importedFiles.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                          <h4 className="font-medium text-blue-900 mb-3">💡 Come funziona:</h4>
                          <ul className="text-sm text-blue-800 space-y-2">
                            <li>• L'AI riconosce automaticamente la lingua del menu</li>
                            <li>• Estrae categorie, piatti, prezzi e ingredienti</li>
                            <li>• Organizza tutto in un menu digitale navigabile</li>
                            <li>• 🕒 Il processo richiede 2-3 minuti per risultati accurati</li>
                          </ul>
                          
                          <div className="flex gap-2 mt-6">
                            <CustomButton 
                              variant="outline" 
                              onClick={() => setImportedFiles([])}
                              className="flex-1"
                            >
                              🗑️ Rimuovi
                            </CustomButton>
                            <CustomButton 
                              onClick={handleAnalyzeMenu}
                              disabled={isAnalyzing || importedFiles.length === 0}
                              className="flex-1"
                            >
                              {isAnalyzing ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Avvio...
                                </>
                              ) : (
                                <>
                                  <Sparkles className="mr-2 h-4 w-4" />
                                  Analizza con AI
                                </>
                              )}
                            </CustomButton>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
            
            <div className="flex-shrink-0 px-4 py-6 border-t border-gray-200">
              <CustomButton 
                className="w-full h-14 text-base font-semibold"
                onClick={() => {
                  if (analysisTaskId) {
                    // Se c'è un'analisi in corso, chiedi conferma
                    if (confirm('🚧 C\'è un\'analisi in corso. Sei sicuro di voler chiudere? Il processo continuerà in background.')) {
                      setShowImportDialog(false)
                    }
                  } else {
                    setShowImportDialog(false)
                  }
                }}
              >
                {analysisTaskId ? (
                  <>
                    <span className="mr-2">🚧</span>
                    Chiudi (Analisi in corso)
                  </>
                ) : (
                  <>
                    ✅ Fatto
                  </>
                )}
              </CustomButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* Analysis Preview Dialog */}
        <Dialog open={showAnalysisPreview} onOpenChange={setShowAnalysisPreview}>
          <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Anteprima Menu Analizzato</DialogTitle>
              <DialogDescription>
                Ecco quello che abbiamo estratto dal tuo file. Controlla i dati e conferma per importare nel database.
              </DialogDescription>
            </DialogHeader>
            
            {analyzedData && (
              <div className="space-y-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-lg">
                      Categorie trovate: {analyzedData.categories.length}
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-blue-50">
                        {analyzedData.categories.reduce((sum: number, cat: any) => sum + cat.dishes.length, 0)} piatti totali
                      </Badge>
                      <CustomButton 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setShowAnalysisPreview(false)
                          setAnalyzedData(null)
                          setAnalysisTaskId(null) // Reset del task ID per fermare il polling
                          // Permette di ri-analizzare con lo stesso file
                        }}
                      >
                        <Zap className="mr-2 h-4 w-4" />
                        Ri-analizza
                      </CustomButton>
                    </div>
                  </div>
                  
                  {analyzedData.categories.reduce((sum: number, cat: any) => sum + cat.dishes.length, 0) < 5 && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-center gap-2 text-yellow-800">
                        <span className="text-sm">⚠️</span>
                        <span className="text-sm font-medium">
                          Sembrano pochi piatti per un menu. Prova a ri-analizzare per risultati migliori.
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-4">
                    {analyzedData.categories.map((category: any, catIndex: number) => (
                      <div key={catIndex} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">{category.icon}</span>
                          <h4 className="font-semibold text-lg">{category.name}</h4>
                          <Badge variant="secondary">
                            {category.dishes.length} piatti
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          {category.dishes.map((dish: any, dishIndex: number) => (
                            <div key={dishIndex} className="bg-white p-3 rounded border">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <h5 className="font-medium">{dish.name}</h5>
                                  {dish.description && (
                                    <p className="text-sm text-gray-600 mt-1">{dish.description}</p>
                                  )}
                                  {dish.ingredients && dish.ingredients.length > 0 && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Ingredienti: {dish.ingredients.join(', ')}
                                    </p>
                                  )}
                                </div>
                                {dish.price && (
                                  <span className="font-semibold text-lg text-green-600">
                                    €{dish.price.toFixed(2)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="addIngredientsDescription"
                      checked={addIngredientsDescription}
                      onChange={(e) => setAddIngredientsDescription(e.target.checked)}
                      className="mr-3"
                    />
                    <label htmlFor="addIngredientsDescription" className="text-sm font-medium text-blue-800">
                      Aggiungi automaticamente ingredienti e descrizioni dettagliate a tutti i piatti usando l'AI
                    </label>
                  </div>
                  <p className="text-xs text-blue-600 mt-1 ml-6">
                    Questa opzione utilizzerà l'AI per arricchire ogni piatto con ingredienti tipici e descrizioni appetitose
                  </p>
                </div>
                
                <div className="flex justify-end gap-2">
                  <CustomButton 
                    variant="outline" 
                    onClick={() => setShowAnalysisPreview(false)}
                  >
                    Torna Indietro
                  </CustomButton>
                  <CustomButton onClick={handleConfirmImport}>
                    <Check className="mr-2 h-4 w-4" />
                    Conferma e Importa
                  </CustomButton>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {hasChanges && (
          <div className="fixed bottom-0 left-0 right-0 z-20 pb-8">
            <div className="mx-auto w-fit">
              <div className="bg-gray-800 text-white rounded-xl shadow-2xl p-3 flex items-center gap-4 mx-4">
                <p className="font-semibold text-sm px-2">Modifiche salvate automaticamente</p>
              </div>
            </div>
          </div>
        )}

        {/* Brand Dialog - Mobile Optimized */}
        <Dialog open={showBrandDialog} onOpenChange={setShowBrandDialog}>
          <DialogContent className="w-full max-w-md h-full max-h-[100vh] m-0 rounded-none sm:rounded-lg sm:max-h-[90vh] sm:m-4 flex flex-col">
            <DialogHeader className="flex-shrink-0 px-4 py-6 border-b border-gray-200">
              <DialogTitle className="text-2xl font-bold text-gray-800">🎨 Brand</DialogTitle>
              <DialogDescription className="text-gray-600">
                Personalizza l'aspetto del tuo menu pubblico
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
              {/* Sezione Font */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  🔤 Font del Menu
                </h3>
                
                <div className="grid grid-cols-1 gap-4">
                  {[
                    { name: 'Inter', description: 'Moderno e pulito', style: 'font-sans', sample: 'The quick brown fox jumps over the lazy dog' },
                    { name: 'Cooper', description: 'Elegante e raffinato', style: 'font-cooper', sample: 'Benvenuti nel nostro ristorante' },
                    { name: 'Roboto', description: 'Leggibile e amichevole', style: 'font-roboto', sample: 'Menù della tradizione italiana' },
                    { name: 'Poppins', description: 'Contemporaneo e versatile', style: 'font-poppins', sample: 'Specialità dello chef' },
                    { name: 'Playfair Display', description: 'Classico ed elegante', style: 'font-playfair', sample: 'Ristorante di Alta Cucina' },
                    { name: 'Montserrat', description: 'Moderno e geometrico', style: 'font-montserrat', sample: 'Cucina Mediterranea' },
                    { name: 'Merriweather', description: 'Tradizionale e accogliente', style: 'font-merriweather', sample: 'Osteria della Nonna' },
                    { name: 'Oswald', description: 'Forte e deciso', style: 'font-oswald', sample: 'STEAKHOUSE & GRILL' },
                    { name: 'Dancing Script', description: 'Artistico e creativo', style: 'font-dancing', sample: 'Caffè & Pasticceria' }
                  ].map((font) => (
                    <div
                      key={font.name}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        brandSettings.fontFamily === font.name
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleBrandFontUpdate(font.name)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{font.name}</span>
                          {brandSettings.fontFamily === font.name && (
                            <span className="text-blue-600">✓</span>
                          )}
                        </div>
                        <span className="text-sm text-gray-600">{font.description}</span>
                      </div>
                      <div className={`text-lg text-gray-800 ${font.style === 'font-cooper' ? 'font-cooper' : font.style}`}>
                        {font.sample}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Suggerimenti per Font:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Cooper:</strong> Perfetto per ristoranti eleganti e raffinati</li>
                    <li>• <strong>Playfair Display:</strong> Ideale per cucina gourmet e fine dining</li>
                    <li>• <strong>Oswald:</strong> Ottimo per steakhouse e pub</li>
                    <li>• <strong>Dancing Script:</strong> Perfetto per caffè e pasticcerie</li>
                    <li>• <strong>Merriweather:</strong> Ideale per osterie e trattorie tradizionali</li>
                  </ul>
                </div>
              </div>

              {/* Sezione Colori */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  🎨 Colori Brand
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">
                      Colore Primario
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <input
                          type="color"
                          value={brandSettings.primaryColor}
                          onChange={(e) => {
                            setBrandSettings({...brandSettings, primaryColor: e.target.value})
                            handleBrandColorUpdate('primary', e.target.value)
                          }}
                          className="w-16 h-16 rounded-xl border-2 border-gray-300 cursor-pointer appearance-none"
                        />
                        <div 
                          className="absolute inset-2 rounded-lg pointer-events-none"
                          style={{ backgroundColor: brandSettings.primaryColor }}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          value={brandSettings.primaryColor}
                          onChange={(e) => {
                            setBrandSettings({...brandSettings, primaryColor: e.target.value})
                            handleBrandColorUpdate('primary', e.target.value)
                          }}
                          className="h-12 text-base"
                          placeholder="#3B82F6"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Header, pulsanti, accenti
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-semibold text-gray-700 mb-3 block">
                      Colore Secondario
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <input
                          type="color"
                          value={brandSettings.secondaryColor}
                          onChange={(e) => {
                            setBrandSettings({...brandSettings, secondaryColor: e.target.value})
                            handleBrandColorUpdate('secondary', e.target.value)
                          }}
                          className="w-16 h-16 rounded-xl border-2 border-gray-300 cursor-pointer appearance-none"
                        />
                        <div 
                          className="absolute inset-2 rounded-lg pointer-events-none"
                          style={{ backgroundColor: brandSettings.secondaryColor }}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          value={brandSettings.secondaryColor}
                          onChange={(e) => {
                            setBrandSettings({...brandSettings, secondaryColor: e.target.value})
                            handleBrandColorUpdate('secondary', e.target.value)
                          }}
                          className="h-12 text-base"
                          placeholder="#64748B"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Tag, testi secondari
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sezione Immagine Copertina */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  📷 Immagine Copertina
                </h3>
                
                {brandSettings.coverImageUrl && (
                  <div className="mb-6">
                    <img
                      src={brandSettings.coverImageUrl}
                      alt="Copertina menu"
                      className="w-full h-40 object-cover rounded-xl border border-gray-200"
                    />
                  </div>
                )}
                
                <MediaUpload
                  onFileSelect={(fileUrl, fileType) => {
                    if (fileType === "image") {
                      handleBrandImageUpload(fileUrl, 'cover')
                    } else {
                      alert("Solo le immagini sono supportate")
                    }
                  }}
                  selectedFile={isUpdatingBrand ? "updating" : ""}
                  mediaType="image"
                  maxSize={10}
                  uploadType="brand-cover"
                  restaurantId={restaurantId}
                  label={brandSettings.coverImageUrl ? "Sostituisci Copertina" : "Carica Copertina"}
                  className="w-full"
                />
                
                <p className="text-xs text-gray-500 mt-3 bg-gray-50 p-3 rounded-lg">
                  💡 Immagine mostrata in alto nel menu pubblico. Consigliato: 1200x400px
                </p>
              </div>

              {/* Sezione Logo */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  🏪 Logo Ristorante
                </h3>
                
                {brandSettings.logoUrl && (
                  <div className="mb-6 flex justify-center">
                    <img
                      src={brandSettings.logoUrl}
                      alt="Logo ristorante"
                      className="w-32 h-32 object-contain rounded-xl border border-gray-200 bg-gray-50"
                    />
                  </div>
                )}
                
                <MediaUpload
                  onFileSelect={(fileUrl, fileType) => {
                    if (fileType === "image") {
                      handleBrandImageUpload(fileUrl, 'logo')
                    } else {
                      alert("Solo le immagini sono supportate")
                    }
                  }}
                  selectedFile={isUpdatingBrand ? "updating" : ""}
                  mediaType="image"
                  maxSize={5}
                  uploadType="brand-logo"
                  restaurantId={restaurantId}
                  label={brandSettings.logoUrl ? "Sostituisci Logo" : "Carica Logo"}
                  className="w-full"
                />
                
                <p className="text-xs text-gray-500 mt-3 bg-gray-50 p-3 rounded-lg">
                  💡 Logo mostrato nell'header. Consigliato: formato quadrato, sfondo trasparente
                </p>
              </div>

              {/* Sezione Visibilità Contenuti */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  👁️ Visibilità Contenuti
                </h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">📝</span>
                        <span className="font-medium text-gray-900">Descrizioni Piatti</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Mostra le descrizioni dei piatti nella vista principale del menu
                      </p>
                    </div>
                    <Switch
                      checked={!brandSettings.hideDescription}
                      onCheckedChange={(visible) => handleBrandVisibilityUpdate('description', visible)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">🥗</span>
                        <span className="font-medium text-gray-900">Ingredienti Piatti</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Mostra gli ingredienti dei piatti nella vista principale del menu
                      </p>
                    </div>
                    <Switch
                      checked={!brandSettings.hideIngredients}
                      onCheckedChange={(visible) => handleBrandVisibilityUpdate('ingredients', visible)}
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg">🏷️</span>
                      <span className="font-medium text-gray-900">Modalità Etichette</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Scegli come mostrare le etichette dei piatti nella vista principale del menu
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          id="tags-full"
                          name="tagDisplayMode"
                          value="full"
                          checked={brandSettings.tagDisplayMode === 'full'}
                          onChange={(e) => handleBrandTagDisplayUpdate(e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="tags-full" className="flex items-center gap-2 text-sm">
                          <span className="px-2 py-1 bg-emerald-300 text-gray-800 rounded-full text-xs font-medium">🌱 Vegano</span>
                          <span className="text-gray-700">Etichette complete (emoji + testo)</span>
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          id="tags-emoji"
                          name="tagDisplayMode"
                          value="emoji-only"
                          checked={brandSettings.tagDisplayMode === 'emoji-only'}
                          onChange={(e) => handleBrandTagDisplayUpdate(e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="tags-emoji" className="flex items-center gap-2 text-sm">
                          <span className="text-lg">🌱</span>
                          <span className="text-gray-700">Solo emoji (più minimalista)</span>
                        </label>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          id="tags-hidden"
                          name="tagDisplayMode"
                          value="hidden"
                          checked={brandSettings.tagDisplayMode === 'hidden'}
                          onChange={(e) => handleBrandTagDisplayUpdate(e.target.value)}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="tags-hidden" className="flex items-center gap-2 text-sm">
                          <span className="text-gray-400">🚫</span>
                          <span className="text-gray-700">Nascoste (menu ultra pulito)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Come funziona:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Se disattivi, i contenuti saranno nascosti nella vista principale</li>
                    <li>• I clienti potranno sempre vedere i dettagli completi cliccando sul piatto</li>
                    <li>• Le etichette nel dialog dettaglio sono sempre complete</li>
                    <li>• Utile per menu più puliti e minimalisti</li>
                  </ul>
                </div>
              </div>

              {/* Posizionamento Banner Categorie */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    📍 Banner Categorie
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Scegli se il banner con categorie e filtri deve apparire subito o solo dopo lo scroll della copertina
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <input
                      type="radio"
                      id="banner-dynamic"
                      name="categoryBannerPosition"
                      value="dynamic"
                      checked={brandSettings.categoryBannerPosition === 'dynamic'}
                      onChange={(e) => handleBrandCategoryBannerUpdate(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
                    />
                    <label htmlFor="banner-dynamic" className="flex-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <span className="text-blue-500">🔄</span>
                        <span>Dinamico (predefinito)</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Il banner appare solo dopo aver fatto scroll oltre la copertina. Ideale per menu con immagine di copertina.
                      </p>
                    </label>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <input
                      type="radio"
                      id="banner-fixed"
                      name="categoryBannerPosition"
                      value="fixed-top"
                      checked={brandSettings.categoryBannerPosition === 'fixed-top'}
                      onChange={(e) => handleBrandCategoryBannerUpdate(e.target.value)}
                      className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500 mt-1"
                    />
                    <label htmlFor="banner-fixed" className="flex-1">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <span className="text-green-500">📌</span>
                        <span>Fisso in alto</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        Il banner è sempre visibile in alto, anche sopra la copertina. Ottimo per accesso rapido alle categorie.
                      </p>
                    </label>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600 text-sm">💡</span>
                    <div className="text-xs text-yellow-800">
                      <p className="font-medium mb-1">Suggerimento:</p>
                      <ul className="space-y-1">
                        <li>• Usa "Dinamico" se hai una bella copertina che vuoi mostrare per prima</li>
                        <li>• Usa "Fisso" se vuoi dare priorità alla navigazione delle categorie</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sezione Fornitori - Mobile Optimized */}
              <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                {/* Header Mobile-First */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
                    🏭 Fornitori
                  </h3>
                  <CustomButton
                    onClick={() => handleOpenSupplierDialog()}
                    className="w-full h-12 text-base font-semibold flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Aggiungi Fornitore
                  </CustomButton>
                </div>
                
                {brandSettings.suppliers.length > 0 ? (
                  <div className="space-y-3">
                    {brandSettings.suppliers.map((supplier, index) => (
                      <div key={supplier.id || (supplier as any)._id || index} className="bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                        {/* Supplier Info - Mobile Layout */}
                        <div className="p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <img
                              src={supplier.logoUrl}
                              alt={supplier.name}
                              className="w-12 h-12 object-contain rounded-lg border border-gray-200 bg-white flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-base truncate">{supplier.name}</h4>
                              <p className="text-sm text-gray-500">Logo fornitore</p>
                            </div>
                          </div>
                          
                          {/* Action Buttons - Mobile Touch-Friendly */}
                          <div className="grid grid-cols-2 gap-3">
                            <CustomButton
                              onClick={() => handleOpenSupplierDialog(supplier)}
                              variant="outline"
                              className="h-11 text-sm font-medium flex items-center justify-center gap-2"
                            >
                              <Edit3 className="w-4 h-4" />
                              Modifica
                            </CustomButton>
                            <CustomButton
                              onClick={() => handleDeleteSupplier(supplier.id || (supplier as any)._id)}
                              variant="outline"
                              className="h-11 text-sm font-medium flex items-center justify-center gap-2 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              Elimina
                            </CustomButton>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 px-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-3xl">🏭</span>
                    </div>
                    <h4 className="font-semibold text-gray-800 mb-2 text-lg">Nessun fornitore</h4>
                    <p className="text-gray-500 text-base leading-relaxed">
                      Aggiungi i loghi dei tuoi fornitori per mostrarli nel footer del menu
                    </p>
                  </div>
                )}
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h4 className="font-medium text-blue-900 mb-2 text-base">💡 Come funziona:</h4>
                  <ul className="text-sm text-blue-800 space-y-2">
                    <li>• I fornitori verranno mostrati nel footer del menu pubblico</li>
                    <li>• I loghi scorreranno automaticamente in orizzontale</li>
                    <li>• Ideale per valorizzare partnership e qualità</li>
                    <li>• Consigliato: loghi su sfondo trasparente o bianco</li>
                  </ul>
                </div>
              </div>

              {/* Anteprima URL Menu Pubblico */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  📱 Menu Pubblico
                </h4>
                <p className="text-sm text-blue-800 mb-4">
                  Il tuo menu sarà visibile pubblicamente a questo indirizzo:
                </p>
                <div className="bg-white rounded-xl border border-blue-200 p-4 font-mono text-sm text-blue-700 break-all">
                  {typeof window !== 'undefined' ? window.location.origin : ''}/menu/{restaurantId}
                </div>
                <p className="text-xs text-blue-600 mt-3 bg-blue-100 p-3 rounded-lg">
                  💡 Puoi condividere questo link con i tuoi clienti o aggiungerlo nelle campagne WhatsApp.
                </p>
              </div>
            </div>
            
            <div className="flex-shrink-0 px-4 py-6 border-t border-gray-200">
              <CustomButton 
                className="w-full h-14 text-base font-semibold"
                onClick={() => setShowBrandDialog(false)}
              >
                ✅ Fatto
              </CustomButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* Supplier Dialog - Mobile Optimized */}
        <Dialog open={showAddSupplierDialog} onOpenChange={setShowAddSupplierDialog}>
          <DialogContent className="w-full max-w-sm h-full max-h-[100vh] m-0 rounded-none sm:rounded-lg sm:max-h-[90vh] sm:m-4 flex flex-col">
            <DialogHeader className="flex-shrink-0 px-4 py-6 border-b border-gray-200">
              <DialogTitle className="text-2xl font-bold text-gray-800">
                {editingSupplier ? '✏️ Modifica Fornitore' : '➕ Aggiungi Fornitore'}
              </DialogTitle>
              <DialogDescription className="text-gray-600 text-base">
                {editingSupplier ? 'Modifica le informazioni del fornitore' : 'Aggiungi un nuovo fornitore al tuo menu'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
              {/* Nome Fornitore */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-3">
                  Nome Fornitore *
                </label>
                <Input
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Es: Azienda Agricola Bio, Caseificio Locale..."
                  className="w-full h-12 text-base"
                  maxLength={100}
                />
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Il nome verrà mostrato sotto il logo nel footer del menu
                </p>
              </div>

              {/* Logo Fornitore */}
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-3">
                  Logo Fornitore *
                </label>
                
                {supplierForm.logoUrl && (
                  <div className="mb-6 flex justify-center">
                    <img
                      src={supplierForm.logoUrl}
                      alt="Anteprima logo"
                      className="w-32 h-32 object-contain rounded-xl border border-gray-200 bg-gray-50"
                    />
                  </div>
                )}
                
                <MediaUpload
                  onFileSelect={(fileUrl, fileType) => {
                    if (fileType === "image") {
                      handleSupplierLogoUpload(fileUrl)
                    } else {
                      alert("Solo le immagini sono supportate")
                    }
                  }}
                  selectedFile={isUploadingSupplierLogo ? "updating" : supplierForm.logoUrl || ""}
                  mediaType="image"
                  maxSize={5}
                  uploadType="supplier-logo"
                  restaurantId={restaurantId}
                  label={supplierForm.logoUrl ? "Sostituisci Logo" : "Carica Logo"}
                  className="w-full"
                />
                
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Consigli per il logo:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Sfondo trasparente o bianco</li>
                    <li>• Formato quadrato preferibile</li>
                    <li>• Dimensione minima 200x200px</li>
                    <li>• File PNG o JPG</li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Buttons - Mobile Touch-Friendly */}
            <div className="flex-shrink-0 px-4 py-6 border-t border-gray-200 space-y-3">
              <CustomButton
                onClick={handleSaveSupplier}
                className="w-full h-14 text-base font-semibold"
                disabled={!supplierForm.name.trim() || !supplierForm.logoUrl}
              >
                {editingSupplier ? '💾 Salva Modifiche' : '➕ Aggiungi Fornitore'}
              </CustomButton>
              <CustomButton
                onClick={() => setShowAddSupplierDialog(false)}
                variant="outline"
                className="w-full h-12 text-base font-medium"
              >
                Annulla
              </CustomButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* Translations Dialog */}
        <Dialog open={showTranslationsDialog} onOpenChange={setShowTranslationsDialog}>
          <DialogContent className="w-full max-w-md h-full max-h-[100vh] m-0 rounded-none sm:rounded-lg sm:max-h-[90vh] sm:m-4 flex flex-col">
            <DialogHeader className="flex-shrink-0 px-4 py-6 border-b border-gray-200">
              <DialogTitle className="text-2xl font-bold text-gray-800">🌍 Traduzioni Menu</DialogTitle>
              <DialogDescription className="text-gray-600">
                Gestisci le traduzioni del tuo menu in diverse lingue
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
              {/* Mostra progresso cancellazione se attivo */}
              {deletionTaskId && (
                <AsyncTaskProgress
                  taskId={deletionTaskId}
                  title="Cancellazione Traduzione"
                  description="Stiamo rimuovendo tutte le traduzioni dal database..."
                  onComplete={handleDeletionComplete}
                  onError={handleDeletionError}
                  onCancel={() => {
                    setDeletionTaskId(null)
                    setIsDeletingTranslation(false)
                  }}
                  pollingInterval={2000}
                  className="my-4"
                />
              )}

              {/* Lingue già supportate */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  ✅ Lingue Supportate
                </h3>
                
                {supportedLanguages.length > 1 && (
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Lingua predefinita:</strong> È la lingua base del menu. Puoi cambiare quale lingua è predefinita 
                      cliccando il pulsante <Check className="inline h-3 w-3 mx-1" /> accanto alle altre lingue.
                    </p>
                  </div>
                )}
                
                {supportedLanguages.length > 0 ? (
                  <div className="space-y-3">
                    {supportedLanguages.map((lang) => (
                      <div key={lang.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{lang.flag}</span>
                          <div>
                            <span className="font-medium text-gray-900">{lang.name}</span>
                            {lang.isDefault && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500 uppercase font-medium">
                            {lang.code}
                          </span>
                          {!lang.isDefault && supportedLanguages.length > 1 && (
                            <button
                              className="h-8 w-8 flex items-center justify-center rounded-md bg-transparent text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-150 group relative"
                              onClick={() => handleSetDefaultLanguage(lang.code, lang.name)}
                              title={`Imposta ${lang.name} come lingua predefinita`}
                            >
                              <Check className="h-4 w-4" />
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                Imposta come default
                              </span>
                            </button>
                          )}
                          {!lang.isDefault && (
                            <button
                              className="h-8 w-8 flex items-center justify-center rounded-md bg-transparent text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-150"
                              onClick={() => handleDeleteTranslation(lang.code, lang.name)}
                              title={`Elimina traduzione ${lang.name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm bg-gray-50 p-4 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🇮🇹</span>
                      <div>
                        <span className="font-medium text-gray-900">Italiano</span>
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          Default
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-600">
                      Questa è la lingua principale del menu. Aggiungi traduzioni per supportare altre lingue.
                    </p>
                  </div>
                )}
              </div>

              {/* Aggiungi nuova traduzione */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  ➕ Aggiungi Traduzione
                </h3>
                
                {translationTaskId || deletionTaskId ? (
                  // Mostra progresso traduzione asincrona
                  <AsyncTaskProgress
                    taskId={translationTaskId}
                    title="Generazione Traduzioni con AI"
                    description={`Stiamo traducendo il tuo menu in ${selectedLanguageForTranslation.split('|')[1] || 'una nuova lingua'}...`}
                    onComplete={handleTranslationComplete}
                    onError={handleTranslationError}
                    onCancel={() => {
                      setTranslationTaskId(null)
                      setIsGeneratingTranslation(false)
                      setSelectedLanguageForTranslation('')
                    }}
                    pollingInterval={2000}
                    className="my-4"
                  />
                ) : (
                  // Mostra form di selezione lingua
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-gray-700 mb-3 block">
                        Seleziona Lingua
                      </label>
                      <select
                        value={selectedLanguageForTranslation}
                        onChange={(e) => setSelectedLanguageForTranslation(e.target.value)}
                        className="w-full h-12 px-4 border border-gray-300 rounded-xl text-base bg-white"
                        disabled={isGeneratingTranslation || isDeletingTranslation}
                      >
                        <option value="">Scegli una lingua...</option>
                        {getUntranslatedLanguages().map((lang) => (
                          <option key={lang.code} value={`${lang.code}|${lang.name}`}>
                            {lang.flag} {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {selectedLanguageForTranslation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="font-medium text-blue-900 mb-2">💡 Come funziona:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• L'AI tradurrà automaticamente tutti i nomi delle categorie</li>
                          <li>• Tutti i nomi dei piatti verranno tradotti</li>
                          <li>• Le descrizioni e gli ingredienti saranno tradotti</li>
                          <li>• I prezzi rimangono invariati</li>
                          <li>• Le traduzioni mantengono lo stile professionale</li>
                          <li>• 🕒 Il processo può richiedere alcuni minuti</li>
                        </ul>
                      </div>
                    )}

                    <CustomButton
                      className="w-full h-12 text-base font-semibold"
                      onClick={() => {
                        if (selectedLanguageForTranslation) {
                          const [code, name] = selectedLanguageForTranslation.split('|')
                          handleGenerateTranslation(code, name)
                        }
                      }}
                      disabled={!selectedLanguageForTranslation || isGeneratingTranslation || isDeletingTranslation}
                    >
                      {isGeneratingTranslation ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Avvio traduzioni...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Genera Traduzioni con AI
                        </>
                      )}
                    </CustomButton>
                  </div>
                )}
              </div>

              {!translationTaskId && getUntranslatedLanguages().length === 0 && supportedLanguages.length > 1 && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                  <div className="text-4xl mb-3">🎉</div>
                  <h4 className="font-bold text-green-900 mb-2">Fantastico!</h4>
                  <p className="text-sm text-green-800">
                    Hai già tradotto il menu in tutte le lingue disponibili!
                  </p>
                </div>
              )}

              {!translationTaskId && (
                /* Anteprima URL Menu Pubblico */
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6">
                  <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                    🔗 Menu Multilingue
                  </h4>
                  <p className="text-sm text-purple-800 mb-4">
                    I clienti potranno scegliere la lingua dal menu pubblico:
                  </p>
                  <div className="bg-white rounded-xl border border-purple-200 p-4 font-mono text-sm text-purple-700 break-all">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/menu/{restaurantId}
                  </div>
                  <p className="text-xs text-purple-600 mt-3 bg-purple-100 p-3 rounded-lg">
                    💡 Il selettore di lingua apparirà automaticamente quando ci sono traduzioni disponibili.
                  </p>
                </div>
              )}
            </div>
            
            <div className="flex-shrink-0 px-4 py-6 border-t border-gray-200">
              <CustomButton 
                className="w-full h-14 text-base font-semibold"
                onClick={() => {
                  if (translationTaskId || deletionTaskId) {
                    // Se c'è un task in corso, chiedi conferma
                    const taskType = translationTaskId ? 'traduzione' : 'cancellazione'
                    if (confirm(`🚧 C'è una ${taskType} in corso. Sei sicuro di voler chiudere? Il processo continuerà in background.`)) {
                      setShowTranslationsDialog(false)
                    }
                  } else {
                    setShowTranslationsDialog(false)
                  }
                }}
                disabled={false}
              >
                {translationTaskId ? (
                  <>
                    <span className="mr-2">🚧</span>
                    Chiudi (Traduzione in corso)
                  </>
                ) : deletionTaskId ? (
                  <>
                    <span className="mr-2">🚧</span>
                    Chiudi (Cancellazione in corso)
                  </>
                ) : (
                  <>
                    ✅ Fatto
                  </>
                )}
              </CustomButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* AI Commands Dialog */}
        <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
          <DialogContent className="w-full max-w-md h-full max-h-[100vh] m-0 rounded-none sm:rounded-lg sm:max-h-[90vh] sm:m-4 flex flex-col">
            <DialogHeader className="flex-shrink-0 px-4 py-6 border-b border-gray-200">
              <DialogTitle className="text-2xl font-bold text-gray-800">🤖 Comandi AI</DialogTitle>
              <DialogDescription className="text-gray-600">
                Gestisci i numeri autorizzati per i comandi vocali/testuali via WhatsApp
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
              {isLoadingAIConfig ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2 text-gray-600">Caricamento configurazione...</span>
                </div>
              ) : (
                <>
                  {/* Attivazione AI */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">🚀 Attivazione AI</h3>
                        <p className="text-sm text-gray-600">Abilita i comandi intelligenti via WhatsApp</p>
                      </div>
                      <Switch
                        checked={aiConfig.enabled}
                        onCheckedChange={(enabled) => updateAIConfig({ enabled })}
                      />
                    </div>
                    
                    {aiConfig.enabled && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="font-medium text-blue-900 mb-2">💡 Come funziona:</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• I numeri autorizzati possono inviare comandi vocali o testuali</li>
                          <li>• L'AI interpreta automaticamente le richieste</li>
                          <li>• Ogni comando richiede conferma prima dell'esecuzione</li>
                          <li>• I permessi sono configurabili per livello di sicurezza</li>
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Lingua predefinita */}
                  {aiConfig.enabled && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">🌍 Lingua Predefinita</h3>
                      <select
                        value={aiConfig.defaultLanguage}
                        onChange={(e) => updateAIConfig({ defaultLanguage: e.target.value })}
                        className="w-full h-12 px-4 border border-gray-300 rounded-xl text-base bg-white"
                      >
                        <option value="it">🇮🇹 Italiano</option>
                        <option value="en">🇬🇧 English</option>
                        <option value="es">🇪🇸 Español</option>
                        <option value="fr">🇫🇷 Français</option>
                        <option value="de">🇩🇪 Deutsch</option>
                      </select>
                    </div>
                  )}

                  {/* Aggiungi Numero Autorizzato */}
                  {aiConfig.enabled && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">➕ Aggiungi Numero Autorizzato</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Numero di Telefono
                          </label>
                          <Input
                            type="tel"
                            value={newAuthorizedNumber.phoneNumber}
                            onChange={(e) => setNewAuthorizedNumber(prev => ({ ...prev, phoneNumber: e.target.value }))}
                            placeholder="+39 123 456 7890"
                            className="h-12 text-base"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Nome/Descrizione
                          </label>
                          <Input
                            value={newAuthorizedNumber.name}
                            onChange={(e) => setNewAuthorizedNumber(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Es: Marco - Chef"
                            className="h-12 text-base"
                          />
                        </div>
                        
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Livello Permessi
                          </label>
                          <select
                            value={newAuthorizedNumber.permission}
                            onChange={(e) => setNewAuthorizedNumber(prev => ({ ...prev, permission: e.target.value }))}
                            className="w-full h-12 px-4 border border-gray-300 rounded-xl text-base bg-white"
                          >
                            <option value="basic">🟢 Basic - Nascondere/mostrare piatti, modifiche base</option>
                            <option value="advanced">🟡 Advanced - Creare piatti, categorie, immagini AI</option>
                            <option value="admin">🔴 Admin - Controllo completo</option>
                          </select>
                        </div>
                        
                        <CustomButton
                          className="w-full h-12 text-base font-semibold"
                          onClick={addAuthorizedNumber}
                          disabled={isAddingNumber || !newAuthorizedNumber.phoneNumber || !newAuthorizedNumber.name}
                        >
                          {isAddingNumber ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Aggiunta...
                            </>
                          ) : (
                            <>
                              <Plus className="mr-2 h-4 w-4" />
                              Aggiungi Numero
                            </>
                          )}
                        </CustomButton>
                      </div>
                    </div>
                  )}

                  {/* Numeri Autorizzati */}
                  {aiConfig.enabled && aiConfig.authorizedNumbers && aiConfig.authorizedNumbers.length > 0 && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">📱 Numeri Autorizzati</h3>
                      
                      <div className="space-y-3">
                        {aiConfig.authorizedNumbers.map((auth: any) => (
                          <div key={auth.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{auth.name}</span>
                                <Badge 
                                  variant={auth.permission === 'admin' ? 'destructive' : auth.permission === 'advanced' ? 'default' : 'secondary'}
                                  className="text-xs"
                                >
                                  {auth.permission}
                                </Badge>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {auth.displayNumber}
                              </div>
                              {auth.lastCommandAt && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Ultimo comando: {new Date(auth.lastCommandAt).toLocaleDateString('it-IT')}
                                </div>
                              )}
                            </div>
                            
                            <button
                              className="h-8 w-8 flex items-center justify-center rounded-md bg-transparent text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-150"
                              onClick={() => removeAuthorizedNumber(auth.id)}
                              title="Rimuovi numero"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Esempi Comandi */}
                  {aiConfig.enabled && (
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6">
                      <h4 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                        💬 Esempi di Comandi
                      </h4>
                      <div className="text-sm text-purple-800 space-y-2">
                        <div><strong>Nascondere piatti:</strong> "Nascondi la carbonara"</div>
                        <div><strong>Modificare prezzi:</strong> "Cambia il prezzo della margherita a 8 euro"</div>
                        <div><strong>Creare piatti:</strong> "Crea nuovo piatto tiramisu in categoria dolci"</div>
                        <div><strong>Generare immagini:</strong> "Genera immagine AI per la carbonara"</div>
                        <div><strong>Vocali:</strong> Registra un messaggio vocale con le tue richieste</div>
                      </div>
                    </div>
                  )}

                  {/* Analisi AI Piatti */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      🧠 Analisi AI Piatti
                    </h3>
                    
                    {dishAnalysisTaskId ? (
                      // Mostra progresso analisi AI
                      <AsyncTaskProgress
                        taskId={dishAnalysisTaskId}
                        title="Analisi AI Piatti in Corso"
                        description="L'AI sta analizzando tutti i piatti e assegnando le etichette più appropriate..."
                        onComplete={handleDishAnalysisComplete}
                        onError={handleDishAnalysisError}
                        onCancel={() => {
                          setDishAnalysisTaskId(null)
                          setIsAnalyzingDishes(false)
                        }}
                        pollingInterval={2000}
                        className="my-4"
                      />
                    ) : (
                      <div className="space-y-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <h4 className="font-medium text-blue-900 mb-2">🤖 Cosa fa l'AI:</h4>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Analizza nome, descrizione e ingredienti di ogni piatto</li>
                            <li>• Identifica trend alimentari contemporanei (2024)</li>
                            <li>• Assegna etichette moderne con emoji (Vegano 🌱, Healthy 💚, etc.)</li>
                            <li>• Considera specialità, tradizione e presentazione</li>
                            <li>• Ottimizza per social media e marketing</li>
                          </ul>
                        </div>

                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            id="replace-existing-tags"
                            checked={replaceExistingTags}
                            onChange={(e) => setReplaceExistingTags(e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-2 border-gray-300 focus:ring-blue-500 rounded"
                          />
                          <label htmlFor="replace-existing-tags" className="text-sm text-gray-700 flex-1">
                            <span className="font-medium">Sostituisci etichette esistenti</span>
                            <p className="text-xs text-gray-500 mt-1">
                              Se disattivato, le nuove etichette si aggiungeranno a quelle esistenti
                            </p>
                          </label>
                        </div>

                        <CustomButton
                          className="w-full h-12 text-base font-semibold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                          onClick={handleAnalyzeDishes}
                          disabled={isAnalyzingDishes}
                        >
                          {isAnalyzingDishes ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Avvio Analisi...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              🧠 Analizza e Assegna Etichette
                            </>
                          )}
                        </CustomButton>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                          <p className="text-sm text-yellow-800">
                            <strong>⚡ Esempi di etichette AI:</strong> Vegano 🌱, Healthy 💚, Piccante 🌶️, Signature 🔥, 
                            Instagrammable 🎨, Premium 💫, Tradizionale 🍕, Gourmet 🥂
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Statistiche */}
                  {aiConfig.enabled && aiConfig.stats && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">📊 Statistiche</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{aiConfig.stats?.totalCommands || 0}</div>
                          <div className="text-sm text-gray-600">Comandi Totali</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{aiConfig.stats?.successfulCommands || 0}</div>
                          <div className="text-sm text-gray-600">Completati</div>
                        </div>
                      </div>
                      
                      {aiConfig.stats?.lastCommandAt && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="text-sm text-gray-600">
                            Ultimo comando: {new Date(aiConfig.stats.lastCommandAt).toLocaleString('it-IT')}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="flex-shrink-0 px-4 py-6 border-t border-gray-200">
              <CustomButton 
                className="w-full h-14 text-base font-semibold"
                onClick={() => setShowAIDialog(false)}
              >
                ✅ Fatto
              </CustomButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* Category AI Generation Dialog - Mobile Optimized */}
        <Dialog open={showCategoryAIDialog} onOpenChange={setShowCategoryAIDialog}>
          <DialogContent className="w-full max-w-md h-full max-h-[100vh] m-0 rounded-none sm:rounded-lg sm:max-h-[90vh] sm:m-4 flex flex-col">
            <DialogHeader className="flex-shrink-0 px-4 py-6 border-b border-gray-200">
              <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Wand2 className="h-6 w-6 text-purple-500" />
                Genera Immagini AI - Categoria
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                {selectedCategoryForAI?.name && (
                  <>Crea immagini professionali per i piatti di <strong>{selectedCategoryForAI.name}</strong></>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
              {categoryAITaskId ? (
                // Mostra progresso generazione categoria
                <AsyncTaskProgress
                  taskId={categoryAITaskId}
                  title="Generazione Immagini Categoria"
                  description={`Stiamo creando immagini AI per i piatti di "${selectedCategoryForAI?.name}"...`}
                  onComplete={handleCategoryAIComplete}
                  onError={handleCategoryAIError}
                  onCancel={() => {
                    setCategoryAITaskId(null)
                    setIsCategoryAIGenerating(false)
                  }}
                  pollingInterval={3000}
                  className="my-4"
                />
              ) : (
                // Mostra selezione piatti
                <>
                  {/* Statistiche */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-purple-900 flex items-center gap-2">
                        📊 Selezione Piatti
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                          {selectedDishesForAI.length}/{selectedCategoryForAI?.dishes.length || 0} selezionati
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {selectedCategoryForAI?.dishes.filter(dish => !dish.photoUrl).length || 0}
                        </div>
                        <div className="text-purple-700">Senza immagine</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {selectedCategoryForAI?.dishes.filter(dish => dish.photoUrl).length || 0}
                        </div>
                        <div className="text-blue-700">Con immagine</div>
                      </div>
                    </div>
                  </div>

                  {/* Controlli rapidi */}
                  <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      ⚡ Selezione Rapida
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <CustomButton
                        onClick={handleCategoryAISelectAll}
                        variant="outline"
                        className="h-12 text-sm font-medium"
                        disabled={isCategoryAIGenerating}
                      >
                        ✅ Seleziona Tutti
                      </CustomButton>
                      <CustomButton
                        onClick={handleCategoryAIDeselectAll}
                        variant="outline"
                        className="h-12 text-sm font-medium"
                        disabled={isCategoryAIGenerating}
                      >
                        🗑️ Deseleziona Tutti
                      </CustomButton>
                    </div>
                    
                    <CustomButton
                      onClick={() => {
                        // Seleziona solo piatti senza immagine
                        const dishesWithoutImage = selectedCategoryForAI?.dishes
                          .filter(dish => !dish.photoUrl)
                          .map(dish => dish.id) || []
                        setSelectedDishesForAI(dishesWithoutImage)
                      }}
                      variant="outline"
                      className="w-full h-12 text-sm font-medium mt-3 bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                      disabled={isCategoryAIGenerating}
                    >
                      🖼️ Solo Piatti Senza Immagine
                    </CustomButton>
                  </div>

                  {/* Lista piatti con checkbox - Mobile Optimized */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <div className="p-4 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        🍽️ Piatti della Categoria
                      </h3>
                    </div>
                    
                    <div className="max-h-80 overflow-y-auto">
                      {selectedCategoryForAI?.dishes.map((dish) => (
                        <div key={dish.id} className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-b-0">
                          <div className="flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={selectedDishesForAI.includes(dish.id)}
                              onChange={() => handleCategoryAIToggleDish(dish.id)}
                              className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                              disabled={isCategoryAIGenerating}
                            />
                          </div>
                          
                          <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200">
                            {dish.photoUrl ? (
                              <img
                                src={dish.photoUrl}
                                alt={dish.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                <Camera className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">
                              {dish.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm font-semibold text-green-600">
                                €{dish.price.toFixed(2)}
                              </span>
                              {!dish.photoUrl && (
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                  Senza foto
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Info e suggerimenti */}
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                      💡 Come Funziona
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-2">
                      <li>• Le immagini vengono generate <strong>una alla volta</strong> per qualità ottimale</li>
                      <li>• Ogni piatto utilizza nome, descrizione e ingredienti per creare l'immagine</li>
                      <li>• Il processo può richiedere <strong>1-2 minuti per piatto</strong></li>
                      <li>• Puoi chiudere questa finestra: la generazione continuerà in background</li>
                      <li>• Sistema automatico di fallback per massima affidabilità</li>
                    </ul>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex-shrink-0 px-4 py-6 border-t border-gray-200 space-y-3">
              {!categoryAITaskId && (
                <CustomButton
                  className="w-full h-14 text-base font-semibold bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  onClick={handleStartCategoryAI}
                  disabled={isCategoryAIGenerating || selectedDishesForAI.length === 0}
                >
                  {isCategoryAIGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Avvio Generazione...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-5 w-5" />
                      🎨 Genera {selectedDishesForAI.length} Immagini
                    </>
                  )}
                </CustomButton>
              )}
              
              <CustomButton
                className="w-full h-12 text-base font-medium"
                variant="outline"
                onClick={() => {
                  if (categoryAITaskId) {
                    // Se c'è un task in corso, chiedi conferma
                    if (confirm('🚧 C\'è una generazione in corso. Sei sicuro di voler chiudere? Il processo continuerà in background.')) {
                      setShowCategoryAIDialog(false)
                    }
                  } else {
                    setShowCategoryAIDialog(false)
                  }
                }}
              >
                {categoryAITaskId ? (
                  <>
                    <span className="mr-2">🚧</span>
                    Chiudi (Generazione in corso)
                  </>
                ) : (
                  'Annulla'
                )}
              </CustomButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* Fixed Bottom Actions */}
        <div className="w-full max-w-md fixed bottom-0 left-0 right-0 mx-auto bg-transparent backdrop-blur-sm rounded-t-3xl p-4 shadow-xl z-20">
          <div className="grid grid-cols-4 gap-2">
            <CustomButton
              className="flex flex-col items-center justify-center h-24 py-2 px-1 text-[10px] leading-tight font-cooper"
              onClick={() => setShowBrandDialog(true)}
            >
              <ImageIcon className="w-5 h-5 mb-1 flex-shrink-0" />
              <span className="text-center break-words hyphens-auto max-w-full">
                Brand
              </span>
            </CustomButton>

            <CustomButton
              className="flex flex-col items-center justify-center h-24 py-2 px-1 text-[10px] leading-tight font-cooper"
              onClick={handleBulkPriceUpdate}
            >
              <DollarSign className="w-5 h-5 mb-1 flex-shrink-0" />
              <span className="text-center break-words hyphens-auto max-w-full">
                Aggiorna Prezzi
              </span>
            </CustomButton>

            <CustomButton
              className="flex flex-col items-center justify-center h-24 py-2 px-1 text-[10px] leading-tight font-cooper"
              onClick={() => setShowTranslationsDialog(true)}
            >
              <span className="text-xl mb-1 flex-shrink-0">🌍</span>
              <span className="text-center break-words hyphens-auto max-w-full">
                Traduzioni
              </span>
            </CustomButton>

            <CustomButton
              className="flex flex-col items-center justify-center h-24 py-2 px-1 text-[10px] leading-tight bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-cooper"
              onClick={() => setShowAIDialog(true)}
            >
              <span className="text-xl mb-1 flex-shrink-0">🤖</span>
              <span className="text-center break-words hyphens-auto max-w-full">
                AI
              </span>
            </CustomButton>
          </div>
        </div>
      </main>
    </div>
    </>
  )
} 