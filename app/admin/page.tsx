'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Controlla se l'utente è già autenticato
    const token = localStorage.getItem('adminToken');
    
    if (token) {
      // Se ha già un token, vai al dashboard
      router.push('/admin/dashboard');
    } else {
      // Altrimenti vai al login
      router.push('/admin/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Reindirizzamento...</p>
      </div>
    </div>
  );
} 