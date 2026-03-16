export function textToArrayBuffer(text: string): ArrayBuffer {
  return new TextEncoder().encode(text).buffer
}

export function arrayBufferToText(data: ArrayBuffer): string {
  return new TextDecoder().decode(data)
}

export function arrayBufferToBlob(data: ArrayBuffer, mimeType = 'application/octet-stream'): Blob {
  return new Blob([data], { type: mimeType })
}

export function getExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop()?.toLowerCase() ?? '' : ''
}

export function withUniqueName(baseName: string, exists: (candidate: string) => boolean): string {
  if (!exists(baseName)) {
    return baseName
  }

  const extension = getExtension(baseName)
  const rawName = extension ? baseName.slice(0, -(extension.length + 1)) : baseName

  for (let index = 1; index < 1000; index += 1) {
    const candidate = extension
      ? `${rawName} (${index}).${extension}`
      : `${rawName} (${index})`

    if (!exists(candidate)) {
      return candidate
    }
  }

  return `${rawName}-${Date.now()}${extension ? `.${extension}` : ''}`
}
