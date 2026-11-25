# Tomodachi Studio Online

Un piccolo studio 3D nel browser per creare personaggi, salvarli e condividerli. Realizzato con TypeScript, Three.js, Vite e PeerJS, senza un server applicativo dedicato.

## Avvio in locale

```bash
npm install
npm run dev
```

Per verificare la versione di produzione:

```bash
npm run typecheck
npm run build
npm run preview
```

## Cosa puoi fare

- Personalizzare viso, capelli, copricapo, vestiti, accessori, proporzioni e personalità.
- Inventare personaggi con suggerimenti automatici offline; facoltativamente aggiungere una chiave Gemini nelle impostazioni.
- Cambiare tra sei scenari, ruotare la visuale e interagire con oggetti e personaggio.
- Salvare fino a 12 personaggi, duplicarli, esportarli o importarli come JSON.
- Copiare un link per condividere un personaggio o creare/entrare in una stanza multiplayer dal codice.
- Regolare grafica, audio e controlli della telecamera.

## Note

I salvataggi e le impostazioni restano nel browser in cui vengono creati. Le stanze multiplayer usano PeerJS e WebRTC: per connettere due persone occorre che entrambi i browser possano raggiungere il servizio di signaling PeerJS e stabilire una connessione WebRTC. Gemini è facoltativo; la chiave viene salvata nelle impostazioni locali del browser.

Il deploy GitHub Pages è configurato tramite GitHub Actions sul branch `main`.
