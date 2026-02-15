import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

import type { Note } from '../types/Note';

interface NoteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (note: { title: string; content: string }) => Promise<void>;
    initialData?: Note | null;
    title?: string;
}

export default function NoteModal({ isOpen, onClose, onSubmit, initialData, title = 'Nuova Nota' }: NoteModalProps) {
    const [noteTitle, setNoteTitle] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setNoteTitle(initialData?.title || '');
            setNoteContent(initialData?.content || '');
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({ title: noteTitle, content: noteContent });
            onClose();
        } catch (error) {
            console.error("Failed to save note", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative z-10 overflow-hidden flex flex-col animate-fade-in">

                {/* Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full text-gray-500">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <input
                            type="text"
                            value={noteTitle}
                            onChange={(e) => setNoteTitle(e.target.value)}
                            placeholder="Titolo"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none font-semibold text-gray-900"
                            autoFocus
                        />
                    </div>
                    <div>
                        <textarea
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            className="w-full h-48 p-3 rounded-xl bg-gray-50 border-none focus:ring-2 focus:ring-primary-500 outline-none resize-none text-gray-700"
                            placeholder="Scrivi qui..."
                        />
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-primary-600 text-white rounded-xl font-semibold shadow-lg shadow-primary-500/30 active:scale-95 transition-transform disabled:bg-primary-400 flex items-center"
                        >
                            {loading ? <LoadingSpinner size={16} /> : 'Salva Nota'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
