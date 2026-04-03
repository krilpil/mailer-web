import type { ThemeConfig } from 'antd';

export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#2563eb',
    colorInfo: '#2563eb',
    colorSuccess: '#16a34a',
    colorWarning: '#d97706',
    colorError: '#dc2626',
    colorTextBase: '#0f172a',
    colorBgLayout: '#eff4fa',
    colorBgContainer: '#ffffff',
    colorBorder: '#dbe5f2',
    borderRadius: 12,
    borderRadiusLG: 14,
    borderRadiusSM: 10,
    fontFamily: 'var(--font-roboto), sans-serif',
    controlHeight: 42,
    controlHeightLG: 46,
    boxShadowSecondary: '0 14px 30px rgba(15, 23, 42, 0.08)',
  },
  components: {
    Layout: {
      bodyBg: '#eff4fa',
      headerBg: 'rgba(255,255,255,0.92)',
      siderBg: '#ffffff',
    },
    Menu: {
      itemHeight: 40,
      itemMarginInline: 0,
      itemBorderRadius: 10,
      itemBg: 'transparent',
      itemColor: '#1f2937',
      itemSelectedColor: '#1d4ed8',
      itemSelectedBg: '#eaf2ff',
      itemHoverColor: '#1d4ed8',
      itemHoverBg: '#f1f6ff',
    },
    Button: {
      borderRadius: 10,
      controlHeight: 42,
    },
    Card: {
      borderRadiusLG: 14,
      boxShadowTertiary: '0 10px 24px rgba(15, 23, 42, 0.05)',
    },
    Table: {
      borderColor: '#e7edf5',
      headerBg: '#f7faff',
      headerColor: '#0f172a',
      rowHoverBg: '#f8fbff',
    },
    Input: {
      activeBorderColor: '#3b82f6',
      hoverBorderColor: '#60a5fa',
    },
    Modal: {
      borderRadiusLG: 14,
    },
    Drawer: {
      colorBgElevated: '#ffffff',
    },
  },
};
