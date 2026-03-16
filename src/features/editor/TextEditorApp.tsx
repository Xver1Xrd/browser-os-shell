import { useEffect, useMemo, useState } from 'react'

import { useNotifyError, useNotifySuccess } from '@/app/providers'
import { fsService } from '@/features/filesystem/fsService'
import { ROOT_DIRECTORY_ID, type FSNode } from '@/types/fs'
import type { AppRuntimeProps } from '@/types/app'

export default function TextEditorApp({ launchParams }: AppRuntimeProps) {
  const notifyError = useNotifyError('Editor error')
  const notifySuccess = useNotifySuccess('Editor')

  const [node, setNode] = useState<FSNode | null>(null)
  const [text, setText] = useState('')
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    let disposed = false

    const load = async () => {
      if (!launchParams?.nodeId) {
        setNode(null)
        setText('')
        setDirty(false)
        return
      }

      const fileNode = await fsService.getNode(launchParams.nodeId)
      if (fileNode.kind !== 'file') {
        throw new Error('Selected node is not a file')
      }

      const content = await fsService.readTextFile(fileNode.id)
      if (!disposed) {
        setNode(fileNode)
        setText(content)
        setDirty(false)
      }
    }

    void load().catch(notifyError)

    return () => {
      disposed = true
    }
  }, [launchParams?.nodeId, notifyError])

  const currentName = node?.name ?? 'Untitled.txt'

  const stats = useMemo(() => {
    const lines = text.split('\n').length
    const chars = text.length
    return `${lines} lines, ${chars} chars`
  }, [text])

  const save = async () => {
    if (node) {
      await fsService.writeFile(node.id, new TextEncoder().encode(text).buffer, node.mimeType ?? 'text/plain')
      setDirty(false)
      notifySuccess(`Saved ${node.name}`)
      return
    }

    const name = prompt('New file name', 'Untitled.txt')
    if (!name) {
      return
    }

    const created = await fsService.createTextFile(ROOT_DIRECTORY_ID, name, text)
    setNode(created)
    setDirty(false)
    notifySuccess(`Created ${created.name}`)
  }

  const saveAs = async () => {
    const name = prompt('Save as', currentName)
    if (!name) {
      return
    }

    const targetParent = node?.parentId ?? ROOT_DIRECTORY_ID
    const created = await fsService.createTextFile(targetParent, name, text)
    setNode(created)
    setDirty(false)
    notifySuccess(`Saved as ${created.name}`)
  }

  const newFile = async () => {
    if (dirty && !confirm('Discard unsaved changes?')) {
      return
    }

    setNode(null)
    setText('')
    setDirty(false)
  }

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100" data-testid="editor-app">
      <div className="flex items-center gap-2 border-b border-white/10 bg-black/30 px-3 py-2 text-xs">
        <span className="rounded border border-white/20 px-2 py-1">{currentName}</span>
        <span className="text-slate-400">{stats}</span>
        {dirty ? <span className="text-amber-300">Unsaved changes</span> : <span className="text-emerald-300">Saved</span>}
        <button
          className="ml-auto rounded border border-white/20 bg-white/10 px-2 py-1 hover:bg-white/20"
          onClick={() => void newFile().catch(notifyError)}
          type="button"
        >
          New
        </button>
        <button
          className="rounded border border-white/20 bg-white/10 px-2 py-1 hover:bg-white/20"
          onClick={() => void saveAs().catch(notifyError)}
          type="button"
        >
          Save As
        </button>
        <button
          className="rounded border border-shell-accent/80 bg-shell-accent/30 px-2 py-1 hover:bg-shell-accent/45"
          onClick={() => void save().catch(notifyError)}
          type="button"
        >
          Save
        </button>
      </div>

      <textarea
        className="h-full w-full flex-1 resize-none bg-transparent p-3 font-mono text-sm text-slate-100 outline-none"
        onChange={(event) => {
          setText(event.target.value)
          setDirty(true)
        }}
        placeholder="Type your text..."
        spellCheck={false}
        value={text}
      />
    </div>
  )
}
