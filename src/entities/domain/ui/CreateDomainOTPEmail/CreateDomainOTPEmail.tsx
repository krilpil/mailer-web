import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import type { CSSProperties } from 'react';

export type CreateDomainOtpEmailProps = {
  email: string;
  otpCode: string;
};

const mainStyle: CSSProperties = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Arial, sans-serif',
  margin: 0,
  padding: '32px 12px',
};

const containerStyle: CSSProperties = {
  backgroundColor: '#ffffff',
  border: '1px solid #e6ebf1',
  borderRadius: '12px',
  margin: '0 auto',
  maxWidth: '520px',
  padding: '32px',
};

const headingStyle: CSSProperties = {
  color: '#0f172a',
  fontSize: '22px',
  fontWeight: 700,
  margin: '0 0 12px',
};

const textStyle: CSSProperties = {
  color: '#334155',
  fontSize: '15px',
  lineHeight: '22px',
  margin: '0 0 16px',
};

const codeContainerStyle: CSSProperties = {
  backgroundColor: '#f1f5f9',
  borderRadius: '10px',
  padding: '16px',
  textAlign: 'center',
};

const codeStyle: CSSProperties = {
  color: '#0f172a',
  fontSize: '28px',
  fontWeight: 700,
  letterSpacing: '6px',
  margin: 0,
};

const dividerStyle: CSSProperties = {
  borderColor: '#e6ebf1',
  margin: '24px 0 16px',
};

const footerStyle: CSSProperties = {
  color: '#64748b',
  fontSize: '12px',
  lineHeight: '18px',
  margin: 0,
};

export const CreateDomainOtpEmail = ({ email, otpCode }: CreateDomainOtpEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Подтвердите {email}, чтобы начать отправку тестовых электронных писем или кампаний.
      </Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Heading style={headingStyle}>
            Подтвердите свой адрес электронной почты отправителя
          </Heading>
          <Text style={textStyle}>
            Используйте код подтверждения ниже, чтобы подтвердить {email} и начать отправку
            тестового письма или рассылок. Этот код действует в течение 5 минут.
          </Text>
          <Section style={codeContainerStyle}>
            <Text style={codeStyle}>{otpCode}</Text>
          </Section>
          <Hr style={dividerStyle} />
          <Text style={footerStyle}>
            Если вы не запрашивали код, то проигнорируйте это электронное письмо.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};
