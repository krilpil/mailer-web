import { Editor } from '@tiptap/react';

import { FocusableBlock } from '../model/editorPositionMenu.types';

const getEditorView = (editor: Editor) => {
  try {
    return editor.view;
  } catch {
    return null;
  }
};

export const getDocPosFromMouseEvent = (editor: Editor, event: MouseEvent): number | null => {
  if (editor.isDestroyed) return null;

  const view = getEditorView(editor);
  if (!view) return null;

  const editorRect = view.dom.getBoundingClientRect();
  const x = Math.min(Math.max(event.clientX, editorRect.left + 2), editorRect.right - 2);
  const y = Math.min(Math.max(event.clientY, editorRect.top + 2), editorRect.bottom - 2);

  const coords = view.posAtCoords({ left: x, top: y });
  if (!coords) return null;

  return coords.inside >= 0 ? coords.inside : coords.pos;
};

export const findFocusableBlockAtDocPos = (
  editor: Editor,
  docPos: number
): FocusableBlock | null => {
  const { doc } = editor.state;
  if (docPos < 0 || docPos > doc.content.size) return null;

  const $pos = doc.resolve(docPos);

  for (let depth = $pos.depth; depth > 0; depth -= 1) {
    const nodeAtDepth = $pos.node(depth);
    if (!nodeAtDepth.isBlock) continue;

    if (nodeAtDepth.isTextblock || nodeAtDepth.isAtom || nodeAtDepth.isLeaf) {
      return { node: nodeAtDepth, pos: $pos.before(depth) };
    }
  }

  if ($pos.depth === 0) {
    if ($pos.nodeAfter?.isBlock) return { node: $pos.nodeAfter, pos: $pos.pos };

    if ($pos.nodeBefore?.isBlock) {
      return { node: $pos.nodeBefore, pos: $pos.pos - $pos.nodeBefore.nodeSize };
    }
  }

  return null;
};

export const getNodeDomAtDocPos = (editor: Editor, docPos: number): HTMLElement | null => {
  const view = getEditorView(editor);
  if (!view) return null;

  return view.nodeDOM(docPos) as HTMLElement | null;
};

export const isBlockNonEmpty = (block: FocusableBlock): boolean => {
  const { node } = block;
  return node.isAtom || node.isLeaf || node.textContent.trim().length > 0;
};

export const focusBlockInEditor = (editor: Editor, block: FocusableBlock) => {
  const { node, pos } = block;
  const docMaxPos = editor.state.doc.content.size;

  if (node.isAtom || node.isLeaf) {
    editor.chain().setNodeSelection(Math.min(pos, docMaxPos)).focus().run();
    return;
  }

  editor
    .chain()
    .setTextSelection(Math.min(pos + 1, docMaxPos))
    .focus()
    .run();
};
