import { useEffect, useMemo, useState } from 'react'

import { fsService } from '@/features/filesystem/fsService'
import { arrayBufferToBlob } from '@/lib/fileUtils'
import { isImageMimeType, isTextMimeType } from '@/lib/mime'
import { formatDateTime } from '@/lib/time'
import type { FSNode } from '@/types/fs'

type PreviewPaneProps = {
  selectedNode: FSNode | null
}

export function PreviewPane({ selectedNode }: PreviewPaneProps) {
  const [textPreview, setTextPreview] = useState<string>('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)

  useEffect(() => {
    setTextPreview('')

    if (!selectedNode || selectedNode.kind === 'directory') {
      setImageUrl(null)
      return
    }

    let revokedUrl: string | null = null

    const loadPreview = async () => {
      const fileData = await fsService.readFile(selectedNode.id)
      if (isTextMimeType(selectedNode.mimeType)) {
        const preview = new TextDecoder().decode(fileData.slice(0, 2048))
        setTextPreview(preview)
      }

      if (isImageMimeType(selectedNode.mimeType)) {
        const blob = arrayBufferToBlob(fileData, selectedNode.mimeType ?? 'image/*')
        const url = URL.createObjectURL(blob)
        revokedUrl = url
        setImageUrl(url)
      }
    }

    void loadPreview()

    return () => {
      if (revokedUrl) {
        URL.revokeObjectURL(revokedUrl)
      }
    }
  }, [selectedNode])

  const metadata = useMemo(() => {
    if (!selectedNode) {
      return []
    }

    return [
      ['Name', selectedNode.name],
      ['Type', selectedNode.kind === 'directory' ? 'Folder' : selectedNode.mimeType ?? 'File'],
      ['Size', selectedNode.kind === 'file' ? `${selectedNode.size} bytes` : '-'],
      ['Updated', formatDateTime(selectedNode.updatedAt)],
    ]
  }, [selectedNode])

  return (
    <aside className="w-64 shrink-0 border-l border-white/10 bg-black/20 p-2">
      <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Preview</p>

      {!selectedNode ? (
        <p className="text-xs text-slate-400">Select a file or folder.</p>
      ) : (
        <div className="space-y-2">
          <div className="rounded-md border border-white/15 bg-black/20 p-2 text-xs text-slate-300">
            {metadata.map(([label, value]) => (
              <p className="mb-1" key={label}>
                <span className="text-slate-500">{label}: </span>
                <span>{value}</span>
              </p>
            ))}
          </div>

          {selectedNode.kind === 'file' && isImageMimeType(selectedNode.mimeType) && imageUrl ? (
            <img alt={selectedNode.name} className="max-h-48 w-full rounded-md object-contain" src={imageUrl} />
          ) : null}

          {selectedNode.kind === 'file' && isTextMimeType(selectedNode.mimeType) ? (
            <pre className="max-h-48 overflow-auto rounded-md border border-white/15 bg-black/30 p-2 text-xs text-slate-200">
              {textPreview}
            </pre>
          ) : null}
        </div>
      )}
    </aside>
  )
}
