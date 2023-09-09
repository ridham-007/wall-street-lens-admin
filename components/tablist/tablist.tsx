import { useState } from 'react';

export interface TabProps {
    content: any;
    onTabChange: any;
    selectedTab: any;
}

const Tablist = (props: TabProps) => {
    const quarters = ['Quarter 1', 'Quarter 2', 'Quarter 3', 'Quarter 4'];

    const handleTabClick = (index: number) => {
        props?.onTabChange(index)
    };

    return (
        <div key={props.selectedTab} className="p-4 border-solid border-2 border-gray-100 rounded-md">
            <div className="flex space-x-2">
                {quarters.map((quarter, index) => (
                    <button
                        type="button"
                        key={index}
                        onClick={() => handleTabClick(index + 1)}
                        className={`px-4 py-2 ${(index + 1) === props.selectedTab
                                ? 'bg-gray-500 text-white'
                                : 'bg-white text-black-500 hover:bg-blue-100'
                            } rounded-md border-solid border-2 border-gray-200`}
                    >
                        {quarter}
                    </button>
                ))}
            </div>
            <div className="mt-4" key={props.selectedTab}>
                {props.content}
            </div>
        </div>
    );
};

export default Tablist;
