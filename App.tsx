import React, { useState, useCallback, useEffect } from 'react';
import { AssetMap, MarkdownFile } from './types';
import SetupView from './components/SetupView';
import PresentationView from './components/PresentationView';
import ImageZoomModal from './components/ImageZoomModal';

function App() {
  const [markdownFiles, setMarkdownFiles] = useState<MarkdownFile[]>([]);
  const [assetMap, setAssetMap] = useState<AssetMap>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [zoomedImageUrl, setZoomedImageUrl] = useState<string | null>(null);
  const [isPresenting, setIsPresenting] = useState(false);

  const handleMarkdownUpload = useCallback((files: FileList) => {
    if (files.length === 0) return;

    const filePromises = Array.from(files)
      .filter(file => file.name.endsWith('.md'))
      .map(file => {
        return new Promise<MarkdownFile>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const text = e.target?.result as string;
            resolve({
              id: `${file.name}-${Date.now()}-${Math.random()}`,
              name: file.name,
              content: text,
            });
          };
          reader.onerror = (e) => reject(e);
          reader.readAsText(file);
        });
      });

    Promise.all(filePromises)
      .then(newFiles => {
        setMarkdownFiles(prev => [...prev, ...newFiles]);
        setError(null);
      })
      .catch(() => {
        setError('An error occurred while reading one or more Markdown files.');
      });
  }, []);

  const handleAssetsFolderUpload = useCallback((files: FileList) => {
    if (files.length === 0) return;
    const fileArray = Array.from(files) as any[];
    setAssetMap(prevMap => {
        const newMap: AssetMap = new Map(prevMap);
        fileArray.forEach(file => {
            const key = (file.webkitRelativePath as string | undefined)?.trim() || file.name;
            if (newMap.has(key)) {
                URL.revokeObjectURL(newMap.get(key)!);
            }
            const blobUrl = URL.createObjectURL(file);
            newMap.set(key, blobUrl);
        });
        return newMap;
    });
  }, []);
  
  const handleDeleteAsset = useCallback((assetName: string) => {
    setAssetMap(prevMap => {
        const newMap: AssetMap = new Map(prevMap);
        const url = newMap.get(assetName);
        if (url) {
            URL.revokeObjectURL(url);
        }
        newMap.delete(assetName);
        return newMap;
    });
  }, []);

  const handleDeleteMarkdownFile = (fileId: string) => {
    setMarkdownFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleReorderMarkdownFiles = (reorderedFiles: MarkdownFile[]) => {
    setMarkdownFiles(reorderedFiles);
  };
  
  const handleStartPresentation = useCallback(() => {
    if (markdownFiles.length > 0) {
      setIsPresenting(true);
    }
  }, [markdownFiles]);

  const handleExitPresentation = () => {
    setIsPresenting(false);
  };

  useEffect(() => {
    return () => {
      assetMap.forEach(url => URL.revokeObjectURL(url));
    };
  }, [assetMap]);

  return (
    <>
      {zoomedImageUrl && <ImageZoomModal src={zoomedImageUrl} onClose={() => setZoomedImageUrl(null)} />}
      
      {!isPresenting ? (
        <SetupView
          markdownFiles={markdownFiles}
          assetMap={assetMap}
          error={error}
          onMarkdownUpload={handleMarkdownUpload}
          onAssetsUpload={handleAssetsFolderUpload}
          onDeleteMarkdown={handleDeleteMarkdownFile}
          onReorderMarkdown={handleReorderMarkdownFiles}
          onDeleteAsset={handleDeleteAsset}
          onStartPresentation={handleStartPresentation}
          onImageClick={(src) => setZoomedImageUrl(src)}
        />
      ) : (
        <PresentationView
          markdownFiles={markdownFiles}
          assetMap={assetMap}
          onExit={handleExitPresentation}
          onImageClick={(src) => setZoomedImageUrl(src)}
        />
      )}
    </>
  );
}

export default App;