import React, { useState } from 'react';

export default function DraggableField({ field, onConfigure, onDelete }) {

    const [editingLabel, setEditingLabel] = useState(false);
    const [tempLabel, setTempLabel] = useState(field.label);


    return (
        <div className="bg-blue-100 p-3 rounded relative mb-2 shadow">
            <div className="flex justify-between items-center">

                {editingLabel ? (
                    <input
                        value={tempLabel}
                        onChange={(e) => setTempLabel(e.target.value)}
                        onBlur={() => {
                            setEditingLabel(false);
                            updateLabel(tempLabel);
                        }}
                        autoFocus
                        className="bg-transparent border-b w-full"
                    />
                ) : (
                    <div className="cursor-pointer" onClick={() => setEditingLabel(true)}>
                        {field.label || `${field.type} Name`}
                    </div>
                )}

                <div className="flex items-center gap-3">
                    <button onClick={() => onConfigure(field.id)} className="text-gray-600 hover:text-blue-600">
                        <img src="/svg/setting.svg" alt="SettingsLogo" className="h-4" />
                    </button>
                    <button onClick={() => onDelete(field.id)} className="text-red-500 hover:text-red-700">
                        <img src="/svg/delete.svg" alt="DeleteLogo" className="h-4" />
                    </button>
                </div>
            </div>
            <div className="text-xs text-gray-600">{field.description || 'Field Description'}</div>
        </div>
    );
}
