import type { ResizeDirection } from './useWindowResize'

type ResizeHandlesProps = {
  getBindings: (direction: ResizeDirection) => {
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => void
  }
}

const HANDLE_MAP: Array<{ direction: ResizeDirection; className: string }> = [
  { direction: 'right', className: 'right-0 top-4 h-[calc(100%-2rem)] w-1 cursor-ew-resize' },
  { direction: 'left', className: 'left-0 top-4 h-[calc(100%-2rem)] w-1 cursor-ew-resize' },
  { direction: 'bottom', className: 'bottom-0 left-4 h-1 w-[calc(100%-2rem)] cursor-ns-resize' },
  { direction: 'top', className: 'left-4 top-0 h-1 w-[calc(100%-2rem)] cursor-ns-resize' },
  { direction: 'bottom-right', className: 'bottom-0 right-0 h-3 w-3 cursor-nwse-resize' },
  { direction: 'bottom-left', className: 'bottom-0 left-0 h-3 w-3 cursor-nesw-resize' },
  { direction: 'top-right', className: 'right-0 top-0 h-3 w-3 cursor-nesw-resize' },
  { direction: 'top-left', className: 'left-0 top-0 h-3 w-3 cursor-nwse-resize' },
]

export function ResizeHandles({ getBindings }: ResizeHandlesProps) {
  return (
    <>
      {HANDLE_MAP.map((handle) => (
        <div
          className={`absolute z-30 ${handle.className}`}
          data-testid={`resize-${handle.direction}`}
          key={handle.direction}
          role="presentation"
          {...getBindings(handle.direction)}
        />
      ))}
    </>
  )
}
