"use client"

import * as React from "react"

// Custom CSS per animation delays
const customStyles = `
  .animation-delay-300 { animation-delay: 300ms; }
  .animation-delay-600 { animation-delay: 600ms; }
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

// --- TYPES ---
type Tag = { 
  id: string
  text: string
  color: string 
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
}

type Category = {
  id: string
  name: string
  icon: string
  dishes: Dish[]
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
  const [name, setName] = React.useState(dish.name)
  const [price, setPrice] = React.useState(dish.price.toFixed(2))
  const [description, setDescription] = React.useState(dish.description || "")
  const [ingredients, setIngredients] = React.useState((dish.ingredients || []).join(", "))
  const [newTagText, setNewTagText] = React.useState("")
  const [isCreatingTag, setIsCreatingTag] = React.useState(false)
  
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

  React.useEffect(() => {
    setName(dish.name)
    setPrice(dish.price.toFixed(2))
    setDescription(dish.description || "")
    setIngredients((dish.ingredients || []).join(", "))
  }, [dish])

  const handleFieldBlur = async (field: "name" | "description" | "ingredients" | "price") => {
    const updates: any = {}
    
    if (field === "name" && name.trim() && name !== dish.name) {
      updates.name = name.trim()
    } else if (field === "description" && description !== (dish.description || "")) {
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
        }
      } catch (err) {
        console.error('Error updating dish:', err)
      }
    }
  }

  const toggleTag = async (tag: Tag) => {
    const hasTag = dish.tags.some((t) => t.id === tag.id)
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
      try {
        const response = await fetch('/api/menu/tag', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            restaurantId,
            text: newTagText.trim(),
            color: 'bg-blue-500'
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
      alert('❌ Errore di connessione nella generazione dell\'immagine')
      setIsGeneratingImage(false)
    }
  }

  const handleImageGenerationComplete = (result: any) => {
    try {
      console.log('✅ Generazione immagine completata:', result)
      
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
        onUpdateDish({ ...dish, photoUrl: result.photoUrl })
        
        // Alert dopo un piccolo delay per permettere alla UI di stabilizzarsi
        setTimeout(() => {
          alert('🎉 Immagine generata con successo!')
        }, 200)
      } else {
        setTimeout(() => {
          alert('⚠️ Immagine generata ma URL non disponibile')
        }, 200)
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
      
      setTimeout(() => {
        alert('⚠️ L\'immagine è stata generata ma c\'è stato un problema nell\'aggiornamento. Ricarica la pagina.')
      }, 200)
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
    
    // Mostra errore dopo un delay
    setTimeout(() => {
      alert(errorMessage)
    }, 200)
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
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  onBlur={() => handleFieldBlur("description")}
                  className="mt-1 w-full border rounded-md p-2 h-20 text-sm"
                  placeholder="Descrizione breve del piatto..."
                />
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
              <div>
                <label className="text-sm font-semibold text-gray-600">Etichette</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {availableTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        "cursor-pointer",
                        dish.tags.some((t) => t.id === tag.id)
                          ? `${tag.color} text-white`
                          : "bg-gray-200 text-gray-700",
                      )}
                    >
                      {tag.text}
                    </Badge>
                  ))}
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
                      onClick={() => setIsCreatingTag(true)}
                      className="cursor-pointer bg-gray-100 text-gray-500 border-2 border-dashed border-gray-300 hover:bg-gray-200"
                    >
                      + Aggiungi
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Dialog per gestione immagine */}
      <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Gestisci Immagine Piatto</DialogTitle>
            <DialogDescription>
              {dish.photoUrl 
                ? "Puoi sostituire o eliminare l'immagine esistente." 
                : "Carica un'immagine per questo piatto."
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {dish.photoUrl && (
              <div className="text-center">
                <img
                  src={dish.photoUrl}
                  alt={dish.name}
                  className="w-full max-w-xs mx-auto rounded-lg object-cover"
                />
              </div>
            )}
            
            <MediaUpload
              onFileSelect={handleImageUpload}
              selectedFile={isUpdatingImage ? "updating" : ""}
              mediaType="image"
              maxSize={10}
              label={dish.photoUrl ? "Sostituisci immagine" : "Carica immagine"}
              className="w-full"
            />
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">oppure</span>
              </div>
            </div>
            
            <CustomButton
              className="w-full h-12 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold"
              onClick={() => setShowImageGenerationDialog(true)}
              disabled={isUpdatingImage || isGeneratingImage}
            >
              <Wand2 className="mr-2 h-5 w-5" />
              Genera con AI (Imagen 4 Ultra)
            </CustomButton>
            
            <div className="flex justify-between gap-2">
              <CustomButton 
                variant="outline" 
                onClick={() => setShowImageDialog(false)}
                disabled={isUpdatingImage}
              >
                Annulla
              </CustomButton>
              
              {dish.photoUrl && (
                <CustomButton 
                  variant="destructive"
                  onClick={handleImageDelete}
                  disabled={isUpdatingImage}
                >
                  {isUpdatingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Eliminazione...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Elimina Immagine
                    </>
                  )}
                </CustomButton>
              )}
            </div>
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
              Crea un'immagine professionale per <strong>{dish.name}</strong> usando Google Imagen 4 Ultra
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
            {imageGenerationTaskId ? (
              // Mostra progresso generazione immagine asincrona
              <AsyncTaskProgress
                taskId={imageGenerationTaskId}
                title="Generazione Immagine con AI"
                description={`Stiamo creando un'immagine professionale per "${dish.name}" usando Imagen 4 Ultra...`}
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
                          <span className="text-xs text-gray-500">Limite caratteri Imagen</span>
                          <span className={`text-xs font-medium ${customPrompt.length > 400 ? 'text-orange-600' : 'text-gray-500'}`}>
                            {customPrompt.length}/480
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info Imagen 4 Ultra */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
                  <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <ImageIcon className="h-5 w-5" />
                    Imagen 4 Ultra
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-blue-800">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>Qualità iper-realistica</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-800">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>Formato 800x800px</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-blue-800">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>Ottimizzato per cibo</span>
                      </div>
                      <div className="flex items-center gap-2 text-blue-800">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        <span>⏱️ 10-30 secondi</span>
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
  dragAttributes?: any
  dragListeners?: any
  isDragging?: boolean
}) => {
  const [name, setName] = React.useState(category.name)
  const [icon, setIcon] = React.useState(category.icon)

  React.useEffect(() => {
    setName(category.name)
    setIcon(category.icon)
  }, [category])

  const handleNameBlur = async () => {
    if (name.trim() && name !== category.name) {
      try {
        const response = await fetch(`/api/menu/category/${category.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim() })
        })
        if (response.ok) {
          onUpdateCategory({ ...category, name: name.trim() })
        } else {
          setName(category.name) // Revert on error
        }
      } catch (err) {
        console.error('Error updating category name:', err)
        setName(category.name) // Revert on error
      }
    } else {
      setName(category.name)
    }
  }

  const handleIconBlur = async () => {
    if (icon.trim() && icon !== category.icon) {
      try {
        const response = await fetch(`/api/menu/category/${category.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ icon: icon.trim() })
        })
        if (response.ok) {
          onUpdateCategory({ ...category, icon: icon.trim() })
        } else {
          setIcon(category.icon) // Revert on error
        }
      } catch (err) {
        console.error('Error updating category icon:', err)
        setIcon(category.icon) // Revert on error
      }
    } else {
      setIcon(category.icon)
    }
  }

  return (
    <AccordionItem
      value={category.id}
      className="group bg-transparent border-none rounded-2xl shadow-sm overflow-visible"
    >
      <div className="relative rounded-2xl border-b-4 border-[#d8d8d8] transition-transform group-data-[state=open]:translate-y-1">
        <span className="absolute inset-0 -bottom-1 rounded-2xl bg-[#e5e5e5]"></span>
        <div className="relative bg-white rounded-2xl overflow-hidden">
          <AccordionTrigger className="text-lg font-bold text-gray-700 p-4 hover:no-underline w-full data-[state=open]:border-b">
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
            <DndContext
              sensors={useSensors(
                useSensor(PointerSensor),
                useSensor(TouchSensor)
              )}
              collisionDetection={closestCenter}
              onDragEnd={(event) => {
                const { active, over } = event
                if (active.id !== over?.id) {
                  const oldIndex = category.dishes.findIndex((dish) => dish.id === active.id)
                  const newIndex = category.dishes.findIndex((dish) => dish.id === over?.id)
                  const newDishes = arrayMove(category.dishes, oldIndex, newIndex)
                  onDishReorder?.(category.id, newDishes)
                }
              }}
            >
              <SortableContext
                items={category.dishes.map(dish => dish.id)}
                strategy={verticalListSortingStrategy}
              >
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
              </SortableContext>
            </DndContext>
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

// --- MAIN COMPONENT ---
export default function MenuAdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // States
  const [menuData, setMenuData] = React.useState<MenuData | null>(null)
  const [originalCategories, setOriginalCategories] = React.useState<Category[]>([])
  const [categories, setCategories] = React.useState<Category[]>([])
  const [availableTags, setAvailableTags] = React.useState<Tag[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  
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
  const [brandSettings, setBrandSettings] = React.useState({
    primaryColor: '#3B82F6',
    secondaryColor: '#64748B',
    coverImageUrl: '',
    logoUrl: ''
  })
  const [isUpdatingBrand, setIsUpdatingBrand] = React.useState(false)

  // Stati per le traduzioni
  const [showTranslationsDialog, setShowTranslationsDialog] = React.useState(false)
  const [supportedLanguages, setSupportedLanguages] = React.useState<Array<{
    code: string
    name: string
    flag: string
    isDefault: boolean
  }>>([])
  const [isGeneratingTranslation, setIsGeneratingTranslation] = React.useState(false)
  const [selectedLanguageForTranslation, setSelectedLanguageForTranslation] = React.useState('')
  const [translationTaskId, setTranslationTaskId] = React.useState<string | null>(null)

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

  const loadMenuData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch(`/api/menu/${restaurantId}`)
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error)
      }
      
      setMenuData(data.data)
      setCategories(data.data.categories)
      setOriginalCategories(JSON.parse(JSON.stringify(data.data.categories)))
      setAvailableTags(data.data.availableTags)
      
      // Carica le impostazioni brand dal menu
      if (data.data.menu?.designSettings) {
        setBrandSettings({
          primaryColor: data.data.menu.designSettings.primaryColor || '#3B82F6',
          secondaryColor: data.data.menu.designSettings.secondaryColor || '#64748B',
          coverImageUrl: data.data.menu.designSettings.coverImageUrl || '',
          logoUrl: data.data.menu.designSettings.logoUrl || ''
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
        alert(`✅ ${result.message || 'Traduzioni completate'}!\n\n${result.stats.categoriesTranslated} categorie e ${result.stats.dishesTranslated} piatti tradotti.`)
      } else {
        alert('✅ Traduzioni completate con successo!')
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
        alert('⚠️ Le traduzioni sono state completate ma c\'è stato un problema nel ricaricamento della pagina. Aggiorna manualmente la pagina.')
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
    return availableLanguages.filter(lang => !supportedCodes.includes(lang.code))
  }

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

  const handleCategoryDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (active.id !== over?.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id)
      const newIndex = categories.findIndex((cat) => cat.id === over?.id)
      const newCategories = arrayMove(categories, oldIndex, newIndex)
      handleCategoryReorder(newCategories)
    }
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
            onClick={loadMenuData}
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
      <div className="bg-gray-50 min-h-screen font-sans">
      <header className="fixed top-4 right-4 z-10">
        <button className="relative bg-white/80 backdrop-blur-sm rounded-2xl border-b-4 border-gray-900/20 h-12 w-12 shadow-lg font-bold uppercase tracking-wider transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-1 active:border-b-0">
          <span className="absolute inset-0 -bottom-1 rounded-2xl bg-gray-200"></span>
          <span className="relative flex h-full w-full items-center justify-center rounded-2xl bg-white/80 transition-transform duration-150">
            <Eye className="h-6 w-6 text-gray-700" />
          </span>
        </button>
      </header>
      
      <main className="pt-8 pb-32 container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">Il Tuo Menù Digitale</h1>
        </div>

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
          onDragEnd={handleCategoryDragEnd}
        >
          <SortableContext
            items={filteredCategories.map(cat => cat.id)}
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
                  label={brandSettings.logoUrl ? "Sostituisci Logo" : "Carica Logo"}
                  className="w-full"
                />
                
                <p className="text-xs text-gray-500 mt-3 bg-gray-50 p-3 rounded-lg">
                  💡 Logo mostrato nell'header. Consigliato: formato quadrato, sfondo trasparente
                </p>
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
              {/* Lingue già supportate */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  ✅ Lingue Supportate
                </h3>
                
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
                        <span className="text-xs text-gray-500 uppercase font-medium">
                          {lang.code}
                        </span>
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
                
                {translationTaskId ? (
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
                        disabled={isGeneratingTranslation}
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
                      disabled={!selectedLanguageForTranslation || isGeneratingTranslation}
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
                  if (translationTaskId) {
                    // Se c'è un task in corso, chiedi conferma
                    if (confirm('🚧 C\'è una traduzione in corso. Sei sicuro di voler chiudere? Il processo continuerà in background.')) {
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
                ) : (
                  <>
                    ✅ Fatto
                  </>
                )}
              </CustomButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* Fixed Bottom Actions */}
        <div className="w-full max-w-md fixed bottom-0 left-0 right-0 mx-auto bg-transparent backdrop-blur-sm rounded-t-3xl p-4 shadow-xl z-20">
          <div className="grid grid-cols-3 gap-2">
            <CustomButton
              className="flex flex-col items-center justify-center h-24 py-2 px-1 text-[10px] leading-tight"
              onClick={() => setShowBrandDialog(true)}
            >
              <ImageIcon className="w-5 h-5 mb-1 flex-shrink-0" />
              <span className="text-center break-words hyphens-auto max-w-full">
                Brand
              </span>
            </CustomButton>

            <CustomButton
              className="flex flex-col items-center justify-center h-24 py-2 px-1 text-[10px] leading-tight"
              onClick={handleBulkPriceUpdate}
            >
              <DollarSign className="w-5 h-5 mb-1 flex-shrink-0" />
              <span className="text-center break-words hyphens-auto max-w-full">
                Aggiorna Prezzi
              </span>
            </CustomButton>

            <CustomButton
              className="flex flex-col items-center justify-center h-24 py-2 px-1 text-[10px] leading-tight"
              onClick={() => setShowTranslationsDialog(true)}
            >
              <span className="text-xl mb-1 flex-shrink-0">🌍</span>
              <span className="text-center break-words hyphens-auto max-w-full">
                Traduzioni
              </span>
            </CustomButton>
          </div>
        </div>
      </main>
    </div>
    </>
  )
} 