import React, { useState } from 'react';

export default function FieldSettings({ field, onSave, onCancel }) {

    const [form, setForm] = useState(field);
    const [rawOptionsText, setRawOptionsText] = useState((field.options || []).join('\n'));


    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleOptionsChange = (e) => {
        const text = e.target.value;
        setRawOptionsText(text);
        const options = text.split('\n').filter(opt => opt.trim());
        setForm((prev) => ({ ...prev, options }));
    };

    const validate = () => {
        if (!form.label.trim()) {
            alert('Field Label is required.');
            return false;
        }

        if (
            ['Select Menu', 'Radio Button', 'Checkbox'].includes(form.type) &&
            (!form.options || form.options.length === 0 || form.options.some(opt => !opt.trim()))
        ) {
            alert('At least one valid option is required.');
            return false;
        }

        return true;
    };

    const handleSave = () => {
        if (validate()) onSave(form);
    };

    return (
        <div className="p-4 mt-2 border rounded shadow bg-white">
            <div className="mb-2 text-sm font-bold">
                Field Type: <span className="text-gray-700">{form.type}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                    name="label"
                    placeholder="Enter label"
                    value={form.label}
                    onChange={handleChange}
                    className="border px-2 py-1 w-full rounded"
                />
                {'maxLength' in form && (
                    <input
                        name="maxLength"
                        placeholder="Enter max length"
                        value={form.maxLength || ''}
                        onChange={handleChange}
                        className="border px-2 py-1 w-full rounded"
                    />
                )}
            </div>

            <textarea
                name="description"
                placeholder="Enter description"
                value={form.description}
                onChange={handleChange}
                className="border px-2 py-1 w-full rounded mb-4"
            />

            {/* Field-specific controls */}
            {['Select Menu', 'Radio Button', 'Checkbox'].includes(form.type) && (
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">
                        Add Multiple Options (Each option must be a new line)
                    </label>
                    <textarea
                        value={rawOptionsText}
                        onChange={handleOptionsChange}
                        className="border px-2 py-1 w-full rounded"
                        rows={4}
                        placeholder="Option 1\nOption 2\nOption 3"
                    />
                </div>
            )}

            {form.type === 'URL' && (
                <input
                    name="validationPattern"
                    placeholder="Enter RegExp for URL validation"
                    value={form.validationPattern || ''}
                    onChange={handleChange}
                    className="border px-2 py-1 w-full rounded mb-4"
                />
            )}

            {form.type === 'File Upload' && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                        name="acceptedFileTypes"
                        placeholder="Accepted file types (e.g., .pdf, .jpg)"
                        value={form.acceptedFileTypes || ''}
                        onChange={handleChange}
                        className="border px-2 py-1 w-full rounded"
                    />
                    <input
                        name="maxSizeMB"
                        placeholder="Max size (MB)"
                        value={form.maxSizeMB || ''}
                        onChange={handleChange}
                        type="number"
                        className="border px-2 py-1 w-full rounded"
                    />
                </div>
            )}

            {form.type === 'Date' && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <input
                        type="date"
                        name="minDate"
                        value={form.minDate || ''}
                        onChange={handleChange}
                        className="border px-2 py-1 w-full rounded"
                    />
                    <input
                        type="date"
                        name="maxDate"
                        value={form.maxDate || ''}
                        onChange={handleChange}
                        className="border px-2 py-1 w-full rounded"
                    />
                </div>
            )}

            {form.type === 'Terms & Condition' && (
                <>
                    <textarea
                        name="text"
                        placeholder="Enter terms and conditions"
                        value={form.text || ''}
                        onChange={handleChange}
                        className="border px-2 py-1 w-full rounded mb-4"
                    />
                    <label className="block mb-4">
                        <input
                            type="checkbox"
                            name="isCheckedRequired"
                            checked={form.isCheckedRequired}
                            onChange={handleChange}
                        />{' '}
                        User must accept
                    </label>
                </>
            )}

            <div className="flex items-center gap-4 mb-4">
                <label>
                    <input
                        type="checkbox"
                        name="mandatory"
                        checked={form.mandatory}
                        onChange={handleChange}
                    />{' '}
                    Mandatory
                </label>
                <label>
                    <input
                        type="checkbox"
                        name="invisible"
                        checked={form.invisible}
                        onChange={handleChange}
                    />{' '}
                    Invisible
                </label>
                {form.type === 'Select Menu' && (
                    <label>
                        <input
                            type="checkbox"
                            name="endPoint"
                            checked={form.endPoint}
                            onChange={handleChange}
                        />{' '}
                        EndPoint
                    </label>
                )}
            </div>

            <div className="flex gap-2">
                <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-3 py-1 rounded shadow"
                >
                    Save
                </button>
                <button onClick={onCancel} className="text-gray-600">
                    Cancel
                </button>
            </div>
        </div>
    );
}
