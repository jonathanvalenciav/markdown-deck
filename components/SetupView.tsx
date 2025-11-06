import React, { useState, useRef } from 'react';
import { AssetMap, MarkdownFile } from '../types';
import FileUpload from './FileUpload';
import DraggableFileList from './DraggableFileList';
import AssetList from './AssetList';
import MarkdownPreview from './MarkdownPreview';
import { DocumentIcon, ImageIcon, PlayIcon, EyeIcon, PanelLeftIcon } from './Icons';

interface SetupViewProps {
  markdownFiles: MarkdownFile[];
  assetMap: AssetMap;
  error: string | null;
  onMarkdownUpload: (files: FileList) => void;
  onAssetsUpload: (files: FileList) => void;
  onDeleteMarkdown: (fileId: string) => void;
  onReorderMarkdown: (files: MarkdownFile[]) => void;
  onDeleteAsset: (assetName: string) => void;
  onStartPresentation: () => void;
  onImageClick: (src: string) => void;
}

const SetupView: React.FC<SetupViewProps> = ({
  markdownFiles,
  assetMap,
  error,
  onMarkdownUpload,
  onAssetsUpload,
  onDeleteMarkdown,
  onReorderMarkdown,
  onDeleteAsset,
  onStartPresentation,
  onImageClick,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const markdownInputRef = useRef<HTMLInputElement>(null);
  const assetsInputRef = useRef<HTMLInputElement>(null);

  const combinedMarkdown = markdownFiles.map(f => f.content).join('\n\n---\n\n');
  const canPresent = markdownFiles.length > 0;

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
        onMarkdownUpload(e.target.files);
        e.target.value = ''; // Reset for re-uploading
    }
  };

  const handleAssetsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
          onAssetsUpload(e.target.files);
          e.target.value = '';
      }
  };

  const assetsInputProps: React.InputHTMLAttributes<HTMLInputElement> & { webkitdirectory?: string; directory?: string } = {
    type: 'file',
    onChange: handleAssetsChange,
    className: 'hidden',
    multiple: true,
    webkitdirectory: '',
    directory: '',
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-50 text-neutral-800 font-sans">
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-sm border-b border-neutral-200 z-10">
        <div className="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-md hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition-colors"
              aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              <PanelLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8 text-sky-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20ZM8 15.01L9.41 16.42L11 14.84V19H13V14.84L14.59 16.42L16 15.01L12.01 11.01L8 15.01Z" fill="currentColor"/></svg>
              <h1 className="text-xl font-bold text-neutral-800 tracking-tight hidden sm:block">Markdown Deck</h1>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onStartPresentation}
              disabled={!canPresent}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
            >
              <PlayIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Present</span>
            </button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        <aside className={`flex-shrink-0 bg-white border-r border-neutral-200 overflow-y-auto transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-[420px]' : 'w-0'}`}>
            <div className="p-6 space-y-8">
                {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">{error}</div>}
                <section>
                    <h2 className="text-lg font-semibold mb-1 flex items-center gap-2 text-neutral-800">
                        <DocumentIcon className="w-5 h-5 text-neutral-500"/>
                        Markdown Files
                    </h2>
                     <p className="text-sm text-neutral-500 mb-4">
                        Drag or select your <code className="text-xs">.md</code> files.
                    </p>
                    {markdownFiles.length > 0 ? (
                        <div className="space-y-3">
                            <DraggableFileList files={markdownFiles} onReorder={onReorderMarkdown} onDelete={onDeleteMarkdown} />
                            <button
                                onClick={() => markdownInputRef.current?.click()}
                                className="w-full text-center px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 rounded-md hover:bg-sky-100 transition-colors"
                            >
                                Add More Files
                            </button>
                        </div>
                    ) : (
                        <FileUpload id="markdown-upload" label="" onFileSelect={onMarkdownUpload} accept=".md" multiple />
                    )}
                    <input type="file" ref={markdownInputRef} onChange={handleMarkdownChange} multiple accept=".md" className="hidden" />
                </section>
                <section>
                    <h2 className="text-lg font-semibold mb-1 flex items-center gap-2 text-neutral-800">
                        <ImageIcon className="w-5 h-5 text-neutral-500"/>
                        Assets Folder
                    </h2>
                    <p className="text-sm text-neutral-500 mb-4">
                        Select a folder containing your images.
                    </p>
                    {assetMap.size > 0 ? (
                        <div className="space-y-3">
                            <AssetList assetMap={assetMap} onDelete={onDeleteAsset} />
                             <button
                                onClick={() => assetsInputRef.current?.click()}
                                className="w-full text-center px-4 py-2 text-sm font-medium text-sky-600 bg-sky-50 rounded-md hover:bg-sky-100 transition-colors"
                            >
                                Add From Folder
                            </button>
                        </div>
                    ) : (
                        <FileUpload id="assets-upload" label="" onFileSelect={onAssetsUpload} directory multiple />
                    )}
                    <input ref={assetsInputRef} {...assetsInputProps} />
                </section>
            </div>
        </aside>

        <main className="flex-1 flex flex-col bg-neutral-100 overflow-hidden">
             <div className="p-4 flex-shrink-0 border-b border-neutral-200 bg-white flex items-center gap-2">
                <EyeIcon className="w-5 h-5 text-neutral-500"/>
                <h2 className="font-semibold text-neutral-700">Live Preview</h2>
            </div>
            <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-sm border border-neutral-200 min-h-full">
                    {combinedMarkdown.trim() ? (
                        <MarkdownPreview content={combinedMarkdown} assetMap={assetMap} onImageClick={onImageClick} />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center text-neutral-400 py-24">
                            <DocumentIcon className="w-20 h-20 mb-4"/>
                            <p className="font-medium text-lg">Your rendered Markdown will appear here.</p>
                            <p className="text-sm">Upload a file to get started.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default SetupView;