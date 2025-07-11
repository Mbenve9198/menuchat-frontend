"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play,
  RefreshCw,
  X
} from 'lucide-react';
import { useAsyncTaskSimple, AsyncTask } from '@/hooks/use-async-task';

interface AsyncTaskProgressProps {
  taskId: string | null;
  title?: string;
  description?: string;
  pollingInterval?: number;
  onComplete?: (result: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
  showDetails?: boolean;
  className?: string;
}

export function AsyncTaskProgress({
  taskId,
  title = "Elaborazione in corso",
  description,
  pollingInterval = 3000,
  onComplete,
  onError,
  onCancel,
  showDetails = true,
  className = ""
}: AsyncTaskProgressProps) {
  
  const { task, isLoading, isPolling, error, refreshTask, stopPolling } = useAsyncTaskSimple(
    taskId,
    {
      pollingInterval,
      onComplete,
      onError,
      onProgress: (progress, message) => {
        console.log(`📊 Progresso: ${progress}% - ${message}`);
      }
    }
  );

  if (!taskId) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'In attesa';
      case 'processing':
        return 'Elaborazione';
      case 'completed':
        return 'Completato';
      case 'failed':
        return 'Errore';
      default:
        return 'Sconosciuto';
    }
  };

  const handleCancel = () => {
    stopPolling();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(task?.status || 'pending')}
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              {description && (
                <p className="text-sm text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {task && (
              <Badge 
                variant="secondary" 
                className={`${getStatusColor(task.status)} text-white`}
              >
                {getStatusText(task.status)}
              </Badge>
            )}
            
            {(task?.status === 'pending' || task?.status === 'processing') && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Barra di progresso */}
        {task && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">{task.progress}%</span>
            </div>
            <Progress value={task.progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {task.progressMessage}
            </p>
          </div>
        )}

        {/* Stato di caricamento iniziale */}
        {isLoading && !task && (
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Recupero informazioni task...</span>
          </div>
        )}

        {/* Stato di polling */}
        {isPolling && task && (task.status === 'pending' || task.status === 'processing') && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Monitoraggio attivo (ogni {pollingInterval / 1000}s)</span>
          </div>
        )}

        {/* Errori */}
        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Errore di comunicazione: {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Errore del task */}
        {task?.status === 'failed' && task.error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Elaborazione fallita</p>
                <p className="text-sm">{task.error.message}</p>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Risultato completato */}
        {task?.status === 'completed' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-1">
                <p className="font-medium">Elaborazione completata con successo!</p>
                
                {/* Mostra lingua riconosciuta per analisi menu */}
                {task.result?.menuData?.language && (
                  <div className="flex items-center space-x-2 text-sm">
                    <span>🌍</span>
                    <span className="text-muted-foreground">
                      Lingua riconosciuta: <span className="font-medium text-foreground">
                        {task.result.menuData.language.name} ({task.result.menuData.language.code})
                      </span>
                      {task.result.menuData.language.confidence && (
                        <span className="ml-1 text-xs">
                          - {Math.round(task.result.menuData.language.confidence * 100)}% di confidenza
                        </span>
                      )}
                    </span>
                  </div>
                )}
                
                {task.result?.stats && (
                  <p className="text-sm text-muted-foreground">
                    {Object.entries(task.result.stats).map(([key, value]) => 
                      `${key}: ${value}`
                    ).join(', ')}
                  </p>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Dettagli task (opzionale) */}
        {showDetails && task && (
          <div className="border-t pt-3 space-y-2">
            <div className="text-xs text-muted-foreground space-y-1">
              <div>Task ID: <code className="font-mono">{task.taskId}</code></div>
              <div>Tipo: {task.type}</div>
              <div>Creato: {new Date(task.createdAt).toLocaleString('it-IT')}</div>
              {task.completedAt && (
                <div>Completato: {new Date(task.completedAt).toLocaleString('it-IT')}</div>
              )}
            </div>
          </div>
        )}

        {/* Azioni */}
        <div className="flex justify-end space-x-2 pt-2">
          {task && (task.status === 'completed' || task.status === 'failed') && (
            <Button
              variant="outline"
              size="sm"
              onClick={refreshTask}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Aggiorna
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Componente compatto per mostrare solo progresso essenziale
export function AsyncTaskProgressCompact({
  taskId,
  title = "Elaborazione...",
  onComplete,
  onError
}: {
  taskId: string | null;
  title?: string;
  onComplete?: (result: any) => void;
  onError?: (error: any) => void;
}) {
  const { task, isPolling } = useAsyncTaskSimple(taskId, {
    onComplete,
    onError
  });

  if (!taskId || !task) return null;

  return (
    <div className="flex items-center space-x-3 p-3 bg-muted rounded-lg">
      {getStatusIcon(task.status)}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{title}</p>
        <div className="flex items-center space-x-2 mt-1">
          <Progress value={task.progress} className="h-1 flex-1" />
          <span className="text-xs text-muted-foreground">{task.progress}%</span>
        </div>
      </div>
      {isPolling && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />}
    </div>
  );
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'processing':
      return <Loader2 className="h-4 w-4 animate-spin" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    case 'failed':
      return <XCircle className="h-4 w-4 text-red-500" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
} 