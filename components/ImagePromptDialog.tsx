"use client"

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Loader2, Sparkles, ImageIcon, Upload } from 'lucide-react';
import { toast } from './ui/use-toast';
import { CustomButton } from './ui/custom-button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileUpload } from './ui/file-upload';

interface ImagePromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (imageUrl: string) => Promise<void>;
  messageText: string;
  campaignType: string;
  objective: string;
}

export function ImagePromptDialog({
  isOpen,
  onClose,
  onGenerate,
  messageText,
  campaignType,
  objective
}: ImagePromptDialogProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'upload'>('ai');
  const [prompt, setPrompt] = useState('');
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);

  // Genera il prompt automaticamente all'apertura del dialog
  useEffect(() => {
    if (isOpen && activeTab === 'ai') {
      generatePrompt();
    }
  }, [isOpen]);

  const generatePrompt = async () => {
    try {
      setIsGeneratingPrompt(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/generate-image-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messageText,
          campaignType,
          objective,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore nella generazione del prompt');
      }

      const data = await response.json();
      if (data.success) {
        setPrompt(data.data.prompt);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Errore nella generazione del prompt:', error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore nella generazione del prompt",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleFileUpload = async (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }

    try {
      setIsGeneratingImage(true);
      
      // Crea il FormData per l'upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Chiamata all'API di upload
      const response = await fetch('/api/upload/campaign-image', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Errore durante il caricamento del file');
      }

      const data = await response.json();
      
      if (data.success) {
        await onGenerate(data.file.url);
        onClose();
        toast({
          title: "Successo",
          description: "Immagine caricata con successo",
        });
      } else {
        throw new Error(data.error || 'Errore durante il caricamento del file');
      }
    } catch (error) {
      console.error('Errore nel caricamento del file:', error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore nel caricamento del file",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Errore",
        description: "Inserisci un prompt per generare l'immagine",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGeneratingImage(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/generate-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore nella generazione dell\'immagine');
      }

      if (!data.success || !data.data?.imageUrl) {
        throw new Error('URL immagine non trovato nella risposta');
      }

      setGeneratedImageUrl(data.data.imageUrl);
      await onGenerate(data.data.imageUrl);
      onClose();
      
      toast({
        title: "Successo",
        description: "Immagine generata con successo",
      });
    } catch (error) {
      console.error('Errore:', error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Impossibile generare l'immagine",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-3xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">Immagine Campagna</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Genera un'immagine con l'AI o carica un'immagine dal tuo computer
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'ai' | 'upload')} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Genera con AI
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Carica Immagine
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Prompt per DALL-E</label>
                <CustomButton
                  size="sm"
                  onClick={generatePrompt}
                  className="text-xs py-1 px-3 flex items-center"
                  disabled={isGeneratingPrompt}
                >
                  {isGeneratingPrompt ? (
                    <>
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      Rigenerazione...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 mr-1" />
                      Rigenera Prompt
                    </>
                  )}
                </CustomButton>
              </div>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={isGeneratingPrompt ? "Generazione prompt in corso..." : "Modifica il prompt per personalizzare l'immagine..."}
                rows={6}
                className="rounded-xl border-gray-200 resize-none"
              />
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-4">
            <FileUpload
              selectedFile={selectedFile}
              onFileSelect={handleFileUpload}
              accept="image/*"
              maxSize={5}
              label="Carica un'immagine"
            />
          </TabsContent>
        </Tabs>

        <DialogFooter className="space-x-2">
          <CustomButton
            variant="outline"
            onClick={onClose}
            className="text-gray-800"
          >
            Annulla
          </CustomButton>
          {activeTab === 'ai' && (
            <CustomButton 
              onClick={generateImage}
              disabled={!prompt.trim() || isGeneratingImage}
              className="flex items-center"
            >
              {isGeneratingImage ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generazione...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Genera Immagine
                </>
              )}
            </CustomButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 