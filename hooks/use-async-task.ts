import { useState, useEffect, useCallback, useRef } from 'react';

export interface AsyncTask {
  taskId: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  progressMessage: string;
  result?: any;
  error?: {
    message: string;
    stack?: string;
  };
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

interface UseAsyncTaskOptions {
  pollingInterval?: number; // in millisecondi, default 3000 (3 secondi)
  autoStop?: boolean; // ferma automaticamente quando completato/fallito, default true
  onComplete?: (result: any) => void;
  onError?: (error: any) => void;
  onProgress?: (progress: number, message: string) => void;
}

interface UseAsyncTaskReturn {
  task: AsyncTask | null;
  isLoading: boolean;
  isPolling: boolean;
  error: string | null;
  startPolling: (taskId: string) => void;
  stopPolling: () => void;
  refreshTask: () => Promise<void>;
}

export function useAsyncTask(options: UseAsyncTaskOptions = {}): UseAsyncTaskReturn {
  const {
    pollingInterval = 3000,
    autoStop = true,
    onComplete,
    onError,
    onProgress
  } = options;

  const [task, setTask] = useState<AsyncTask | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const taskIdRef = useRef<string | null>(null);

  // Funzione per recuperare lo stato del task
  const fetchTaskStatus = useCallback(async (taskId: string) => {
    try {
      setError(null);
      
      const response = await fetch(`/api/async-tasks/${taskId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Errore nel recupero dello stato del task');
      }

      if (data.success && data.task) {
        const newTask = data.task;
        setTask(newTask);

        // Callback per progresso
        if (onProgress && newTask.progress !== task?.progress) {
          onProgress(newTask.progress, newTask.progressMessage);
        }

        // Gestione completamento/errore
        if (newTask.status === 'completed') {
          if (onComplete) {
            onComplete(newTask.result);
          }
          if (autoStop) {
            stopPolling();
          }
        } else if (newTask.status === 'failed') {
          if (onError) {
            onError(newTask.error);
          }
          if (autoStop) {
            stopPolling();
          }
        }

        return newTask;
      } else {
        throw new Error('Formato risposta non valido');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Errore nel recupero dello stato del task';
      setError(errorMessage);
      console.error('Errore fetch task status:', err);
      throw err;
    }
  }, [task?.progress, onProgress, onComplete, onError, autoStop]);

  // Funzione per avviare il polling
  const startPolling = useCallback((taskId: string) => {
    console.log(`🔄 Avvio polling per task ${taskId}`);
    
    // Ferma qualsiasi polling precedente
    stopPolling();
    
    taskIdRef.current = taskId;
    setIsPolling(true);
    setError(null);

    // Prima chiamata immediata
    setIsLoading(true);
    fetchTaskStatus(taskId)
      .catch(console.error)
      .finally(() => setIsLoading(false));

    // Avvia polling periodico
    pollingRef.current = setInterval(async () => {
      if (taskIdRef.current) {
        try {
          const updatedTask = await fetchTaskStatus(taskIdRef.current);
          
          // Ferma il polling se il task è completato o fallito
          if (autoStop && (updatedTask.status === 'completed' || updatedTask.status === 'failed')) {
            console.log(`✅ Polling fermato automaticamente per task ${taskIdRef.current} (status: ${updatedTask.status})`);
            stopPolling();
          }
        } catch (err) {
          console.error('Errore durante il polling:', err);
          // Non fermiamo il polling in caso di errore temporaneo
        }
      }
    }, pollingInterval);

  }, [fetchTaskStatus, pollingInterval, autoStop]);

  // Funzione per fermare il polling
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setIsPolling(false);
    taskIdRef.current = null;
    console.log('⏹️ Polling fermato');
  }, []);

  // Funzione per aggiornare manualmente il task
  const refreshTask = useCallback(async () => {
    if (!taskIdRef.current) {
      throw new Error('Nessun task attivo da aggiornare');
    }

    setIsLoading(true);
    try {
      await fetchTaskStatus(taskIdRef.current);
    } finally {
      setIsLoading(false);
    }
  }, [fetchTaskStatus]);

  // Cleanup al dismount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Auto-stop quando il componente cambia taskId
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  return {
    task,
    isLoading,
    isPolling,
    error,
    startPolling,
    stopPolling,
    refreshTask
  };
}

// Hook semplificato per un singolo task
export function useAsyncTaskSimple(taskId: string | null, options: UseAsyncTaskOptions = {}) {
  const { task, isLoading, isPolling, error, startPolling, stopPolling, refreshTask } = useAsyncTask(options);

  useEffect(() => {
    if (taskId) {
      startPolling(taskId);
    } else {
      stopPolling();
    }
  }, [taskId, startPolling, stopPolling]);

  return {
    task,
    isLoading,
    isPolling,
    error,
    refreshTask,
    stopPolling
  };
} 