# Funzionalità Gestione Contatti e Privacy

## 🎯 Nuove Features Implementate

### 1. **Pagina Rubrica Contatti** (`/contacts`)
- ✅ Lista completa di tutti i contatti del ristorante
- ✅ Ricerca per nome, telefono o email
- ✅ Filtri per paese e stato consenso
- ✅ Statistiche contatti (totali, con consenso, opt-out)
- ✅ Gestione privacy per singolo contatto

### 2. **Gestione Privacy Granulare**
- ✅ Switch rapido per attivare/disattivare consenso marketing
- ✅ Dialog dettagliato con informazioni complete del contatto
- ✅ Visualizzazione motivo e data opt-out
- ✅ Aggiornamento in tempo reale

### 3. **UI/UX Coerente Mobile-First**
- ✅ Design coerente con resto dell'app
- ✅ Animazioni fluide con framer-motion
- ✅ Cards arrotondate con shadow
- ✅ Color scheme [#1B9AAA] e [#06D6A0]
- ✅ Pulsanti fixed in basso

## 📱 **Interfaccia Utente**

### Header con Navigazione
```
[←] Rubrica Contatti [🌐]
```

### Sezione Ricerca e Filtri
```
🔍 [Cerca per nome, telefono o email...]

[Tutti i contatti ▼]  [Tutti i paesi ▼]
```

### Statistiche
```
┌─────────┬─────────┬─────────┐
│   123   │   98    │   25    │
│ Totali  │Consenso │ Opt-out │
└─────────┴─────────┴─────────┘
```

### Lista Contatti
```
┌─────────────────────────────────┐
│ [MB] Marco Benvenuti        [🇮🇹]│
│      📞 +393517433547            │
│      ✅ Consenso    🔄 Toggle   │
│      ━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│      5 Interazioni  3 Campagne │
└─────────────────────────────────┘
```

## 🔧 **Architettura Tecnica**

### Frontend Routes
- `/contacts` - Lista contatti con gestione privacy
- `/contacts/import` - Importazione contatti (coming soon)

### API Routes
- `GET /api/campaign/contacts` - Recupera lista contatti (esistente)
- `PUT /api/campaign/contacts/[id]/preferences` - Aggiorna preferenze privacy (nuovo)

### Backend Routes
- `PUT /api/contacts/:id/preferences` - Gestisce aggiornamento preferenze (nuovo)

## 🔄 **Flusso Privacy Management**

### 1. **Visualizzazione Contatti**
```javascript
const filteredContacts = contacts.filter((contact) => {
  const matchesSearch = contact.name.includes(searchQuery) || 
                       contact.phone.includes(searchQuery)
  const matchesCountry = !selectedCountryCode || contact.countryCode === selectedCountryCode
  const matchesConsent = consentFilter === "all" || 
                        (consentFilter === "opted-in" && contact.marketingConsent) ||
                        (consentFilter === "opted-out" && !contact.marketingConsent)
  
  return matchesSearch && matchesCountry && matchesConsent
})
```

### 2. **Quick Toggle Consent**
```javascript
<Switch
  checked={contact.marketingConsent}
  onCheckedChange={(checked) => updateContactPreferences(contact.id, checked)}
  onClick={(e) => e.stopPropagation()} // Previene apertura dialog
/>
```

### 3. **Update Backend**
```javascript
// Frontend → Backend
PUT /api/contacts/${contactId}/preferences
Body: { marketingConsent: boolean }

// Backend processing
if (marketingConsent === false) {
  await contact.optOut('admin_action'); // Usa metodo esistente del model
} else {
  contact.marketingConsent = true;
  contact.optOutDate = undefined;
  contact.optOutReason = undefined;
}
```

## 📊 **Stati Consenso**

### ✅ **Con Consenso** (`marketingConsent: true`)
- Badge verde: "✅ Consenso" 
- Può ricevere campagne marketing
- Switch attivo

### ❌ **Opt-out** (`marketingConsent: false`)  
- Badge rosso: "❌ Opt-out"
- NON riceve campagne marketing
- Switch disattivo
- Mostra data e motivo opt-out

## 🚀 **Navigazione App**

### Nuovi Percorsi di Navigazione
```
Dashboard → Campagne → [Rubrica] [Crea Campagna]
                   ↓
                Rubrica Contatti → Dialog Privacy
                   ↓
                Importa Contatti (coming soon)
```

### Pulsanti Fixed Bottom
```
[📋 Rubrica]  [📧 Crea Campagna]
```

## ✅ **Vantaggi per l'Utente**

- 🔍 **Ricerca Avanzata**: Trova rapidamente qualsiasi contatto
- 📊 **Overview Statistiche**: Visualizza stato della rubrica a colpo d'occhio  
- ⚡ **Gestione Rapida**: Toggle consenso senza aprire dialog
- 🔒 **Privacy Compliant**: Gestione granulare del consenso marketing
- 📱 **Mobile Optimized**: Design pensato per mobile-first
- 🔄 **Real-time Updates**: Aggiornamenti immediati senza refresh

## 📁 **Files Creati/Modificati**

### Nuovi Files
1. `app/contacts/page.tsx` - Pagina rubrica contatti
2. `app/contacts/import/page.tsx` - Pagina import (placeholder)
3. `app/api/campaign/contacts/[id]/preferences/route.ts` - API preferences

### Files Modificati  
1. `app/campaign/page.tsx` - Aggiunto pulsante Rubrica
2. `routes/contacts.js` - Implementato endpoint preferences

**La gestione contatti è ora completa e pronta per l'uso!** 🎉 