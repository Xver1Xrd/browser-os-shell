self.onmessage = async (event: MessageEvent<{ type: 'textPreview'; data: ArrayBuffer }>) => {
  if (event.data.type !== 'textPreview') {
    return
  }

  const decoder = new TextDecoder()
  const preview = decoder.decode(event.data.data.slice(0, 2048))
  const sanitized = preview.replaceAll('\u0000', '')
  self.postMessage({ preview: sanitized })
}

export {}
