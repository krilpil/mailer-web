import type { CSSProperties } from 'react';

export const mainStyle: CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Arial, sans-serif',
  margin: 0,
  padding: '32px 12px',
};

export const containerStyle: CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e6ebf1',
  borderRadius: '12px',
  margin: '0 auto',
  maxWidth: '520px',
  padding: '32px',
};

export const headingStyle: CSSProperties = {
  color: '#0f172a',
  fontSize: '22px',
  fontWeight: 700,
  lineHeight: '30px',
  margin: '0 0 20px',
};

export const contentSectionStyle: CSSProperties = {
  margin: 0,
};

export const paragraphStyle: CSSProperties = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0 0 16px',
};

export const headingLevel2Style: CSSProperties = {
  color: '#0f172a',
  fontSize: '20px',
  fontWeight: 700,
  lineHeight: '28px',
  margin: '24px 0 14px',
};

export const headingLevel3Style: CSSProperties = {
  color: '#0f172a',
  fontSize: '18px',
  fontWeight: 600,
  lineHeight: '24px',
  margin: '20px 0 12px',
};

export const headingStyles: Record<1 | 2 | 3 | 4 | 5 | 6, CSSProperties> = {
  1: headingStyle,
  2: headingLevel2Style,
  3: headingLevel3Style,
  4: headingLevel3Style,
  5: headingLevel3Style,
  6: headingLevel3Style,
};

export const horizontalRuleStyle: CSSProperties = {
  borderColor: '#e6ebf1',
  margin: '24px 0',
};

export const linkStyle: CSSProperties = {
  color: '#1d4ed8',
  textDecoration: 'underline',
};

export const inlineCodeStyle: CSSProperties = {
  backgroundColor: '#e2e8f0',
  borderRadius: '4px',
  color: '#0f172a',
  fontFamily: 'Consolas, "Courier New", monospace',
  fontSize: '13px',
  padding: '2px 4px',
};

export const preformattedStyle: CSSProperties = {
  ...paragraphStyle,
  backgroundColor: '#e2e8f0',
  borderRadius: '8px',
  color: '#0f172a',
  fontFamily: 'Consolas, "Courier New", monospace',
  fontSize: '13px',
  margin: '0 0 16px',
  padding: '12px',
  whiteSpace: 'pre-wrap',
};

export const blockquoteStyle: CSSProperties = {
  ...paragraphStyle,
  borderLeft: '4px solid #cbd5e1',
  color: '#475569',
  padding: '0 0 0 12px',
};

export const listItemStyle: CSSProperties = {
  ...paragraphStyle,
  margin: '0 0 10px',
  paddingLeft: '4px',
};

export const nestedListSectionStyle: CSSProperties = {
  margin: 0,
  paddingLeft: '16px',
};

export const imageSectionStyle: CSSProperties = {
  margin: '0 0 16px',
};

export const imageStyle: CSSProperties = {
  borderRadius: '8px',
  height: 'auto',
  maxWidth: '100%',
};
