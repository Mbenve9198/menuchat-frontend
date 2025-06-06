# Configurazione Stripe per MenuChat

## Variabili d'ambiente richieste

### Frontend (.env.local)
```bash
# Solo la publishable key nel frontend (sicura)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

### Backend (.env)
```bash
# Secret key solo nel backend (sicura)
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

## Sicurezza

✅ **PUBLISHABLE KEY (pk_)**: Sicura nel frontend
- Progettata per essere esposta pubblicamente
- Permessi limitati (solo creare Payment Intents)
- Prefisso `NEXT_PUBLIC_` corretto per Next.js

❌ **SECRET KEY (sk_)**: Solo nel backend
- Mai esporre nel frontend!
- Ha accesso completo al tuo account Stripe
- Rimane sicura nel server backend

## Come ottenere le chiavi Stripe

1. Vai su [Stripe Dashboard](https://dashboard.stripe.com/)
2. Crea un account o accedi
3. Vai su "Developers" > "API keys"
4. Copia la "Publishable key" e la "Secret key"
5. Per il testing, usa le chiavi che iniziano con `pk_test_` e `sk_test_`

## Prezzi per contatto

Il sistema implementa i seguenti prezzi scalari:

- 0-999 contatti: €0.15 per contatto
- 1000-1999 contatti: €0.14 per contatto  
- 2000-2999 contatti: €0.13 per contatto
- 3000-3999 contatti: €0.12 per contatto
- 4000-4999 contatti: €0.11 per contatto
- 5000+ contatti: €0.10 per contatto

## Flusso di pagamento

1. L'utente seleziona i contatti
2. Configura la campagna
3. Crea il contenuto
4. **NUOVO**: Completa il pagamento con Stripe
5. Programma e invia la campagna

La campagna viene creata e programmata solo dopo il completamento del pagamento.

## Architettura sicura

- **Frontend**: Usa solo la publishable key per inizializzare Stripe Elements
- **Backend**: Gestisce tutti i Payment Intents con la secret key
- **API Calls**: Frontend → Backend → Stripe (mai Frontend → Stripe direttamente)

## Test con carte di credito

Per il testing, usa queste carte di credito di test:

- **Successo**: 4242 4242 4242 4242
- **Fallimento**: 4000 0000 0000 0002
- **Richiede autenticazione**: 4000 0025 0000 3155

Usa qualsiasi data futura per la scadenza e qualsiasi CVC a 3 cifre. 