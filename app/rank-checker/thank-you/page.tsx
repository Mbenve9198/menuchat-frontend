'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          🎉 Complimenti!
        </h1>
        
        <p className="text-xl text-gray-700 mb-6">
          Hai accettato l'offerta da <span className="font-bold text-green-600">50€</span>!
        </p>

        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            📞 Cosa succede ora?
          </h2>
          <ul className="text-left space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Il nostro team ti contatterà <strong>entro 24 ore</strong></span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Ti faremo una breve chiamata (10 minuti) per configurare tutto</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Riceverai <strong>50€</strong> sul tuo conto/PayPal</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2">✓</span>
              <span>Inizierai a ricevere recensioni automatiche in <strong>14 giorni</strong></span>
            </li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-900">
            <strong>💡 Tieni il telefono a portata di mano!</strong><br />
            Ti chiameremo al numero che ci hai fornito.
          </p>
        </div>

        {/* Footer */}
        <p className="text-gray-600 text-sm">
          Hai domande? Scrivici a{' '}
          <a 
            href="mailto:team@menuchat.it" 
            className="text-green-600 hover:text-green-700 font-medium"
          >
            team@menuchat.it
          </a>
        </p>

        {/* Branding */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Grazie per aver scelto <strong className="text-gray-900">MenuChat</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}

