import { Key, SetStateAction, useEffect, useRef, useState } from "react";
import { TD, TDR, TH, THR } from "../../table";

export interface TableProps {
    data: any;
}

const SummaryDetails = (props: TableProps) => {
    const [isOpenAction, setIsOpenAction] = useState('');
    const [isOpen, setIsOpen] = useState<string | any>('');
    const ref = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
        const checkIfClickedOutside = (e: { target: any; }) => {
            if (isOpenAction && ref.current && !ref.current.contains(e.target)) {
                setIsOpenAction('')
            }
        }

        document.addEventListener("mousedown", checkIfClickedOutside)

        return () => {
            document.removeEventListener("mousedown", checkIfClickedOutside)
        }
    }, [isOpenAction])

    const toggleMenu = (id: Key | null | undefined) => {
        if (isOpenAction?.length) {
            setIsOpenAction('');
        } else {
            if(id){
                setIsOpenAction(id?.toString());
            }
        }
    };

    const tableData = props?.data?.getOutLookSummaryByCompany;

    const groupDataByYearAndQuarter = (data: any[]) => {
        const groupedData = data?.reduce((result, item) => {
            const year = item.year;
            const quarter = item.quarter;

            if (!result[year]) {
                result[year] = {};
            }

            if (!result[year][quarter]) {
                result[year][quarter] = [];
            }

            result[year][quarter].push(item);

            return result;
        }, {});

        const finalData = groupedData ? Object.keys(groupedData).map(year => ({
            year: parseInt(year),
            quarters: Object.keys(groupedData[year]).map(quarter => ({
                quarter: parseInt(quarter),
                data: groupedData[year][quarter]
            }))
        })): [];

        return finalData;
    }

    const finalData = groupDataByYearAndQuarter(tableData);

    return <>
        <div style={{
            maxHeight: 'calc(100vh - 200px)'
        }} className="w-[calc((w-screen)-(w-1/5)) overflow-scroll">
            <table className="app-table w-full">
                <thead className="w-full sticky top-0 z-20">
                    <THR>
                        <>
                            <TH></TH>
                            <TH>Company</TH>
                            <TH>Quarter</TH>
                            <TH>Year</TH>
                            <TH >Action</TH>
                        </>
                    </THR>
                </thead>

                <tbody className="w-full">
                    {finalData?.map((current) => {
                        const currentQuarters = current?.quarters;
                        return <><TDR key={currentQuarters[0]?.data[0]?.id}>
                        <>
                            <TD>
                                <>
                                    <button
                                        className="text-black text-[24px] px-4 py-2 rounded"
                                        onClick={() => setIsOpen(isOpen?.length > 0 ? '' : currentQuarters[0]?.data[0]?.id)}
                                    >
                                        {isOpen === currentQuarters[0]?.data[0]?.id ? '▼' : '▶'}
                                    </button>
                                </>
                            </TD>
                                <TD>{currentQuarters[0]?.data[0]?.company}</TD>
                                <TD>{currentQuarters[0]?.data[0]?.quarter}</TD>
                                <TD>{currentQuarters[0]?.data[0]?.year}</TD>
                            <TD style="text-center">
                                <>
                                    <button
                                        className=" inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            onClick={() => toggleMenu(currentQuarters[0]?.data[0]?.id)}
                                    >
                                        <svg className="w-6 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>

                                    </button>
                                        {((isOpenAction === currentQuarters[0]?.data[0]?.id) && (
                                        <div ref={ref} className="z-auto absolute right-[85px] mt-2   rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                                <a
                                                    // onClick={() => {}}
                                                    className="block px-4 py-2 text-sm  text-gray-700 hover:bg-gray-200 hover:text-gray-900 cursor-pointer" role="menuitem">Edit</a>
                                                <a
                                                    // onClick={() => { }}
                                                    className="block px-4 py-2 text-sm  text-gray-700 hover:bg-gray-200 hover:text-gray-900 cursor-pointer" role="menuitem">Delete</a>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            </TD>
                        </>
                    </TDR>
                        {
                            isOpen === currentQuarters[0]?.data[0]?.id && (
                                currentQuarters?.map((cur: { data: { id: string; company: string; quarter: string; year: string; }[]; }, index: number) => {
                                    if (index === 0) return <></>
                                    return <TDR key={cur?.data[0]?.id} >
                                        <>
                                            <TD></TD>
                                            <TD>{cur?.data[0]?.company}</TD>
                                            <TD>{cur?.data[0]?.quarter}</TD>
                                            <TD>{cur?.data[0]?.year}</TD>
                                            <TD style="text-center">
                                                <>
                                                    <button
                                                        className=" inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                                        onClick={() => toggleMenu(cur?.data[0]?.id)}
                                                    >
                                                        <svg className="w-6 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>

                                                    </button>
                                                    {((isOpenAction === cur?.data[0]?.id) && (
                                                        <div ref={ref} className="z-auto absolute right-[150px] mt-2   rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                                                <a
                                                                    // onClick={() => {}}
                                                                    className="block px-4 py-2 text-sm  text-gray-700 hover:bg-gray-200 hover:text-gray-900 cursor-pointer" role="menuitem">Edit</a>
                                                                <a
                                                                    // onClick={() => { }}
                                                                    className="block px-4 py-2 text-sm  text-gray-700 hover:bg-gray-200 hover:text-gray-900 cursor-pointer" role="menuitem">Delete</a>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </>
                                            </TD>
                                        </>
                                    </TDR>
                                })

                            )
                        }
                        </>
                    })}
                </tbody>
            </table>
        </div >
    </>
}

export default SummaryDetails;