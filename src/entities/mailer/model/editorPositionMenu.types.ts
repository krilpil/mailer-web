import { Editor } from '@tiptap/core';
import { Node } from '@tiptap/pm/model';

export interface EditorPositionMenuProps {
  editor: Editor | null;
}

export type FocusableBlock = {
  node: Node;
  pos: number;
};
