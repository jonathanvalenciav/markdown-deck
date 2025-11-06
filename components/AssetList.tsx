import React from 'react';
import { AssetMap } from '../types';
import { ImageIcon, TrashIcon } from './Icons';

interface AssetListProps {
  assetMap: AssetMap;
  onDelete: (assetName: string) => void;
}

const AssetList: React.FC<AssetListProps> = ({ assetMap, onDelete }) => {
  const assetNames = Array.from(assetMap.keys());

  return (
    <div className="max-h-60 overflow-y-auto border border-neutral-200 rounded-md">
        <ul className="text-sm divide-y divide-neutral-200">
            {assetNames.map(name => (
               <li key={name} className="flex items-center justify-between hover:bg-neutral-50 p-2 group">
                  <div className="flex items-center gap-3 truncate">
                    <ImageIcon className="w-5 h-5 text-sky-600 flex-shrink-0" />
                    <span className="truncate text-neutral-700" title={name}>{name}</span>
                  </div>
                  <button
                    onClick={() => onDelete(name)}
                    className="p-1 text-neutral-400 hover:text-danger-600 rounded-md hover:bg-danger-50 transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label={`Delete ${name}`}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
               </li>
            ))}
        </ul>
    </div>
  );
};

export default AssetList;