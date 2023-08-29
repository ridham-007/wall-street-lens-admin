import { useEffect, useRef, useState } from "react";
import { TD, TDR, TH, THR } from "../table";

const ParameterTable = () => {
    const [isOpenAction, setIsOpenAction] = useState(false);
    const ref = useRef<HTMLInputElement | null>(null);
    useEffect(() => {
        const checkIfClickedOutside = (e: { target: any; }) => {
            if (isOpenAction && ref.current && !ref.current.contains(e.target)) {
                setIsOpenAction(false)
            }
        }

        document.addEventListener("mousedown", checkIfClickedOutside)

        return () => {
            document.removeEventListener("mousedown", checkIfClickedOutside)
        }
    }, [isOpenAction])
    const toggleMenu = () => {
        if (isOpenAction) {
            setIsOpenAction(false);
        } else {
            setIsOpenAction(true);
        }
    };
    return <>
        <div style={{
            maxHeight: 'calc(100vh - 200px)'
        }} className="w-[calc((w-screen)-(w-1/5)) overflow-scroll">
            <table className="app-table w-full">
                <thead className="w-full sticky top-0 z-20">
                    <THR>
                        <>
                            <TH>Company</TH>
                            <TH>title</TH>
                            <TH>unit</TH>
                            <TH>Visible to chart</TH>
                            <TH>Updated At</TH>
                            <TH>Action</TH>
                        </>
                    </THR>
                </thead>

                <tbody className="w-full">
                    <TDR >
                        <TD>
                            <>
                                <button
                                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    onClick={() => toggleMenu()}
                                >
                                    <svg className="w-6 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                                    {(isOpenAction && (
                                        <div ref={ref} className="z-50 absolute right-0 top-3 mt-2   rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                            <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                                <a
                                                    // onClick={() => {}}
                                                    className="block px-4 py-2 text-sm  text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer" role="menuitem">Edit</a>
                                                <a
                                                    // onClick={() => { }}
                                                    className="block px-4 py-2 text-sm  text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer" role="menuitem">Delete</a>
                                            </div>
                                        </div>
                                    ))}
                                </button>

                            </>
                        </TD>
                    </TDR>
                </tbody>
            </table>
        </div >
    </>
}
export default ParameterTable;
