import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from './ui/use-toast';

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

  const generatePrompt = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/ai/generate-image-prompt', {
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

      const data = await response.json();
      if (data.success) {
        setPrompt(data.data.prompt);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Errore nella generazione del prompt:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      // Prima genera l'immagine con DALL-E
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt
        }),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }

      // Passa l'URL dell'immagine generata al componente padre
      await onGenerate(data.data.imageUrl);
      onClose();
    } catch (error) {
      console.error('Errore nella generazione dell\'immagine:', error);
      toast({
        title: "Errore",
        description: "Errore nella generazione dell'immagine",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Genera Immagine per la Campagna</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Prompt per DALL-E</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Il prompt verrà generato automaticamente..."
              rows={6}
              className="resize-none"
            />
          </div>

          <Button
            onClick={generatePrompt}
            variant="outline"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generazione prompt...
              </>
            ) : (
              'Genera Prompt'
            )}
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={!prompt || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generazione immagine...
              </>
            ) : (
              'Genera Immagine'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 