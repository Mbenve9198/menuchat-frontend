# Frontend - Gestione Fallimenti Campagne

## 🎯 Modifiche Implementate

### 1. **Aggiornamento Interface Campaign**
```typescript
interface Campaign {
  // ... campi esistenti
  statistics?: {
    sentCount?: number
    deliveredCount?: number
    readCount?: number
    failedCount?: number
    failureDetails?: Array<{
      phoneNumber: string
      error: string
      errorCode?: string
      timestamp: string
    }>
  }
}
```

### 2. **Aggiornamento Badge Status**
#### Prima:
```tsx
case "completed":
  return <Badge className="bg-green-100">✅ Completata</Badge>
```

#### Dopo:
```tsx
case "completed":
  const hasFailures = campaign?.statistics?.failedCount && campaign.statistics.failedCount > 0;
  return (
    <Badge className={hasFailures 
      ? "bg-orange-100 text-orange-800"    // 🟠 Arancione per fallimenti parziali
      : "bg-green-100 text-green-800"      // 🟢 Verde per successo totale
    }>
      <span>{hasFailures ? "⚠️" : "✅"}</span> 
      Completata
      {hasFailures && <span>({campaign.statistics.failedCount} falliti)</span>}
    </Badge>
  )
```

### 3. **Aggiornamento Data Transformation**
```typescript
const transformedCampaigns: Campaign[] = data.data.map((campaign: any) => ({
  // ... campi esistenti
  statistics: {
    sentCount: campaign.statistics?.sentCount || 0,
    deliveredCount: campaign.statistics?.deliveredCount || 0,
    readCount: campaign.statistics?.readCount || 0,
    failedCount: campaign.statistics?.failedCount || 0,
    failureDetails: campaign.statistics?.failureDetails || []
  }
}))
```

## 📱 **Risultato Visivo**

### Campagna Completata (Successo Totale)
```
✅ Completata
```
- Badge verde
- Nessun indicatore di fallimento

### Campagna Completata (Fallimenti Parziali)  
```
⚠️ Completata (3 falliti)
```
- Badge arancione
- Numero di fallimenti mostrato
- Icona di warning

### Campagna Fallita (Tutti Falliti)
```
❌ Fallita
```
- Badge rosso
- Indica fallimento totale

## 📁 **Files Modificati**

1. `app/campaign/page.tsx` - Lista campagne desktop
2. `mobile-build/app/campaign/page.tsx` - Lista campagne mobile
3. `app/campaign/[id]/page.tsx` - Pagina dettaglio (da aggiornare)

## 🔄 **Flusso Dati**

1. **Backend** → Salva `failureDetails` in `campaign.statistics`
2. **Frontend API** → Recupera dati con statistiche
3. **Transform** → Mappa statistiche nell'interface Campaign
4. **Badge** → Mostra stato visivo basato su `failedCount`
5. **Dettagli** → `failureDetails[]` disponibili per visualizzazione

## ✅ **Prossimi Passi**

- [ ] Aggiornare pagina dettaglio campagna per mostrare lista fallimenti
- [ ] Aggiungere tooltip con dettagli degli errori
- [ ] Implementare filtro per campagne con fallimenti parziali
- [ ] Aggiungere export dei dettagli fallimenti 