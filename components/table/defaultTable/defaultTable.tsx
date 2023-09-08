import { useEffect, useState } from "react";
import { TD, TDR, TH, THR } from "../../table";

export interface TableProps {
    headers: string[];
    data: any[];
}

const DefaultTable = (props: TableProps) => {
    const [isOpenAction, setIsOpenAction] = useState<string | null>(null);

    useEffect(() => {
        const checkIfClickedOutside = (e: MouseEvent) => {
            if (isOpenAction && !e.target) {
                setIsOpenAction(null);
            }
        };

        document.addEventListener("mousedown", checkIfClickedOutside);

        return () => {
            document.removeEventListener("mousedown", checkIfClickedOutside);
        };
    }, [isOpenAction]);

    return (
        <>
            <div
                style={{
                    maxHeight: "calc(100vh - 200px)",
                }}
                className="w-[calc((w-screen)-(w-1/5)) overflow-scroll"
            >
                <table className="app-table w-full">
                    <thead className="w-full sticky top-0 z-20">
                        <THR>
                            {props.headers.map((header) => (
                                <TH key={header}>{header}</TH>
                            ))}
                            <TH>Actions</TH>
                        </THR>
                    </thead>

                    <tbody className="w-full">
                        {props.data.map((current: any, index: number) => (
                            <TDR key={index}>
                                {props.headers.map((header) => (
                                    <TD key={header}>{current[header]}</TD>
                                ))}
                                <TD style={{ textAlign: "center" }}>
                                    <button
                                        className=" inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        onClick={() => setIsOpenAction(isOpenAction === current.id ? null : current.id)}
                                    >
                                        <svg
                                            className="w-6 h-4"
                                            aria-hidden="true"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 0100-4 2 2 0 0100-4 2 2 0 0100-4 2 2 0 0100-4zM10 18a2 2 0 110-4 2 2 0 010 4z"
                                            ></path>
                                        </svg>
                                    </button>
                                    {isOpenAction === current.id && (
                                        <div
                                            className="z-auto absolute right-[85px] mt-2 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                                        >
                                            <div
                                                className="py-1"
                                                role="menu"
                                                aria-orientation="vertical"
                                                aria-labelledby="options-menu"
                                            >
                                                <a
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900 cursor-pointer"
                                                    role="menuitem"
                                                >
                                                    Edit
                                                </a>
                                                <a
                                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:text-gray-900 cursor-pointer"
                                                    role="menuitem"
                                                >
                                                    Delete
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </TD>
                            </TDR>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default DefaultTable;
