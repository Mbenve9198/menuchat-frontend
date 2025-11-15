'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
        {/* Success Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-12 h-12 text-blue-600" 
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
          🎉 Richiesta Inviata!
        </h1>
        
        <p className="text-xl text-gray-700 mb-6">
          Perfetto! Il tuo report è pronto e ti chiamiamo presto.
        </p>

        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            📞 Cosa succede ora?
          </h2>
          <ul className="text-left space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Ti contatteremo <strong>nell'orario che hai scelto</strong> (mattina o pomeriggio)</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Analizzeremo insieme <strong>il tuo report GMB completo</strong></span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Ti spiegheremo le <strong>3 azioni prioritarie</strong> per migliorare il tuo ranking</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">✓</span>
              <span>Vedremo come <strong>superare i tuoi competitor</strong> su Google Maps</span>
            </li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-900">
            <strong>💡 Tieni il telefono a portata di mano!</strong><br />
            La chiamata dura circa 15 minuti e ti daremo tutte le informazioni per scalare la classifica.
          </p>
        </div>

        {/* Footer */}
        <p className="text-gray-600 text-sm">
          Hai domande? Scrivici a{' '}
          <a 
            href="mailto:team@menuchat.it" 
            className="text-blue-600 hover:text-blue-700 font-medium"
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Caricamento...</p>
        </div>
      </div>
    }>
      <ThankYouContent />
    </Suspense>
  );
}

