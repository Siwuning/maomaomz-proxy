import vue from '@vitejs/plugin-vue';
import { execSync } from 'node:child_process';
import path from 'node:path';
import unpluginAutoImport from 'unplugin-auto-import/vite';
import { VueUseComponentsResolver, VueUseDirectiveResolver } from 'unplugin-vue-components/resolvers';
import unpluginVueComponents from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';
import pluginExternal from 'vite-plugin-external';

// 获取当前 git commit hash
function getGitCommitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
}

const externals = {
  jquery: '$',
  hljs: 'hljs',
  lodash: '_',
  showdown: 'showdown',
  toastr: 'toastr',
  '@popperjs/core': 'Popper',
} as const;

const relative_sillytavern_path = path.relative(
  path.join(__dirname, 'dist'),
  __dirname.substring(0, __dirname.lastIndexOf('public') + 6),
);

export default defineConfig(({ mode }) => ({
  // 🔥 关键：使用相对路径，让 chunk 从插件 dist 目录加载
  base: './',

  plugins: [
    vue({
      features: {
        optionsAPI: false,
        prodDevtools: process.env.CI !== 'true',
        prodHydrationMismatchDetails: false,
      },
    }),
    unpluginAutoImport({
      dts: true,
      dtsMode: 'overwrite',
      imports: [
        'vue',
        'pinia',
        '@vueuse/core',
        { from: 'klona', imports: ['klona'] },
        { from: 'vue-final-modal', imports: ['useModal'] },
        { from: 'zod', imports: ['z'] },
      ],
      dirs: [{ glob: './src/panel/composable', types: true }],
    }),
    unpluginVueComponents({
      dts: true,
      syncMode: 'overwrite',
      // globs: ['src/panel/component/*.vue'],
      resolvers: [VueUseComponentsResolver(), VueUseDirectiveResolver()],
    }),
    {
      name: 'sillytavern_resolver',
      enforce: 'pre',
      resolveId(id) {
        if (id.startsWith('@sillytavern/')) {
          return {
            id: path.join(relative_sillytavern_path, id.replace('@sillytavern/', '')).replaceAll('\\', '/') + '.js',
            external: true,
          };
        }
      },
    },
    pluginExternal({
      externals: libname => {
        if (libname in externals) {
          return externals[libname as keyof typeof externals];
        }
      },
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  build: {
    rollupOptions: {
      input: 'src/index.ts',
      output: {
        format: 'es',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].[hash].chunk.js',
        assetFileNames: '[name].[ext]',
        preserveModules: false,
        manualChunks: id => {
          // Vue 核心库单独打包
          if (id.includes('node_modules/@vue/') || id.includes('node_modules/vue/')) {
            return 'vue-vendor';
          }
          // Pinia 单独打包
          if (id.includes('node_modules/pinia')) {
            return 'pinia-vendor';
          }
          // VueUse 单独打包
          if (id.includes('node_modules/@vueuse/')) {
            return 'vueuse-vendor';
          }
          // Zod 验证库
          if (id.includes('node_modules/zod')) {
            return 'zod-vendor';
          }
          // vue-final-modal
          if (id.includes('vue-final-modal')) {
            return 'modal-vendor';
          }
          // klona
          if (id.includes('node_modules/klona')) {
            return 'utils-vendor';
          }
        },
      },
    },

    outDir: 'dist',
    emptyOutDir: false,

    // 🔥 将所有 CSS 合并到主入口，避免动态导入时 CSS 路径问题
    cssCodeSplit: false,

    sourcemap: mode === 'production' ? true : 'inline',

    minify: mode === 'production' ? 'terser' : false,
    terserOptions:
      mode === 'production'
        ? {
            format: { quote_style: 1 },
            mangle: { reserved: ['_', 'toastr', 'YAML', '$', 'z'] },
          }
        : {
            format: { beautify: true, indent_level: 2 },
            compress: false,
            mangle: false,
          },

    target: 'esnext',
  },

  define: {
    __GIT_COMMIT_HASH__: JSON.stringify(getGitCommitHash()),
  },
}));
