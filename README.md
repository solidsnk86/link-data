# LinkData

Una web para dos cosas:

- **Transmitir en vivo** la cámara de tu PC con un link (`/stream` → genera `/watch/[código]`)
- **Compartir un archivo** con un link de descarga, estilo WeTransfer (`/transfer` → genera `/d/[id]`)

## Cómo funciona

- **Streaming**: WebRTC puro vía [PeerJS](https://peerjs.com), usando su servidor de señalización
  público y gratuito. El video viaja directo entre los navegadores (peer-to-peer); este servidor
  nunca recibe ni reenvía el video. Funciona bien para pocos espectadores a la vez (uso personal,
  demos, llamadas pequeñas). Para audiencias grandes necesitarías un SFU dedicado (LiveKit, Mux,
  Agora, etc.) — eso es un cambio de arquitectura, no solo de código.
- **Transferencia de archivos**: subida directa del navegador a [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
  (sin pasar por una función serverless, así que no hay límite de tamaño de payload). El link de
  descarga no es permanente, al descargar el archivo, automáticamente se elimina el archivo y por ende el link queda obsoleto.

## Configuración local

```bash
pnpm install
cp .env .env.local
```

Necesitas un **Blob Store** de Vercel para que la subida de archivos funcione (el streaming no
necesita esto, no usa Vercel Blob):

1. En tu proyecto de Vercel → **Storage** → **Create Database** → **Blob**.
2. Copia el `BLOB_READ_WRITE_TOKEN` que te da y pégalo en `.env.local` o `.env`.

```bash
pnpm run dev
```

Abre `http://localhost:3000`.

## Desplegar en Vercel

```bash
npx vercel
```

Conecta el Blob Store desde el dashboard de tu proyecto en Vercel (Storage → Connect Store) —
así el token se inyecta solo, sin que tengas que configurar nada a mano en producción.

## Estructura

```
src/app/
  page.tsx                  → home
  stream/page.tsx           → transmisor (pide cámara, genera código de sala)
  watch/[roomId]/page.tsx   → espectador (se conecta al código de sala)
  transfer/page.tsx         → subida de archivo (drag & drop)
  d/[fileId]/page.tsx       → página de descarga
  api/upload/route.ts       → emite tokens de subida para Vercel Blob
  api/file/[fileId]/route.ts→ resuelve un fileId a su archivo (metadata + borrado)
src/components/             → PulseSignature, StatusDot, CopyLink
src/lib/                    → generación de códigos/ids, formato de tamaños
```

## Limitaciones conocidas

- El streaming depende del servidor público de PeerJS — para producción seria, considera correr
  tu propio [PeerServer](https://github.com/peers/peerjs-server) o migrar a un SFU.
- No hay autenticación ni límite de quién puede ver un stream o descargar un archivo: cualquiera
  con el link puede entrar. Suficiente para compartir entre amigos/equipo, no para datos sensibles.
- El archivo expiran ni bien el usuario descarga del link.
