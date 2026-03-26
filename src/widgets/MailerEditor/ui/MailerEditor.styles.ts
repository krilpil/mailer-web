import styled from 'styled-components';
import { EditorContent } from '@tiptap/react';
import { Input } from 'antd';

export const SMailerEditor = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 32px;
  padding: 0 36px;
  max-width: 728px;
`;

export const SHeading = styled(Input.TextArea).attrs({
  placeholder: 'Заголовок',
  maxLength: 128,
  variant: 'borderless',
  autoSize: {
    minRows: 1,
    maxRows: 3,
  },
})`
  &.ant-input {
    font-family: var(--font-play);
    font-weight: 700;
    color: #3b3b3b;
    min-height: unset;
    padding: 0;
    font-size: 32px;
    border-radius: 0;
    overflow: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export const SEditorContent = styled(EditorContent)`
  & .tiptap {
    display: grid;
    grid-gap: 20px;
    outline: none;
    color: #3b3b3b;
    padding-bottom: 300px;

    white-space: normal;
    overflow-wrap: anywhere;
    word-break: auto-phrase;
    hyphens: auto;

    h2 {
      font-size: 24px;
      font-weight: 600;
    }

    h3 {
      font-size: 20px;
      font-weight: 600;
    }

    ul,
    ol {
      display: grid;
      grid-gap: 8px;
      padding-left: 24px;
    }

    a {
      text-decoration: underline;
      color: #006c4f;
    }

    strong {
      font-size: 14px;
      font-family: var(--font-roboto);
    }

    ul li {
      list-style: disc;
    }

    blockquote {
      padding: 16px;
      border-radius: 12px;
      background-color: #f1f1f1;

      & p {
        padding: 8px;
        border-left: 4px solid #006c4f;
      }
    }

    hr {
      height: 2px;
      width: 100%;
      background-color: #e7e7e7;
    }

    h1.is-empty::before,
    h2.is-empty::before,
    h3.is-empty::before,
    p.is-empty::before {
      color: #adb5bd;
      content: attr(data-placeholder);
      float: left;
      height: 0;
      pointer-events: none;
    }
  }
`;
