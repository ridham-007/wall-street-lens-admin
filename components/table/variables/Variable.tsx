import { Key, useState } from "react";
import { Key } from "react";
import { TD, TDR, TH, THR } from "../../table";
import { Modal } from "@/components/model";

export interface TableProps {
    data: any,
}

export default function Variable(props: TableProps) {
    const [show, setShow] = useState(false);
    const [cellData, setCellData] = useState({}); 
    const {
        headers,
        rows
    } = props.data?.getViewForTerm || {};
    return (
        <div style={{
            maxHeight: 'calc(100vh - 200px)'
        }} className="w-[calc((w-screen)- (w-1/5)) overflow-scroll">
            <table className="app-table w-full">
                <thead className="w-full sticky top-0 z-20">
                    <THR>
                        <>
                           <TH>Title</TH>
                            {headers?.map((current: any) => {
                                return <TH key={current}>{current}</TH>
                            })} 
                        </>
                    </THR>
                </thead>
                <tbody className="w-full">
                    {rows?.map((current: { title: JSX.Element | Key | null | undefined; cells: any[]; value: string | JSX.Element | undefined; }, index) => {
                        return <TDR key={index}>
                            <>
                                <TD>{current?.title || ''}</TD>
                                {current?.cells?.map((cur: { id: Key | null | undefined; }) => {
                                    return <TD onClick={() => {
                                        setShow(true);
                                        setCellData({
                                            id: cur?.id,
                                            value: cur?.value,
                                            title: current?.title,
                                            year: cur?.year,
                                            quarter: cur?.quarter,
                                        })
                                    }}key={cur?.id}>{cur?.value}</TD>
                                })}
                            </>
                        </TDR>
                    })}
                </tbody>
            </table>
            {show && (<AddUpdateParaMeter onClose={() => setShow(false)} cellData={cellData}/>)}
        </div>
    )
}

interface AddUpdateParameterProps {
    onSuccess?: any;
    onClose?: any;
    cellData?: any;
}


function AddUpdateParaMeter(props: AddUpdateParameterProps) {
    const [val, setVal] = useState(props.cellData?.value)
    const handleOnSave = () => {
        if (!val.title) {
            // toast('Title is required', { hideProgressBar: false, autoClose: 7000, type: 'error' });
            return;
        }
        props.onSuccess && props.onSuccess(val)
        props.onClose && props.onClose()
    };

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setVal(value)
    };



    return (
        <Modal
            showModal={true}
            handleOnSave={handleOnSave}
            title={props.cellData?.title}
            onClose={() => props.onClose && props.onClose()}
        >
            <>
                <form className="form w-100">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-[20px]">
                            <label
                                htmlFor="title"
                                className="text-lg font-bold text-gray-700"
                            >
                                Year:
                            </label>
                            <div>{props.cellData?.year}</div>
                        </div>
                        <div className="flex items-center gap-[20px]">
                            <label
                                htmlFor="title"
                                className="text-lg font-bold text-gray-700"
                            >
                                Quarter:
                            </label>
                            <div>{props.cellData?.quarter}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-[20px] mt-[20px]">
                        <label
                            htmlFor="value"
                            className="text-lg font-bold text-gray-700"
                        >
                            Value:
                        </label>
                        <input
                            type="text"
                            id="value"
                            name="value"
                            value={val}
                            onChange={handleOnChange}
                            required
                            className="w-full mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                    </div>
                </form>
            </>
        </Modal>
    );
}