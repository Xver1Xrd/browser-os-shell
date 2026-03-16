import { fireEvent, render, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TextEditorApp from '@/features/editor/TextEditorApp'
import { fsService } from '@/features/filesystem/fsService'
import { resetDatabase } from '@/lib/db'

const noop = () => {}

vi.mock('@/app/providers', () => ({
  useNotifyError: () => noop,
  useNotifySuccess: () => noop,
}))

describe('Editor integration', () => {
  beforeEach(async () => {
    await resetDatabase()
    fsService.resetForTests()
    await fsService.init()
  })

  it('edits and saves file back to VFS', async () => {
    const docs = await fsService.resolvePath('/Documents')
    const file = await fsService.createTextFile(docs.id, 'edit-me.txt', 'before')

    const { getByTestId } = render(
      <TextEditorApp launchParams={{ nodeId: file.id }} windowId="editor-window" />,
    )

    const editor = getByTestId('editor-app')
    const textarea = await within(editor).findByRole('textbox')
    await userEvent.click(textarea)
    await userEvent.type(textarea, 'after save')
    expect(textarea).toHaveValue('beforeafter save')

    await userEvent.click(within(editor).getByRole('button', { name: 'Save' }))

    await waitFor(async () => {
      const updated = await fsService.readTextFile(file.id)
      expect(updated).toBe('beforeafter save')
    })
  })

  it('creates a new file when saving untitled content', async () => {
    vi.spyOn(window, 'prompt').mockReturnValue('new-file.txt')

    const { getByTestId } = render(<TextEditorApp windowId="editor-window" />)

    const editor = getByTestId('editor-app')
    const textarea = await within(editor).findByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'new file content' } })

    await userEvent.click(within(editor).getByRole('button', { name: 'Save' }))

    await waitFor(async () => {
      const created = await fsService.resolvePath('/new-file.txt')
      expect(created.kind).toBe('file')
    })
  })
})
