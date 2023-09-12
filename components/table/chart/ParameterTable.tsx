import { Key, SetStateAction, useEffect, useRef, useState } from "react";
import { TD, TDR, TH, THR } from "../../table";
import { Modal } from "@/components/model";
import { DELETE_CHART_BY_ID } from "@/utils/query";
import { useMutation } from "@apollo/client";

export interface TableProps {
    data: any;
    refetch: any;
}

const ParameterTable = (props: TableProps) => {
    const [showDelete, setShowDelete] = useState(false);
    const [deleteId, setDeleteId] = useState('');
    const [isOpenAction, setIsOpenAction] = useState('');
    const [deleteChart] = useMutation(DELETE_CHART_BY_ID);
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
    const toggleMenu = (id: string | number | ((prevState: string) => string) | null | undefined) => {
        if (isOpenAction) {
            setIsOpenAction('');
        } else {
            if(id){
                setIsOpenAction(id?.toString());
            }
        }
    };

    const onDeleteChart = async (id: any) => {
        await deleteChart({
            variables: {
                chartId: id,
            }
        })
        props.refetch(true);
    }
    const tableData = props.data?.getChartsByKpiTerm;
    return <>
        <div style={{
            maxHeight: 'calc(100vh - 200px)'
        }} className="w-[calc((w-screen)-(w-1/5)) overflow-scroll">
            <table className="app-table w-full">
                <thead className="w-full sticky top-0 z-20">
                    <THR>
                        <>
                            <TH>NAME</TH>
                            <TH>TYPE</TH>
                            <TH>VISIBLE</TH>
                            <TH>TERM</TH>
                            <TH >Action</TH>
                        </>
                    </THR>
                </thead>

                <tbody className="w-full">
                    {tableData?.map((current: { id: ((prevState: string) => string) | Key | null | undefined; title: string | JSX.Element | undefined; type: string | JSX.Element | undefined; visible: any; }) => {
                        return <TDR key={current?.id}>
                            <>
                                <TD>{current?.title}</TD>
                                <TD>{current?.type}</TD>
                                <TD>{current?.visible ? 'Visible' :'Hidden'}</TD>
                                <TD>Financial Summary</TD>
                                <TD style="text-center">
                                    <>
                                        <button
                                            className=" inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            onClick={() => toggleMenu(current?.id)}
                                        >
                                            <svg className="w-6 h-4" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>

                                        </button>
                                        {((isOpenAction === current?.id) && (
                                            <div ref={ref} className="z-auto absolute right-[85px] mt-2   rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                                                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                                    <a
                                                        // onClick={() => {}}
                                                        className="block px-4 py-2 text-sm  text-gray-700 hover:bg-gray-200 hover:text-gray-900 cursor-pointer" role="menuitem">Edit</a>
                                                    <a
                                                        onClick={() => { setShowDelete(true); setDeleteId(current?.id)}}
                                                        className="block px-4 py-2 text-sm  text-gray-700 hover:bg-gray-200 hover:text-gray-900 cursor-pointer" role="menuitem">Delete</a>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                </TD>
                            </>
                        </TDR>
                    })
                }
                </tbody>
            </table>
        </div >
        {showDelete && <DeleteChart id={deleteId} onClose={() => { setDeleteId(''); setShowDelete(false) }} onSuccess={onDeleteChart}/>}
    </>
}

interface DeleteChartProps {
    onSuccess?: any;
    onClose?: any;
    id?: any;
}

function DeleteChart(props: DeleteChartProps) {
    const handleOnSave = () => {
        if (!props?.id) {
            // toast('Title is required', { hideProgressBar: false, autoClose: 7000, type: 'error' });
            return;
        }
        props.onSuccess && props.onSuccess(props?.id)
        props.onClose && props.onClose()
    };

    return (
        <Modal
            showModal={true}
            handleOnSave={handleOnSave}
            title="Delete a Term"
            onClose={() => props.onClose && props.onClose()}
        >
            <>
                <div>Are you sure you want to delete?</div>
            </>
        </Modal>
    );
}

export default ParameterTable;
