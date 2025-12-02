/** @type {import('tailwindcss').Config} */
export default {
  // 关键：配置需要扫描的文件路径
  content: [
    './index.html', // 根目录的 index.html
    './src/**/*.{vue,js,ts}', // src 下所有 .vue/.js/.ts 文件（递归匹配子目录）
  ],
  theme: {
    extend: {}, // 后续可在这里扩展主题（如自定义颜色、字体）
  },
  plugins: [], // 可安装 Tailwind 插件（如表单样式、动画插件）
}
