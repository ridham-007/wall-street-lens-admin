import React, { useState } from 'react';

type Entry = {
    region: string;
    modal: string;
    capacity: string;
    status: string;
};

export interface formProps {
    quarters: any,
    selectedTab: any,
    updateQuarters: any;
}

const CollapsibleForm = (props: formProps) => {
    const initialEntries = [...props?.quarters?.find((current: { quarter: any; }) => current?.quarter === props?.selectedTab)?.rows];
    const [expanded, setExpanded] = useState<number | null>(null);
    const addEntry = () => {
        const updatedRows = [...initialEntries, { region: '', modal: '', capacity: '', status: '' }];
        const updatedQuarters = props?.quarters?.map((current: { quarter: any; })  => {
            if(current?.quarter === props.selectedTab){
                return {
                    ...current,
                    rows: updatedRows,
                }
            }
            return current;
        })
        props.updateQuarters(updatedQuarters)
    };

    const deleteEntry = (index: number) => {
        const updatedEntries = [...initialEntries];
        updatedEntries.splice(index, 1);
        const updatedQuarters = props?.quarters?.map((current: { quarter: any; }) => {
            if (current?.quarter === props.selectedTab) {
                return {
                    ...current,
                    rows: updatedEntries,
                }
            }
            return current;
        })
        props.updateQuarters(updatedQuarters);
        if (expanded === index) {
            setExpanded(null);
        }
    };

    const toggleCollapse = (index: number) => {
        setExpanded(expanded === index ? null : index);
    };

    const handleInputChange = (index: number, key: keyof Entry, value: string) => {
        const updatedEntries = [...initialEntries];
        updatedEntries[index][key] = value;
        const updatedQuarters = props?.quarters?.map((current: { quarter: any; }) => {
            if (current?.quarter === props.selectedTab) {
                return {
                    ...current,
                    rows: updatedEntries,
                }
            }
            return current;
        })
        props.updateQuarters(updatedQuarters);
    };

    return (
        <div className='w-full  '>
            {initialEntries.map((entry, index) => (
                <div key={index} className="w-full shadow-md border p-2 rounded-lg mb-2">
                    <div className="flex justify-between items-center">
                        <button type="button" onClick={() => toggleCollapse(index)} className=" p-1 rounded">
                            {expanded === index ? '▼' : '▶'}
                        </button>
                        <h2 className="text-lg mr-auto font-bold">{entry.region}</h2>
                        <button type="button" onClick={() => deleteEntry(index)} className="bg-red-500 ml-auto text-white p-1 rounded ml-2">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-6 h-6"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M3 6h18M9 6v12a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V6M5 6l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M10 11v6M14 11v6" />
                            </svg>
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
                            value={entry.status}
                            onChange={(e) => handleInputChange(index, 'status', e.target.value)}
                            className="w-full mt-2 border rounded p-2"
                        />
                </div>
                    </div>
                </div>
            ))}
            <button type="button"
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={addEntry}
            >
                +
            </button>
        </div>
    );
};

export default CollapsibleForm;
