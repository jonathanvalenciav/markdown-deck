import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AssetMap } from '../types';

interface MarkdownPreviewProps {
  content: string;
  assetMap: AssetMap;
  isTitleSlide?: boolean;
  onImageClick: (src: string) => void;
  fontSizeLevel?: number;
}

const contentSizeClasses: Record<string, string> = { '-2': 'text-base', '-1': 'text-lg', '0': 'text-xl', '1': 'text-2xl', '2': 'text-3xl' };
const titlePSizeClasses: Record<string, string> = { '-2': 'text-lg', '-1': 'text-xl', '0': 'text-2xl', '1': 'text-3xl', '2': 'text-4xl' };
const h1SizeClasses: Record<string, string> = { '-2': 'text-2xl lg:text-3xl', '-1': 'text-3xl lg:text-4xl', '0': 'text-4xl lg:text-5xl', '1': 'text-5xl lg:text-6xl', '2': 'text-6xl lg:text-7xl' };
const titleH1SizeClasses: Record<string, string> = { '-2': '!text-5xl', '-1': '!text-6xl', '0': '!text-7xl', '1': '!text-8xl', '2': '!text-9xl' };
const h2SizeClasses: Record<string, string> = { '-2': 'text-xl lg:text-2xl', '-1': 'text-2xl lg:text-3xl', '0': 'text-3xl lg:text-4xl', '1': 'text-4xl lg:text-5xl', '2': 'text-5xl lg:text-6xl' };
const h3SizeClasses: Record<string, string> = { '-2': 'text-lg lg:text-xl', '-1': 'text-xl lg:text-2xl', '0': 'text-2xl lg:text-3xl', '1': 'text-3xl lg:text-4xl', '2': 'text-4xl lg:text-5xl' };

const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, assetMap, isTitleSlide = false, onImageClick, fontSizeLevel = 0 }) => {
  const customComponents = {
    img: ({ node, ...props }: any) => {
      let src = props.src;
      if (src && !/^(https?:)?\/\//.test(src) && !src.startsWith('data:')) {
        const cleanedSrc = src.startsWith('./') ? src.substring(2) : src;
        if (assetMap.has(cleanedSrc)) {
          src = assetMap.get(cleanedSrc);
        }
      }
      return <img 
        {...props} 
        src={src} 
        alt={props.alt || ''} 
        className="max-w-full h-auto rounded-lg my-4 cursor-zoom-in"
        onClick={() => src && onImageClick(src)}
      />;
    },
    h1: ({node, ...props}: any) => <h1 className={`font-bold text-neutral-900 pb-2 mb-4 mt-6 ${isTitleSlide ? `${titleH1SizeClasses[fontSizeLevel]} !mb-8 !pb-6 !border-b-4 !border-sky-200` : `${h1SizeClasses[fontSizeLevel]} border-b border-neutral-200`}`} {...props} />,
    h2: ({node, ...props}: any) => <h2 className={`font-semibold text-neutral-800 border-b border-neutral-200 pb-2 mb-4 mt-6 ${h2SizeClasses[fontSizeLevel]}`} {...props} />,
    h3: ({node, ...props}: any) => <h3 className={`font-semibold text-neutral-800 mb-3 mt-5 ${h3SizeClasses[fontSizeLevel]}`} {...props} />,
    p: ({node, ...props}: any) => <p className={`my-4 leading-relaxed text-neutral-700 ${isTitleSlide ? `${titlePSizeClasses[fontSizeLevel]} !leading-relaxed !text-neutral-500 max-w-3xl mx-auto` : contentSizeClasses[fontSizeLevel]}`} {...props} />,
    a: ({node, ...props}: any) => <a className="text-sky-600 hover:underline font-medium" {...props} />,
    blockquote: ({node, ...props}: any) => <blockquote className="border-l-4 border-neutral-200 text-neutral-600 pl-4 my-4" {...props} />,
    code: ({node, inline, ...props}: any) => {
      return inline ? (
         <code className="bg-neutral-100 px-1.5 py-1 rounded text-sm font-mono text-neutral-800" {...props} />
      ) : (
        <pre className="bg-neutral-100 p-4 rounded-md overflow-x-auto font-mono text-sm my-4 text-neutral-800"><code {...props} /></pre>
      );
    },
    ul: ({node, ...props}: any) => <ul className={`list-disc pl-6 my-4 space-y-2 text-neutral-700 ${contentSizeClasses[fontSizeLevel]}`} {...props} />,
    ol: ({node, ...props}: any) => <ol className={`list-decimal pl-6 my-4 space-y-2 text-neutral-700 ${contentSizeClasses[fontSizeLevel]}`} {...props} />,
    li: ({node, ...props}: any) => <li className="pl-2" {...props} />,
    table: ({node, ...props}: any) => (
        <div className="overflow-x-auto my-4 border border-neutral-200 rounded-lg">
            <table className={`w-full text-neutral-700 ${contentSizeClasses[fontSizeLevel]}`} {...props} />
        </div>
    ),
    thead: ({node, ...props}: any) => <thead className="bg-neutral-50 text-neutral-800" {...props} />,
    th: ({node, ...props}: any) => <th className="p-3 font-semibold text-left border-b border-neutral-200" {...props} />,
    td: ({node, ...props}: any) => <td className="p-3 border-b border-neutral-200" {...props} />,
    tr: ({node, ...props}: any) => <tr className="even:bg-neutral-50" {...props} />,
  };

  return (
    <div className={`prose max-w-none ${isTitleSlide ? 'text-center' : ''}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={customComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownPreview;