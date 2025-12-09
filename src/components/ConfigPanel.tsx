import React, { useState, useEffect } from 'react';
import type { Sector, SectorType, Template } from '../types';

interface ConfigPanelProps {
    sectors: Sector[];
    onUpdate: (sectors: Sector[]) => void;
}

const COLORS = ['#f87171', '#fb923c', '#facc15', '#4ade80', '#60a5fa', '#a78bfa', '#e879f9'];

const ConfigPanel: React.FC<ConfigPanelProps> = ({ sectors, onUpdate }) => {
    // Template State
    const [templates, setTemplates] = useState<Template[]>([]);
    const [newTemplateName, setNewTemplateName] = useState('');

    useEffect(() => {
        try {
            const saved = localStorage.getItem('roulette_templates');
            if (saved) {
                setTemplates(JSON.parse(saved));
            }
        } catch (e) {
            console.error("Failed to load templates", e);
        }
    }, []);

    const saveTemplatesToStorage = (newTemplates: Template[]) => {
        setTemplates(newTemplates);
        localStorage.setItem('roulette_templates', JSON.stringify(newTemplates));
    };

    const handleSaveTemplate = () => {
        if (!newTemplateName.trim()) return;

        const newTemplate: Template = {
            id: crypto.randomUUID(),
            name: newTemplateName,
            sectors: sectors,
            timestamp: Date.now()
        };

        const updated = [newTemplate, ...templates];
        saveTemplatesToStorage(updated);
        setNewTemplateName('');
        alert('Template saved!');
    };

    const loadTemplate = (template: Template) => {
        if (confirm(`Load template "${template.name}"? Current changes will be lost.`)) {
            onUpdate(template.sectors);
        }
    };

    const deleteTemplate = (id: string) => {
        if (confirm('Delete this template?')) {
            const updated = templates.filter(t => t.id !== id);
            saveTemplatesToStorage(updated);
        }
    };

    const addSector = () => {
        const newSector: Sector = {
            id: crypto.randomUUID(),
            type: 'text',
            value: `Option ${sectors.length + 1}`,
            color: COLORS[sectors.length % COLORS.length],
        };
        onUpdate([...sectors, newSector]);
    };

    const removeSector = (id: string) => {
        onUpdate(sectors.filter(s => s.id !== id));
    };

    const updateSector = (id: string, field: keyof Sector, value: string | number | SectorType) => {
        onUpdate(sectors.map(s => s.id === id ? { ...s, [field]: value } : s));
    };

    const handleImageUpload = (id: string, file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result;
            if (typeof result === 'string') {
                const updatedSectors = sectors.map(s => {
                    if (s.id === id) {
                        return {
                            ...s,
                            value: result,
                            type: 'image' as SectorType,
                            imageScale: s.imageScale ?? 1.0,
                            imageX: s.imageX ?? 0,
                            imageY: s.imageY ?? 0,
                            imageRotation: s.imageRotation ?? 0
                        };
                    }
                    return s;
                });
                onUpdate(updatedSectors);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-none md:shadow-md w-full flex flex-col gap-6">
            {/* Template Section */}
            <div className="border-b pb-4">
                <h3 className="font-bold text-lg mb-2 text-gray-700">Templates</h3>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={newTemplateName}
                        onChange={(e) => setNewTemplateName(e.target.value)}
                        placeholder="Template Name"
                        className="flex-1 border rounded px-2 py-1 text-sm"
                    />
                    <button
                        onClick={handleSaveTemplate}
                        disabled={!newTemplateName.trim()}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                    >
                        Save
                    </button>
                </div>
                {templates.length > 0 && (
                    <div className="flex flex-col gap-1 max-h-32 overflow-y-auto mt-2 pr-1">
                        {templates.map(t => (
                            <div key={t.id} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm">
                                <span className="truncate flex-1 font-medium mr-2" title={t.name}>{t.name}</span>
                                <div className="flex gap-1 shrink-0">
                                    <button onClick={() => loadTemplate(t)} className="text-blue-600 hover:text-blue-800 text-xs px-1">Load</button>
                                    <button onClick={() => deleteTemplate(t.id)} className="text-red-500 hover:text-red-700 text-xs px-1">Del</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Editor Section */}
            <div>
                <h2 className="text-xl font-bold mb-4 text-gray-800">Configuration</h2>
                <div className="flex flex-col gap-3">
                    {sectors.map((sector) => (
                        <div key={sector.id} className="border p-3 rounded-md bg-slate-50 relative group">
                            <button
                                onClick={() => removeSector(sector.id)}
                                className="absolute top-1 right-1 text-gray-400 hover:text-red-500"
                                title="Remove"
                            >
                                &times;
                            </button>

                            <div className="flex items-center gap-2 mb-2">
                                <input
                                    type="color"
                                    value={sector.color}
                                    onChange={(e) => updateSector(sector.id, 'color', e.target.value)}
                                    className="w-8 h-8 rounded cursor-pointer border-none p-0 shrink-0"
                                />
                                <div className="flex-1 flex gap-2 text-sm justify-end">
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`type-${sector.id}`}
                                            checked={sector.type === 'text'}
                                            onChange={() => updateSector(sector.id, 'type', 'text')}
                                        /> Text
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`type-${sector.id}`}
                                            checked={sector.type === 'image'}
                                            onChange={() => updateSector(sector.id, 'type', 'image')}
                                        /> Image
                                    </label>
                                </div>
                            </div>

                            {sector.type === 'text' ? (
                                <input
                                    type="text"
                                    value={sector.value}
                                    onChange={(e) => updateSector(sector.id, 'value', e.target.value)}
                                    className="w-full border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                                    placeholder="Label"
                                />
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {sector.value && !sector.value.startsWith('data:image') && !sector.value.startsWith('blob:') && (
                                        <span className="text-xs text-red-500">Upload an image</span>
                                    )}
                                    {(sector.value.startsWith('data:image') || sector.value.startsWith('blob:')) && (
                                        <img src={sector.value} alt="Preview" className="w-24 h-24 object-cover rounded mx-auto border bg-white" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) {
                                                handleImageUpload(sector.id, e.target.files[0]);
                                            }
                                        }}
                                        className="text-xs w-full text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                                    />
                                    {sector.value && (
                                        <div className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded">
                                            <div className="mb-1 font-bold">Adjust Image</div>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-8 shrink-0">Scale</span>
                                                    <input
                                                        type="range" min="0.1" max="3.0" step="0.1"
                                                        value={sector.imageScale ?? 1.0}
                                                        onChange={(e) => updateSector(sector.id, 'imageScale', parseFloat(e.target.value))}
                                                        className="flex-1"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-8 shrink-0">X</span>
                                                    <input
                                                        type="range" min="-150" max="150" step="1"
                                                        value={sector.imageX ?? 0}
                                                        onChange={(e) => updateSector(sector.id, 'imageX', parseFloat(e.target.value))}
                                                        className="flex-1"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-8 shrink-0">Y</span>
                                                    <input
                                                        type="range" min="-150" max="150" step="1"
                                                        value={sector.imageY ?? 0}
                                                        onChange={(e) => updateSector(sector.id, 'imageY', parseFloat(e.target.value))}
                                                        className="flex-1"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-8 shrink-0">Rot</span>
                                                    <input
                                                        type="range" min="-180" max="180" step="5"
                                                        value={sector.imageRotation ?? 0}
                                                        onChange={(e) => updateSector(sector.id, 'imageRotation', parseFloat(e.target.value))}
                                                        className="flex-1"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    <button
                        onClick={addSector}
                        className="w-full py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded hover:border-blue-400 hover:text-blue-500 transition-colors"
                    >
                        + Add Sector
                    </button>
                </div>
            </div>

        </div>
    );
};

export default ConfigPanel;
