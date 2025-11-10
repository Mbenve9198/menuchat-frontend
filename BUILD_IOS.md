# 📱 Guida Build App iOS - MenuChat

## Prerequisiti

1. **Xcode** (dall'App Store)
2. **CocoaPods**: `sudo gem install cocoapods`
3. **Node.js** e npm
4. Account Apple Developer (per testare su dispositivo reale)

## Comandi per Build iOS

### 1️⃣ Installa le Dipendenze (una sola volta)

```bash
cd /Users/marcobenvenuti/Documents/menuchat/menuchat-frontend-master
npm install
```

### 2️⃣ Build del Progetto Next.js + Sync Capacitor

```bash
npm run build:mobile
```

Questo comando:
- Crea il build statico di Next.js nella cartella `/out`
- Sincronizza i file con il progetto iOS
- Copia tutti gli asset necessari

### 3️⃣ Installa le Dipendenze iOS (CocoaPods)

```bash
cd ios/App
pod install
cd ../..
```

### 4️⃣ Apri il Progetto in Xcode

```bash
npm run ios:open
```

Oppure manualmente:
```bash
open ios/App/App.xcworkspace
```

⚠️ **IMPORTANTE**: Apri sempre il file `.xcworkspace` e NON il file `.xcodeproj`

## Testare l'App

### Su Simulatore iOS:
1. Apri Xcode
2. Seleziona un simulatore dal menu (es. iPhone 15 Pro)
3. Premi ▶️ (Run) o `Cmd + R`

### Su Dispositivo Reale:
1. Collega il tuo iPhone al Mac
2. Seleziona il tuo dispositivo in Xcode
3. Vai su "Signing & Capabilities"
4. Seleziona il tuo Team Apple Developer
5. Premi ▶️ (Run)

## Comandi Utili

### Ricostruire e Sincronizzare
```bash
npm run build:mobile
```

### Solo Sincronizzare (dopo modifiche ai plugin)
```bash
npm run ios:sync
```

### Eseguire direttamente su simulatore/dispositivo
```bash
npm run ios:run
```

## Problemi Comuni

### ❌ "Pod install" fallisce
```bash
cd ios/App
pod repo update
pod install --repo-update
```

### ❌ Build fallisce in Xcode
1. Product → Clean Build Folder (`Cmd + Shift + K`)
2. Chiudi Xcode
3. Elimina `ios/App/Pods` e `ios/App/Podfile.lock`
4. Riesegui `pod install`

### ❌ "derivedData" errori
```bash
rm -rf ~/Library/Developer/Xcode/DerivedData
```

### ❌ Modifiche al codice non si vedono
Devi sempre rifare il build:
```bash
npm run build:mobile
```

## Workflow Tipico di Sviluppo

1. Fai modifiche al codice React/Next.js
2. Esegui: `npm run build:mobile`
3. L'app in Xcode si aggiorna automaticamente (o premi Run)
4. Testa nell'app iOS

## Note Importanti

- **API Routes**: Next.js API routes non funzionano in modalità statica. Assicurati che l'app punti al backend remoto.
- **Environment Variables**: Crea un file `.env.local` con le variabili necessarie
- **Icone e Splash Screen**: Modifica gli asset in `ios/App/App/Assets.xcassets/`

## Pubblicare su App Store

1. Configura il Bundle Identifier in Xcode (es. com.menuchat.app)
2. Configura i certificati di distribuzione
3. Product → Archive
4. Distribuisci tramite App Store Connect

















