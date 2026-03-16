import { useEffect, useState } from 'react'

import { useNotifyError } from '@/app/providers'
import { fsService } from '@/features/filesystem/fsService'
import { arrayBufferToBlob } from '@/lib/fileUtils'
import { formatDateTime } from '@/lib/time'
import type { AppRuntimeProps } from '@/types/app'
import type { FSNode } from '@/types/fs'

export default function ImageViewerApp({ launchParams }: AppRuntimeProps) {
  const notifyError = useNotifyError('Image viewer error')
  const [node, setNode] = useState<FSNode | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    let revokedUrl: string | null = null
    let disposed = false

    const load = async () => {
      if (!launchParams?.nodeId) {
        setNode(null)
        setImageUrl(null)
        return
      }

      const imageNode = await fsService.getNode(launchParams.nodeId)
      if (imageNode.kind !== 'file') {
        throw new Error('Selected node is not a file')
      }

      const data = await fsService.readFile(imageNode.id)
      const blob = arrayBufferToBlob(data, imageNode.mimeType ?? 'image/*')
      const url = URL.createObjectURL(blob)
      revokedUrl = url

      if (!disposed) {
        setNode(imageNode)
        setImageUrl(url)
      }
    }

    void load().catch(notifyError)

    return () => {
      disposed = true
      if (revokedUrl) {
        URL.revokeObjectURL(revokedUrl)
      }
    }
  }, [launchParams?.nodeId, notifyError])

  if (!node || !imageUrl) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-300" data-testid="image-viewer-app">
        Select an image file to preview.
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100" data-testid="image-viewer-app">
      <div className="flex flex-wrap items-center gap-3 border-b border-white/10 bg-black/30 px-3 py-2 text-xs">
        <span className="font-semibold text-slate-100">{node.name}</span>
        <span className="text-slate-400">{node.mimeType}</span>
        <span className="text-slate-400">{node.size} bytes</span>
        <span className="text-slate-400">Updated {formatDateTime(node.updatedAt)}</span>
      </div>

      <div className="flex h-full items-center justify-center overflow-auto p-4">
        <img alt={node.name} className="max-h-full max-w-full rounded-lg border border-white/10 bg-black/20" src={imageUrl} />
      </div>
    </div>
  )
}
