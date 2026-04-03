import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { JSONContent } from '@tiptap/core';
import type { ReactNode } from 'react';

import {
  blockquoteStyle,
  containerStyle,
  contentSectionStyle,
  headingStyle,
  headingStyles,
  horizontalRuleStyle,
  imageSectionStyle,
  imageStyle,
  inlineCodeStyle,
  linkStyle,
  listItemStyle,
  mainStyle,
  nestedListSectionStyle,
  paragraphStyle,
  preformattedStyle,
} from './emailTemplate.styles';

export type EmailTemplateProps = {
  title: string;
  content: JSONContent;
};

type ListType = 'bullet' | 'ordered';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const getStringAttr = (node: JSONContent, attrName: string): string | undefined => {
  if (!isObject(node.attrs)) return undefined;

  const value = node.attrs[attrName];
  return typeof value === 'string' ? value : undefined;
};

const getNumberAttr = (node: JSONContent, attrName: string): number | undefined => {
  if (!isObject(node.attrs)) return undefined;

  const value = node.attrs[attrName];
  return typeof value === 'number' ? value : undefined;
};

const getNodeContent = (node: JSONContent): JSONContent[] => node.content ?? [];

const hasVisibleInlineNodes = (nodes: JSONContent[]): boolean =>
  nodes.some((node) => node.type === 'hardBreak' || Boolean(node.text));

const extractPlainText = (nodes: JSONContent[]): string =>
  nodes
    .map((node) => {
      if (node.type === 'text') return node.text ?? '';
      if (node.type === 'hardBreak') return '\n';

      const nestedContent = getNodeContent(node);
      if (!nestedContent.length) return '';

      return extractPlainText(nestedContent);
    })
    .join('');

const applyMarks = (textNode: JSONContent, key: string): ReactNode => {
  const baseText = textNode.text ?? '';
  const marks = textNode.marks ?? [];

  return marks.reduce<ReactNode>((acc, mark, index) => {
    const markKey = `${key}-mark-${mark.type}-${index}`;

    if (mark.type === 'bold') return <strong key={markKey}>{acc}</strong>;
    if (mark.type === 'italic') return <em key={markKey}>{acc}</em>;
    if (mark.type === 'underline')
      return (
        <span key={markKey} style={{ textDecoration: 'underline' }}>
          {acc}
        </span>
      );
    if (mark.type === 'strike')
      return (
        <span key={markKey} style={{ textDecoration: 'line-through' }}>
          {acc}
        </span>
      );
    if (mark.type === 'code')
      return (
        <span key={markKey} style={inlineCodeStyle}>
          {acc}
        </span>
      );
    if (mark.type === 'link') {
      const href =
        isObject(mark.attrs) && typeof mark.attrs.href === 'string' ? mark.attrs.href : '';
      const target =
        isObject(mark.attrs) && typeof mark.attrs.target === 'string'
          ? mark.attrs.target
          : undefined;

      if (!href) return acc;

      return (
        <Link key={markKey} href={href} target={target} style={linkStyle}>
          {acc}
        </Link>
      );
    }

    return acc;
  }, baseText);
};

const renderInlineNodes = (nodes: JSONContent[], keyPrefix: string): ReactNode[] =>
  nodes.map((node, index) => {
    const key = `${keyPrefix}-inline-${index}`;

    if (node.type === 'text') {
      return <span key={key}>{applyMarks(node, key)}</span>;
    }

    if (node.type === 'hardBreak') {
      return <br key={key} />;
    }

    if (node.type === 'image') {
      const src = getStringAttr(node, 'src');
      if (!src) return null;

      const alt = getStringAttr(node, 'alt') || 'изображение';

      return <Img key={key} src={src} alt={alt} style={imageStyle} />;
    }

    const nestedContent = getNodeContent(node);
    if (!nestedContent.length) return null;

    return <span key={key}>{renderInlineNodes(nestedContent, key)}</span>;
  });

const renderListItem = (
  node: JSONContent,
  index: number,
  listType: ListType,
  keyPrefix: string,
  orderedStart = 1
): ReactNode => {
  const key = `${keyPrefix}-item-${index}`;
  const marker = listType === 'bullet' ? '\u2022' : `${orderedStart + index}.`;
  const itemChildren = getNodeContent(node);

  if (!itemChildren.length) {
    return (
      <Text key={key} style={listItemStyle}>
        {marker}
      </Text>
    );
  }

  const firstParagraphIndex = itemChildren.findIndex((child) => child.type === 'paragraph');
  const primaryInlineNodes =
    firstParagraphIndex >= 0
      ? getNodeContent(itemChildren[firstParagraphIndex])
      : getNodeContent(node);
  const nestedNodes =
    firstParagraphIndex >= 0
      ? itemChildren.filter((_, childIndex) => childIndex !== firstParagraphIndex)
      : [];

  return (
    <Section key={key}>
      <Text style={listItemStyle}>
        {marker} {renderInlineNodes(primaryInlineNodes, key)}
      </Text>
      {nestedNodes.length ? (
        <Section style={nestedListSectionStyle}>{renderBlockNodes(nestedNodes, key)}</Section>
      ) : null}
    </Section>
  );
};

const renderBlockNode = (node: JSONContent, key: string): ReactNode => {
  const nodeContent = getNodeContent(node);

  if (node.type === 'paragraph') {
    if (!hasVisibleInlineNodes(nodeContent)) {
      return (
        <Text key={key} style={paragraphStyle}>
          &nbsp;
        </Text>
      );
    }

    return (
      <Text key={key} style={paragraphStyle}>
        {renderInlineNodes(nodeContent, key)}
      </Text>
    );
  }

  if (node.type === 'heading') {
    const levelRaw = getNumberAttr(node, 'level') ?? 2;
    const level = Math.max(1, Math.min(6, levelRaw)) as 1 | 2 | 3 | 4 | 5 | 6;
    const headingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

    return (
      <Heading key={key} as={headingTag} style={headingStyles[level]}>
        {renderInlineNodes(nodeContent, key)}
      </Heading>
    );
  }

  if (node.type === 'bulletList') {
    return (
      <Section key={key}>
        {nodeContent.map((listItemNode, index) =>
          renderListItem(listItemNode, index, 'bullet', key)
        )}
      </Section>
    );
  }

  if (node.type === 'orderedList') {
    const start = getNumberAttr(node, 'start') ?? 1;

    return (
      <Section key={key}>
        {nodeContent.map((listItemNode, index) =>
          renderListItem(listItemNode, index, 'ordered', key, start)
        )}
      </Section>
    );
  }

  if (node.type === 'listItem') {
    return renderListItem(node, 0, 'bullet', key);
  }

  if (node.type === 'image') {
    const src = getStringAttr(node, 'src');
    if (!src) return null;

    const alt = getStringAttr(node, 'alt') || 'изображение';

    return (
      <Section key={key} style={imageSectionStyle}>
        <Img src={src} alt={alt} style={imageStyle} />
      </Section>
    );
  }

  if (node.type === 'horizontalRule') {
    return <Hr key={key} style={horizontalRuleStyle} />;
  }

  if (node.type === 'codeBlock') {
    const code = extractPlainText(nodeContent);

    return (
      <Text key={key} style={preformattedStyle}>
        {code}
      </Text>
    );
  }

  if (node.type === 'blockquote') {
    return (
      <Text key={key} style={blockquoteStyle}>
        {renderInlineNodes(nodeContent, key)}
      </Text>
    );
  }

  if (node.type === 'doc') {
    return <Section key={key}>{renderBlockNodes(nodeContent, key)}</Section>;
  }

  if (nodeContent.length) {
    return <Section key={key}>{renderBlockNodes(nodeContent, key)}</Section>;
  }

  return null;
};

const renderBlockNodes = (nodes: JSONContent[], keyPrefix: string): ReactNode[] =>
  nodes.map((node, index) => renderBlockNode(node, `${keyPrefix}-block-${index}`));

export const EmailTemplate = ({ title, content }: EmailTemplateProps) => {
  const contentNodes = getNodeContent(content);
  const renderedContent = renderBlockNodes(contentNodes, 'root');

  return (
    <Html>
      <Head />
      <Preview>{title}</Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>{title}</Heading>
          <Section style={contentSectionStyle}>
            {renderedContent.length ? (
              renderedContent
            ) : (
              <Text style={paragraphStyle}>Пустое письмо.</Text>
            )}
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
