"use client"

import * as React from "react"
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
} from "lucide-react"
import { CustomButton } from "@/components/ui/custom-button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { MultipleMediaUpload } from "@/components/ui/multiple-media-upload"
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
  const [name, setName] = React.useState(dish.name)
  const [price, setPrice] = React.useState(dish.price.toFixed(2))
  const [description, setDescription] = React.useState(dish.description || "")
  const [ingredients, setIngredients] = React.useState((dish.ingredients || []).join(", "))
  const [newTagText, setNewTagText] = React.useState("")
  const [isCreatingTag, setIsCreatingTag] = React.useState(false)

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

  return (
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
            <div className="w-16 h-16 shrink-0" onClick={(e) => e.stopPropagation()}>
              {dish.photoUrl ? (
                <img
                  src={dish.photoUrl || "/placeholder.svg"}
                  alt={dish.name}
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400" />
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
                  onClick={() => {
                    // TODO: Implement AI description generation
                    console.log("Generate description for:", dish.name)
                  }}
                  title="Genera descrizione con AI"
                >
                  <Sparkles className="h-4 w-4" />
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
                  onClick={() => {
                    // TODO: Implement AI ingredients generation
                    console.log("Generate ingredients for:", dish.name)
                  }}
                  title="Genera ingredienti con AI"
                >
                  <Sparkles className="h-4 w-4" />
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
              <button
                className="h-8 w-8 shrink-0 flex items-center justify-center rounded-md bg-transparent text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-150 ml-2"
                onClick={(e) => {
                  e.stopPropagation()
                  onDeleteCategory()
                }}
                title="Elimina categoria"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          </AccordionTrigger>
          <AccordionContent className="p-4 pt-6">
            <div className="space-y-3">
              {category.dishes.map((dish) => (
                <DishAccordionItem
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

  const hasChanges = JSON.stringify(categories) !== JSON.stringify(originalCategories)
  const restaurantId = session?.user?.restaurantId

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
      
    } catch (err: any) {
      console.error('Error loading menu data:', err)
      setError(err.message || 'Errore nel caricamento del menu')
    } finally {
      setIsLoading(false)
    }
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
    <div className="bg-gray-50 min-h-screen font-sans">
      <header className="fixed top-4 right-4 z-10">
        <button className="relative bg-white/80 backdrop-blur-sm rounded-2xl border-b-4 border-gray-900/20 h-12 w-12 shadow-lg font-bold uppercase tracking-wider transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-1 active:border-b-0">
          <span className="absolute inset-0 -bottom-1 rounded-2xl bg-gray-200"></span>
          <span className="relative flex h-full w-full items-center justify-center rounded-2xl bg-white/80 transition-transform duration-150">
            <Eye className="h-6 w-6 text-gray-700" />
          </span>
        </button>
      </header>
      
      <main className="pt-8 pb-8 container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-800">Il Tuo Menù Digitale</h1>
        </div>

        {!bulkMode && (
          <div className="mb-6 flex gap-3">
            <CustomButton variant="outline" onClick={handleBulkPriceUpdate}>
              <DollarSign className="mr-2 h-5 w-5" /> Aggiorna Prezzi
            </CustomButton>
            <CustomButton variant="outline" onClick={handleImportMenu}>
              <Upload className="mr-2 h-5 w-5" /> Importa Menu
            </CustomButton>
          </div>
        )}

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
                  const allDishIds = categories.flatMap(cat => cat.dishes.map(dish => dish.id))
                  setSelectedBulkItems(allDishIds)
                }}
              >
                Seleziona Tutto
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

        <Accordion type="multiple" className="w-full space-y-4" defaultValue={categories.map(cat => cat.id)}>
          {categories.map((category) => (
            <CategoryAccordion
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
            />
          ))}
        </Accordion>

        {/* Add Category Button */}
        <div className="mt-6">
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
        </div>

        {/* Bulk Price Update Dialog */}
        <Dialog open={showBulkPriceDialog} onOpenChange={setShowBulkPriceDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Aggiorna Prezzi in Blocco</DialogTitle>
              <DialogDescription>
                Seleziona il tipo di aggiornamento da applicare ai {selectedBulkItems.length} elementi selezionati.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="fixed-amount"
                    name="bulk-type"
                    checked={bulkUpdateType === "fixed"}
                    onChange={() => setBulkUpdateType("fixed")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="fixed-amount" className="flex items-center gap-2 cursor-pointer">
                    <Plus className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Aumenta di un importo fisso</span>
                  </label>
                </div>
                {bulkUpdateType === "fixed" && (
                  <div className="ml-6 flex items-center gap-2">
                    <span className="text-gray-500">€</span>
                    <Input
                      type="number"
                      step="0.01"
                      value={bulkFixedAmount}
                      onChange={(e) => setBulkFixedAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-24"
                    />
                    <span className="text-sm text-gray-600">per ogni elemento</span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="percentage"
                    name="bulk-type"
                    checked={bulkUpdateType === "percentage"}
                    onChange={() => setBulkUpdateType("percentage")}
                    className="w-4 h-4 text-blue-600"
                  />
                  <label htmlFor="percentage" className="flex items-center gap-2 cursor-pointer">
                    <Percent className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Aumenta di una percentuale</span>
                  </label>
                </div>
                {bulkUpdateType === "percentage" && (
                  <div className="ml-6 flex items-center gap-2">
                    <Input
                      type="number"
                      step="0.1"
                      value={bulkPercentage}
                      onChange={(e) => setBulkPercentage(e.target.value)}
                      placeholder="0"
                      className="w-20"
                    />
                    <span className="text-gray-500">%</span>
                    <span className="text-sm text-gray-600">di aumento</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600 mb-3">
                  Anteprima: {selectedBulkItems.length} elementi verranno aggiornati
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded text-gray-700 hover:bg-gray-200"
                    onClick={() => setShowBulkPriceDialog(false)}
                  >
                    Annulla
                  </button>
                  <button
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleApplyBulkPriceUpdate}
                    disabled={
                      (bulkUpdateType === "fixed" && !bulkFixedAmount) ||
                      (bulkUpdateType === "percentage" && !bulkPercentage)
                    }
                  >
                    Applica Modifiche
                  </button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Menu Import Dialog */}
        <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Importa Menu da Immagini</DialogTitle>
              <DialogDescription>
                Carica una o più immagini del tuo menu (fino a 5) e useremo l'AI per estrarre automaticamente categorie e piatti da tutte le immagini insieme.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {!showAnalysisPreview && (
                <>
                  {analysisTaskId ? (
                    // Mostra progresso analisi asincrona
                    <AsyncTaskProgress
                      taskId={analysisTaskId}
                      title="Analisi Menu con AI"
                      description={`Stiamo analizzando ${importedFiles.length} immagini del tuo menu per estrarre categorie e piatti...`}
                      onComplete={handleAnalysisComplete}
                      onError={handleAnalysisError}
                      onCancel={() => {
                        setAnalysisTaskId(null)
                        setImportedFiles([])
                      }}
                      pollingInterval={2000}
                      className="my-6"
                    />
                  ) : (
                    // Mostra interfaccia normale di upload
                    <>
                      <MultipleMediaUpload
                        onFilesSelect={handleFilesImport}
                        selectedFiles={importedFiles}
                        mediaType="image"
                        maxFiles={5}
                        label="Carica Immagini del Menu (max 5)"
                        className="w-full"
                      />
                      
                      {importedFiles.length > 0 && (
                        <div className="flex justify-end gap-2">
                          <CustomButton 
                            variant="outline" 
                            onClick={() => setImportedFiles([])}
                          >
                            Rimuovi Tutti
                          </CustomButton>
                          <CustomButton 
                            onClick={handleAnalyzeMenu}
                            disabled={isAnalyzing || importedFiles.length === 0}
                          >
                            {isAnalyzing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creazione task...
                              </>
                            ) : (
                              <>
                                <Zap className="mr-2 h-4 w-4" />
                                Analizza {importedFiles.length} immagini con AI
                              </>
                            )}
                          </CustomButton>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
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
                  <h3 className="font-semibold text-lg mb-4">
                    Categorie trovate: {analyzedData.categories.length}
                  </h3>
                  
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
      </main>
    </div>
  )
} 