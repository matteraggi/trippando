import React from 'react';
import { Plus, FileText, Edit2, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import type { Note } from '../types/Note';

interface NotesListProps {
    notes: Note[];
    memberNames: Record<string, string>;
    onAddNote: () => void;
    onEditNote: (note: Note) => void;
    onDeleteNote: (noteId: string) => void;
}

const NotesList: React.FC<NotesListProps> = ({
    notes,
    memberNames,
    onAddNote,
    onEditNote,
    onDeleteNote
}) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-2 px-1">
                <h3 className="text-lg font-semibold text-gray-900">Note di viaggio</h3>
                <button
                    onClick={onAddNote}
                    className="text-primary-600 font-medium text-sm flex items-center"
                >
                    <Plus size={18} className="mr-1" />
                    Nuova Nota
                </button>
            </div>

            {notes.length === 0 ? (
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
                    <FileText size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-gray-500 text-sm mb-4">Nessuna nota presente.</p>
                    <button
                        onClick={onAddNote}
                        className="px-5 py-2.5 bg-primary-500 text-white rounded-xl font-medium text-sm hover:bg-primary-600 transition-colors shadow-lg shadow-primary-500/30"
                    >
                        Aggiungi la prima nota
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {notes.map(note => (
                        <div key={note.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-900 text-lg">{note.title || 'Senza Titolo'}</h4>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => onEditNote(note)}
                                        className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDeleteNote(note.id)}
                                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed line-clamp-3">{note.content}</p>
                            <div className="mt-3 pt-3 border-t border-gray-50 text-xs text-gray-400 flex justify-between">
                                <span>{formatDate(note.updatedAt)}</span>
                                {memberNames[note.createdBy] && (
                                    <span>Di {memberNames[note.createdBy]}</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NotesList;
