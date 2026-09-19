import type { Metadata } from 'next';
import './globals.css';
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const metadata: Metadata = {
 title: '空名之子｜小說官方網站',
 description: '認識《空名之子》的群像人物，探索映京十二層、曦衡聯域與六大神域，收藏故事裡的日常風景。',
 icons: { icon: `${base}/favicon.svg`, shortcut: `${base}/favicon.svg` },
 openGraph: {title:'空名之子｜小說官方網站',description:'當世界都在替你回答，你還能留下自己的聲音嗎？',type:'website',locale:'zh_TW'}
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 return <html lang="zh-Hant-TW"><body>{children}</body></html>;
}
