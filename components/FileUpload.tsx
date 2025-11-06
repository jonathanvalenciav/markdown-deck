import React, { useCallback, useState } from 'react';
import { FolderIcon, UploadIcon } from './Icons';

interface FileUploadProps {
  id: string;
  label: string;
  onFileSelect: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  directory?: boolean;
}

// Helper to recursively scan a directory and return a flat list of files.
const getFilesFromDirectory = async (entry: FileSystemDirectoryEntry): Promise<File[]> => {
    const files: File[] = [];
    const reader = entry.createReader();

    // The readEntries() API might need to be called multiple times to get all entries.
    const readAllEntries = (): Promise<FileSystemEntry[]> =>
        new Promise((resolve, reject) => {
            const allEntries: FileSystemEntry[] = [];
            const readBatch = () => {
                reader.readEntries(entries => {
                    if (entries.length === 0) {
                        resolve(allEntries);
                    } else {
                        allEntries.push(...entries);
                        readBatch();
                    }
                }, reject);
            };
            readBatch();
        });

    const entries = await readAllEntries();
    
    for (const currentEntry of entries) {
        if (currentEntry.isFile) {
            const file = await new Promise<File>((resolve, reject) => (currentEntry as FileSystemFileEntry).file(resolve, reject));
            // We'll attach the internal path here; the caller will prepend the root folder name.
            Object.defineProperty(file, 'internalPath', { value: currentEntry.fullPath, configurable: true });
            files.push(file);
        } else if (currentEntry.isDirectory) {
            const nestedFiles = await getFilesFromDirectory(currentEntry as FileSystemDirectoryEntry);
            files.push(...nestedFiles);
        }
    }
    return files;
};


const FileUpload: React.FC<FileUploadProps> = ({ id, label, onFileSelect, accept, multiple = false, directory = false }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }, []);
  const handleDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => { e.preventDefault(); e.stopPropagation(); }, []);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!e.dataTransfer) return;

    if (!directory) {
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) onFileSelect(e.dataTransfer.files);
      return;
    }
    
    const allFiles: File[] = [];
    const items = Array.from(e.dataTransfer.items);

    const promises = items.map(async (item) => {
      // FIX: Cast item to `any` to access `webkitGetAsEntry`. Type inference was failing, treating `item` as `unknown`.
      const entry = (item as any).webkitGetAsEntry();
      if (entry?.isDirectory) {
        const filesInDir = await getFilesFromDirectory(entry as FileSystemDirectoryEntry);
        // Construct the final webkitRelativePath, mimicking browser behavior.
        filesInDir.forEach(file => {
          const internalPath = ((file as any).internalPath.startsWith('/') ? (file as any).internalPath.substring(1) : (file as any).internalPath) as string;
          const finalPath = `${entry.name}/${internalPath}`;
          Object.defineProperty(file, 'webkitRelativePath', { value: finalPath, configurable: true });
        });
        allFiles.push(...filesInDir);
      }
    });

    await Promise.all(promises);
    
    if (allFiles.length > 0) {
      const dataTransfer = new DataTransfer();
      allFiles.forEach(file => dataTransfer.items.add(file));
      onFileSelect(dataTransfer.files);
    } else if (e.dataTransfer.files.length > 0) {
      // Fallback for browsers or scenarios where traversal fails but files are present
      onFileSelect(e.dataTransfer.files);
    }
  }, [onFileSelect, directory]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files);
      // Reset input value to allow re-uploading the same folder
      e.target.value = '';
    }
  };

  const dragDropClasses = isDragging 
    ? 'border-sky-500 bg-sky-50' 
    : 'border-neutral-300 hover:border-sky-500';

  const inputProps: React.InputHTMLAttributes<HTMLInputElement> & { webkitdirectory?: string; directory?: string } = {
    id: id,
    type: 'file',
    className: 'absolute inset-0 w-full h-full opacity-0 cursor-pointer',
    onChange: handleChange,
    accept: accept,
    multiple: multiple,
  };

  if (directory) {
    inputProps.webkitdirectory = '';
    inputProps.directory = '';
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-neutral-700 mb-2">
        {label}
      </label>
      <label
        htmlFor={id}
        className={`relative flex flex-col items-center justify-center w-full h-32 px-4 transition bg-neutral-50 border-2 ${dragDropClasses} border-dashed rounded-md appearance-none cursor-pointer`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
            {directory ? <FolderIcon className="w-8 h-8 mb-3 text-neutral-400" /> : <UploadIcon className="w-8 h-8 mb-3 text-neutral-400" />}
            <p className="mb-2 text-sm text-neutral-500">
                <span className="font-semibold text-sky-600">{directory ? 'Click to select folder' : 'Click to upload'}</span> or drag and drop
            </p>
            {accept && <p className="text-xs text-neutral-400">{`(${accept})`}</p>}
        </div>
        <input {...inputProps} />
      </label>
    </div>
  );
};

export default FileUpload;