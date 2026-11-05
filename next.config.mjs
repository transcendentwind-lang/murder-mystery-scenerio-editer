/** @type {import('next').NextConfig} */
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

const nextConfig = isStaticExport
  ? {
      output: "export",
      distDir: "out",
      basePath: "/murder-mystery-scenerio-editer",
      assetPrefix: "/murder-mystery-scenerio-editer/",
      trailingSlash: true,
      images: {
        unoptimized: true,
      },
      eslint: {
        ignoreDuringBuilds: true,
      },
      typescript: {
        ignoreBuildErrors: true,
      },
    }
  : {
      webpack: (config, { dev }) => {
        if (dev) {
          config.cache = false;
        }
        return config;
      },
    };

export default nextConfig;
