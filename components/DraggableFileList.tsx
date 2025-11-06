import React, { useState, useRef } from 'react';
import { MarkdownFile } from '../types';
import { DocumentIcon, DragHandleIcon, TrashIcon } from './Icons';

interface DraggableFileListProps {
  files: MarkdownFile[];
  onReorder: (files: MarkdownFile[]) => void;
  onDelete: (fileId: string) => void;
}

const DraggableFileList: React.FC<DraggableFileListProps> = ({ files, onReorder, onDelete }) => {
  const [draggingItem, setDraggingItem] = useState<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggingItem(index);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLIElement>, index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (draggingItem === null || dragOverItem.current === null || draggingItem === dragOverItem.current) {
      setDraggingItem(null);
      dragOverItem.current = null;
      return;
    }

    const filesCopy = [...files];
    const draggedItemContent = filesCopy.splice(draggingItem, 1)[0];
    filesCopy.splice(dragOverItem.current, 0, draggedItemContent);
    
    onReorder(filesCopy);

    setDraggingItem(null);
    dragOverItem.current = null;
  };
  
  const getDragClasses = (index: number) => {
    if (index === draggingItem) return "opacity-50";
    return "";
  };

  return (
    <div className="max-h-60 overflow-y-auto border border-neutral-200 rounded-md">
      <ul className="text-sm divide-y divide-neutral-200">
        {files.map((file, index) => {
            const fullName = file.name;
            const lastSlashIndex = fullName.lastIndexOf('/');
            const filename = lastSlashIndex === -1 ? fullName : fullName.substring(lastSlashIndex + 1);
            const path = lastSlashIndex === -1 ? '' : fullName.substring(0, lastSlashIndex);

            return (
              <li
                key={file.id}
                className={`flex items-center justify-between hover:bg-neutral-50 p-2 group transition-opacity duration-300 ${getDragClasses(index)}`}
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragEnter={(e) => handleDragEnter(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="flex items-center gap-3 truncate">
                    <DragHandleIcon className="w-5 h-5 text-neutral-400 cursor-grab flex-shrink-0" />
                    <DocumentIcon className="w-5 h-5 text-sky-600 flex-shrink-0" />
                    <div className="truncate">
                        <p className="truncate text-sm text-neutral-800 font-medium" title={fullName}>{filename}</p>
                        {path && <p className="truncate text-xs text-neutral-500" title={path}>{path}</p>}
                    </div>
                </div>
                <button
                    onClick={() => onDelete(file.id)}
                    className="p-1 text-neutral-400 hover:text-danger-600 rounded-md hover:bg-danger-50 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label={`Delete ${file.name}`}
                >
                    <TrashIcon className="w-4 h-4" />
                </button>
              </li>
            );
        })}
      </ul>
    </div>
  );
};

export default DraggableFileList;