import { useState } from 'react';

export interface TabProps {
    content: any;
}

const Tablist = (props: TabProps) => {
    const quarters = ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'];
    const [activeTab, setActiveTab] = useState(0);

    const handleTabClick = (index: number) => {
        setActiveTab(index);
    };

    return (
        <div className="p-4 border-solid border-2 border-gray-100 rounded-md">
            <div className="flex space-x-2">
                {quarters.map((quarter, index) => (
                    <button
                        type="button"
                        key={index}
                        onClick={() => handleTabClick(index)}
                        className={`px-4 py-2 ${index === activeTab
                                ? 'bg-gray-500 text-white'
                                : 'bg-white text-black-500 hover:bg-blue-100'
                            } rounded-md border-solid border-2 border-gray-200`}
                    >
                        {quarter}
                    </button>
                ))}
            </div>
            <div className="mt-4" key={activeTab}>
                {props.content}
            </div>
        </div>
    );
};

export default Tablist;
