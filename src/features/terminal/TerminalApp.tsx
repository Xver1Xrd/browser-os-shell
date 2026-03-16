import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'

import { fsService } from '@/features/filesystem/fsService'
import { ROOT_DIRECTORY_ID } from '@/types/fs'
import type { AppRuntimeProps } from '@/types/app'

import { executeTerminalCommand, getPrompt } from './terminalCommands'

type TerminalLine = {
  id: string
  type: 'command' | 'output' | 'error'
  value: string
}

export default function TerminalApp({ launchParams }: AppRuntimeProps) {
  const [cwdId, setCwdId] = useState(ROOT_DIRECTORY_ID)
  const [cwdPath, setCwdPath] = useState('/')
  const [input, setInput] = useState('')
  const [lines, setLines] = useState<TerminalLine[]>([])
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      if (!launchParams?.nodeId) {
        return
      }

      const node = await fsService.getNode(launchParams.nodeId)
      if (!mounted) {
        return
      }

      if (node.kind === 'directory') {
        setCwdId(node.id)
      }
    }

    void init()

    return () => {
      mounted = false
    }
  }, [launchParams?.nodeId])

  useEffect(() => {
    void fsService.getPath(cwdId).then((path) => setCwdPath(path))
  }, [cwdId])

  useEffect(() => {
    if (!scrollRef.current) {
      return
    }

    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [lines])

  const prompt = useMemo(() => getPrompt(cwdPath), [cwdPath])

  const runCommand = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const commandText = input.trim()
    if (!commandText) {
      return
    }

    setInput('')
    setLines((state) => [
      ...state,
      {
        id: `${Date.now()}-cmd`,
        type: 'command',
        value: `${prompt} ${commandText}`,
      },
    ])

    try {
      const result = await executeTerminalCommand(commandText, { cwdId })

      if (result.clear) {
        setLines([])
      }

      if (result.cwdId) {
        setCwdId(result.cwdId)
      }

      const output = result.output
      if (typeof output === 'string') {
        setLines((state) => [
          ...state,
          {
            id: `${Date.now()}-output`,
            type: 'output',
            value: output,
          },
        ])
      }
    } catch (error) {
      setLines((state) => [
        ...state,
        {
          id: `${Date.now()}-error`,
          type: 'error',
          value: error instanceof Error ? error.message : 'Unknown command error',
        },
      ])
    }
  }

  return (
    <div className="flex h-full flex-col bg-[#0a0f1f] font-mono text-xs text-slate-100" data-testid="terminal-app">
      <div className="flex-1 space-y-1 overflow-y-auto p-3" ref={scrollRef}>
        <p className="text-slate-400">Type `help` to see commands.</p>
        {lines.map((line) => (
          <pre
            className={`whitespace-pre-wrap ${line.type === 'error' ? 'text-red-300' : line.type === 'command' ? 'text-cyan-300' : 'text-slate-100'}`}
            key={line.id}
          >
            {line.value}
          </pre>
        ))}
      </div>

      <form className="border-t border-white/10 p-2" onSubmit={runCommand}>
        <label className="flex items-center gap-2">
          <span className="text-cyan-300">{prompt}</span>
          <input
            className="min-w-0 flex-1 bg-transparent text-slate-100 outline-none placeholder:text-slate-500"
            onChange={(event) => setInput(event.target.value)}
            placeholder="Enter command"
            spellCheck={false}
            value={input}
          />
        </label>
      </form>
    </div>
  )
}
