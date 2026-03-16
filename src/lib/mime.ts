const TEXT_MIME_PREFIXES = ['text/', 'application/json', 'application/xml']

export function guessMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() ?? ''

  switch (ext) {
    case 'txt':
    case 'md':
    case 'log':
      return 'text/plain'
    case 'json':
      return 'application/json'
    case 'js':
    case 'ts':
    case 'tsx':
    case 'jsx':
    case 'css':
    case 'html':
      return 'text/plain'
    case 'png':
      return 'image/png'
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg'
    case 'gif':
      return 'image/gif'
    case 'webp':
      return 'image/webp'
    case 'svg':
      return 'image/svg+xml'
    default:
      return 'application/octet-stream'
  }
}

export function isTextMimeType(mimeType: string | null): boolean {
  if (!mimeType) {
    return false
  }

  return TEXT_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix))
}

export function isImageMimeType(mimeType: string | null): boolean {
  if (!mimeType) {
    return false
  }

  return mimeType.startsWith('image/')
}
