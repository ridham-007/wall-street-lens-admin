import React, { useState } from 'react';

type Entry = {
    region: string;
    modal: string;
    capacity: string;
    production: string;
};

const CollapsibleForm = () => {
    const [entries, setEntries] = useState<Entry[]>([
        { region: '', modal: '', capacity: '', production: '' },
    ]);
    const [expanded, setExpanded] = useState<number | null>(null);

    const addEntry = () => {
        setEntries([...entries, { region: '', modal: '', capacity: '', production: '' }]);
    };

    const deleteEntry = (index: number) => {
        const updatedEntries = [...entries];
        updatedEntries.splice(index, 1);
        setEntries(updatedEntries);
        if (expanded === index) {
            setExpanded(null);
        }
    };

    const toggleCollapse = (index: number) => {
        setExpanded(expanded === index ? null : index);
    };

    const handleInputChange = (index: number, key: keyof Entry, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index][key] = value;
        setEntries(updatedEntries);
    };

    return (
        <div className='w-full p-2 bg-gray-100'>
            {entries.map((entry, index) => (
                <div key={index} className="w-full border p-2 rounded mb-2 bg-gray-200">
                    <div className="flex justify-between items-center">
                        <button type="button" onClick={() => toggleCollapse(index)} className="bg-gray-300 p-1 rounded">
                            {expanded === index ? '▲' : '▼'}
                        </button>
                        <h2 className="text-lg mr-auto font-bold">{entry.region}</h2>
                        <button type="button" onClick={() => deleteEntry(index)} className="bg-red-500 ml-auto text-white p-1 rounded ml-2">
                            Delete
                        </button>
                    </div>
                    <div className={`mt-2 w-full ${expanded === index ? '' : 'hidden'}`}>
                        <div>
                        <input
                            type="text"
                            placeholder="Region"
                            value={entry.region}
                            onChange={(e) => handleInputChange(index, 'region', e.target.value)}
                            className="w-full border rounded p-2"
                        />
                        </div>
                        <div>
                        <input
                            type="text"
                            placeholder="Modal"
                            value={entry.modal}
                            onChange={(e) => handleInputChange(index, 'modal', e.target.value)}
                            className="w-full mt-2 border rounded p-2"
                        />
                        </div>
                        <div>
                        <input
                            type="text"
                            placeholder="Capacity"
                            value={entry.capacity}
                            onChange={(e) => handleInputChange(index, 'capacity', e.target.value)}
                            className="w-full mt-2 border rounded p-2"
                        />
                    </div>
                        <div>

                        <input
                            type="text"
                            placeholder="Status"
                            value={entry.production}
                            onChange={(e) => handleInputChange(index, 'production', e.target.value)}
                            className="w-full mt-2 border rounded p-2"
                        />
                </div>
                    </div>
                </div>
            ))}
            <button type="button" onClick={addEntry} className="mb-2 bg-gray-500 text-white p-2 rounded">
                Add Entry
            </button>
        </div>
    );
};

export default CollapsibleForm;
