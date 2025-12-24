import React, { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { Database, Copy, RefreshCw, Filter, Trash2 } from 'lucide-react';

interface ContextMenuProps {
    id: string;
    top: number;
    left: number;
    right: number;
    bottom: number;
    type: string;
    onAddDataBlock: (type: 'filtered' | 'reprocessed' | 'shortlisted' | 'custom') => void;
    onClose: () => void;
}

export const ContextMenu = ({ id, top, left, right, bottom, type, onAddDataBlock, onClose }: ContextMenuProps) => {
    const { getNode } = useReactFlow();

    return (
        <div
            style={{ top, left }}
            className="absolute z-50 bg-white border border-slate-200 rounded-lg shadow-xl min-w-[200px] overflow-hidden animate-in fade-in zoom-in-95 duration-100"
        >
            {type === 'roundNode' && (
                <div className="p-1">
                    <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 mb-1">
                        Add Output Data
                    </div>
                    <button
                        onClick={() => onAddDataBlock('shortlisted')}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 rounded flex items-center gap-2"
                    >
                        <Database className="w-4 h-4" />
                        Shortlisted Data
                    </button>
                    <button
                        onClick={() => onAddDataBlock('filtered')}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-orange-50 hover:text-orange-600 rounded flex items-center gap-2"
                    >
                        <Filter className="w-4 h-4" />
                        Filtered Data
                    </button>
                    <button
                        onClick={() => onAddDataBlock('reprocessed')}
                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-cyan-50 hover:text-cyan-600 rounded flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Needs Reprocessing
                    </button>
                </div>
            )}
            <div className="bg-slate-50 p-1 border-t border-slate-100">
                <button onClick={onClose} className="w-full text-left px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 rounded">
                    Cancel
                </button>
            </div>
        </div>
    );
};
