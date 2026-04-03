import styled from 'styled-components';

export const SPage = styled.section`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 0% 0%, rgba(37, 99, 235, 0.2), transparent 42%),
    radial-gradient(circle at 96% 6%, rgba(16, 185, 129, 0.2), transparent 36%),
    linear-gradient(145deg, #edf3ff 0%, #f7fbff 54%, #f0f8f5 100%);
  padding: clamp(20px, 4vw, 48px);
  color: #0f172a;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 999px;
    pointer-events: none;
    filter: blur(2px);
    animation: floatBlob 12s ease-in-out infinite;
  }

  &::before {
    width: clamp(220px, 32vw, 420px);
    height: clamp(220px, 32vw, 420px);
    background: radial-gradient(circle, rgba(59, 130, 246, 0.26) 0%, rgba(59, 130, 246, 0) 70%);
    top: -80px;
    left: -100px;
  }

  &::after {
    width: clamp(220px, 34vw, 460px);
    height: clamp(220px, 34vw, 460px);
    background: radial-gradient(circle, rgba(16, 185, 129, 0.24) 0%, rgba(16, 185, 129, 0) 70%);
    right: -120px;
    bottom: -140px;
    animation-delay: 2s;
  }

  @keyframes floatBlob {
    0%,
    100% {
      transform: translateY(0px) scale(1);
    }
    50% {
      transform: translateY(-14px) scale(1.03);
    }
  }
`;

export const SBrand = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  width: fit-content;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.35);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
`;

export const SBrandName = styled.div`
  font-size: clamp(16px, 2.1vw, 18px);
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #0f1b2d;
`;

export const SBrandBadge = styled.span`
  font-size: 12px;
  line-height: 1;
  font-weight: 600;
  color: #1d4ed8;
  background: #eaf2ff;
  border-radius: 999px;
  padding: 6px 10px;
`;

export const STitle = styled.h1`
  margin: 0;
  font-size: clamp(34px, 5.7vw, 58px);
  line-height: 1.04;
  letter-spacing: -0.02em;
  max-width: 700px;
  color: #0b1834;
`;

export const SSubtitle = styled.p`
  margin: 0;
  max-width: 620px;
  color: #334155;
  font-size: clamp(16px, 2vw, 20px);
  line-height: 1.45;
`;

export const SContainer = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1160px;
  margin: 0 auto;
  min-height: calc(100vh - clamp(40px, 8vw, 96px));
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(340px, 500px);
  gap: clamp(18px, 3vw, 56px);
  align-items: center;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
    max-width: 560px;
    align-items: start;
    gap: 20px;
    padding-block: 18px 26px;
  }
`;

export const SHero = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 980px) {
    gap: 14px;
  }
`;

export const SFeatureList = styled.ul`
  display: grid;
  gap: 10px;
  list-style: none;
  margin: 4px 0 0;
  padding: 0;
`;

export const SFeatureItem = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #1e293b;
  font-size: 15px;
  font-weight: 500;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2563eb 0%, #10b981 100%);
    flex: 0 0 8px;
  }
`;

export const SQuote = styled.p`
  margin: 6px 0 0;
  max-width: 560px;
  border: 1px solid rgba(191, 219, 254, 0.9);
  background: rgba(255, 255, 255, 0.75);
  border-radius: 16px;
  padding: 14px 16px;
  color: #334155;
  font-size: 14px;
  line-height: 1.5;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.08);
`;

export const SFormColumn = styled.div`
  width: 100%;
`;

export const SCard = styled.div`
  width: 100%;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(226, 232, 240, 0.95);
  backdrop-filter: blur(14px);
  border-radius: 24px;
  padding: clamp(18px, 3vw, 34px);
  box-shadow: 0 24px 50px rgba(30, 64, 175, 0.15);
  animation: cardRise 420ms ease-out both;

  @keyframes cardRise {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (max-width: 640px) {
    border-radius: 18px;
    padding: 18px 14px;
  }
`;

export const SCardTop = styled.div`
  margin-bottom: 18px;
`;

export const SCardTitle = styled.h2`
  margin: 0;
  color: #0f1b2d;
  font-size: clamp(22px, 3vw, 28px);
`;

export const SCardDescription = styled.p`
  margin: 8px 0 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.5;
`;

export const SFormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const SFootnote = styled.p`
  margin: 16px 0 0;
  color: #94a3b8;
  font-size: 12px;
  line-height: 1.45;
`;
