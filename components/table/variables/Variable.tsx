import { Key } from "react";
import { Key } from "react";
import { TD, TDR, TH, THR } from "../../table";

export interface TableProps {
    data: any,
}

export default function Variable(props: TableProps) {
    console.log({ props });
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
                    {rows?.map((current: { title: JSX.Element | Key | null | undefined; cells: any[]; value: string | JSX.Element | undefined; }) => {
                        return <TDR key={current?.title}>
                            <>
                                <TD>{current?.title || ''}</TD>
                                {current?.cells?.map((cur: { id: Key | null | undefined; }) => {
                                    return <TD key={cur?.id}>{cur?.value}</TD>
                                })}
                            </>
                        </TDR>
                    })}
                </tbody>
            </table>
        </div>
    )
}