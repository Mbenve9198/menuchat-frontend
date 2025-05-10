import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Loader2, Sparkles, ImageIcon } from 'lucide-react';
import { toast } from './ui/use-toast';
import { CustomButton } from './ui/custom-button';

interface ImagePromptDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => Promise<void>;
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
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Genera il prompt automaticamente all'apertura del dialog
  useEffect(() => {
    if (isOpen) {
      generatePrompt();
    }
  }, [isOpen]);

  const generatePrompt = async () => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt richiesto",
        description: "Inserisci un prompt per generare l'immagine",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      await onGenerate(prompt);
      onClose();
    } catch (error) {
      console.error('Errore nella generazione:', error);
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : "Errore nella generazione",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-white rounded-3xl shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">Genera Immagine per la Campagna</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Prompt per DALL-E</label>
              <CustomButton
                size="sm"
                onClick={generatePrompt}
                className="text-xs py-1 px-3 flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
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
              placeholder={isLoading ? "Generazione prompt in corso..." : "Modifica il prompt per personalizzare l'immagine..."}
              rows={6}
              className="rounded-xl border-gray-200 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="space-x-2">
          <CustomButton
            variant="outline"
            onClick={onClose}
            className="text-gray-800"
          >
            Annulla
          </CustomButton>
          <CustomButton 
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="flex items-center"
          >
            {isGenerating ? (
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 