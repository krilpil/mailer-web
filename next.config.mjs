const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  env: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    BASE_API_URL: process.env.BASE_API_URL,
    BILLION_MAIL_API: process.env.BILLION_MAIL_API,
    BILLION_MAIL_KEY: process.env.BILLION_MAIL_KEY,
    BILLION_MAIL_TOKEN: process.env.BILLION_MAIL_TOKEN,
  },
  transpilePackages: [
    'rc-util',
    '@ant-design',
    'kitchen-flow-editor',
    '@ant-design/pro-editor',
    'zustand',
    'leva',
    'antd',
    'rc-pagination',
    'rc-picker',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
      },
    ],
  },
  productionBrowserSourceMaps: true,
};

export default nextConfig;
