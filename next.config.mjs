import path from "node:path";

/** @type {import('next').NextConfig} */
const isStaticExport = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";
const participantModules = new Set([
  "app/layout.tsx",
  "app/page.participant.tsx",
  "app/sonar/layout.tsx",
  "app/sonar/page.tsx",
  "components/WhaleSonarMobileApp.tsx",
  "proxy.ts",
  "scenarios/catalog.ts",
  "scenarios/project-deep-sea/sonarWords.ts",
  "utils/audioSynth.ts",
  "utils/sonarGuide.ts",
  "utils/wordAudio.ts",
]);

function verifyParticipantModules(compiler) {
  const name = "VerifyParticipantModules";
  const sourceRoot = path.join(import.meta.dirname, "src") + path.sep;

  compiler.hooks.compilation.tap(name, (compilation) => {
    compilation.hooks.finishModules.tap(name, (modules) => {
      for (const { resource } of modules) {
        if (!resource?.startsWith(sourceRoot) || !/\.[cm]?[jt]sx?$/.test(resource)) continue;
        const relative = resource.slice(sourceRoot.length).split(path.sep).join("/");
        if (!participantModules.has(relative)) {
          compilation.errors.push(new Error(`参加者向けビルドの公開対象外コード: ${relative}`));
        }
      }
    });
  });
}

const nextConfig = isStaticExport
  ? {
      pageExtensions: ["participant.tsx", "tsx", "ts", "jsx", "js"],
      output: "export",
      distDir: "out",
      basePath: "/murder-mystery-scenerio-editer",
      assetPrefix: "/murder-mystery-scenerio-editer/",
      trailingSlash: true,
      images: {
        unoptimized: true,
      },
      webpack: (config) => {
        config.plugins.push(verifyParticipantModules);
        return config;
      },
    }
  : {
      pageExtensions: ["editor.tsx", "tsx", "ts", "jsx", "js"],
      webpack: (config, { dev }) => {
        if (dev) {
          config.cache = false;
        }
        return config;
      },
    };

export default nextConfig;
