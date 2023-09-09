import { useState } from 'react';

type Entry = {
    GrowthRate: string;
    Production: string;
};

export interface FormProps {
    updateQuarters: any;
    selectedTab: any;
    quarters: any;
}

const CollapsibleUI = (props: FormProps) => {

    const initialEntries = [...props?.quarters?.find((current: { quarter: any; }) => current?.quarter === props?.selectedTab)?.rows];

    const [openIndices, setOpenIndices] = useState<number[]>([]);

    const addEntry = () => {
        const updatedRows = [...initialEntries, { growthRate: '', production: '' }];
        const updatedQuarters = props?.quarters?.map((current: { quarter: any; }) => {
            if (current?.quarter === props.selectedTab) {
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
    };

    const toggleEntry = (index: number) => {
        if (openIndices.includes(index)) {
            // Entry is open, close it
            setOpenIndices(openIndices.filter((i) => i !== index));
        } else {
            // Entry is closed, open it
            setOpenIndices([...openIndices, index]);
        }
    };

    const isEntryOpen = (index: number) => openIndices.includes(index);

    const handleInputChange = (
        index: number,
        field: keyof Entry,
        value: string
    ) => {
        const updatedEntries = [...initialEntries];
        updatedEntries[index][field] = value;
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
        <div className='mt-5'>
            {initialEntries.map((entry, index) => (
                <div key={index + 1} className="border p-4 mb-4 rounded-lg shadow-md">
                    <button type="button"
                        className="float-right  bg-red-500 ml-auto text-white p-1 rounded ml-2"
                        onClick={() => deleteEntry(index)}
                    >
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
                    <div
                        className="cursor-pointer"
                        onClick={() => toggleEntry(index)}
                    >
                        <div className="flex items-center">
                            <span className="mr-2">
                                {isEntryOpen(index) ? '▼' : '▶'}
                            </span>
                            <h2 className="text-xl font-semibold">Growth Rate and Production {index + 1}</h2>
                        </div>
                    </div>
                    {isEntryOpen(index) && (
                        <div>
                            <div className="mt-4 mb-4">
                                <input
                                    placeholder='Growth Rate'
                                    type="text"
                                    id={`GrowthRate${index}`}
                                    className="ml-2 border rounded p-1 w-full"
                                    value={entry.GrowthRate}
                                    onChange={(e) =>
                                        handleInputChange(index + 1, 'GrowthRate', e.target.value)
                                    }
                                />
                            </div>
                            <div>
                                <input
                                    placeholder='Production'
                                    type="text"
                                    id={`Production${index}`}
                                    className="ml-2 border rounded p-1 w-full"
                                    value={entry.Production}
                                    onChange={(e) =>
                                        handleInputChange(index + 1, 'Production', e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    )}
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

export default CollapsibleUI;
