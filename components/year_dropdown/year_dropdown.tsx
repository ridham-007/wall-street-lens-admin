import React from 'react';

export interface DropdownProps {
    onChange: any;
    year: string;
}

const YearDropdown = (props: DropdownProps) => {
    // Create an array of years, e.g., from 1900 to the current year
    let years = Array.from({ length: new Date().getFullYear() - 2009 }, (_, index) => 2010 + index);
    years = years.reverse();
    return (
        <div className="flex flex-col relative" max-h-40 overflow-y-auto>
            <label htmlFor="year" className="text-sm font-bold text-gray-700">
                Select a Year:
            </label>
            <select
            name='year'
            onChange={props.onChange}
            value={props.year} 
            className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
        >              
        <option value="">Select a option</option>
            {years.map((year) => (
                <option key={year} value={year}>
                    {year}
                </option>
            ))}
        </select>
        </div>
    );
};

export default YearDropdown;
