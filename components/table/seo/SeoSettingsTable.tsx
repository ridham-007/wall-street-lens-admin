import { Key, useEffect, useRef, useState } from "react";
import { TD, TDR, TH, THR } from "../../table";
import { TableProps } from "@/utils/data"
import 'react-toastify/dist/ReactToastify.css';

export interface SeoSettingsTableProps {
    metadata: data[]
}
export interface data {
    id: string,
    term: string,
    title: string,
    description: string,
}
const SeoSettingsTable = (props: SeoSettingsTableProps) => {

    return <>

        <div style={{
            maxHeight: 'calc(100vh - 200px)'
        }} className="w-[calc((w-screen)-(w-1/5)) overflow-scroll">
            <table className="app-table w-full">
                <thead className="w-full sticky top-0 z-20">
                    <THR>
                        <>
                            <TH>Term</TH>
                            <TH>Title</TH>
                            <TH>Description</TH>
                            <TH>Key word</TH>
                        </>
                    </THR>
                </thead>

                <tbody className="w-full">

                    <>
                        {props?.metadata?.map((data: data) => {
                            return (
                                <TDR key={data.id}>
                                    <>
                                        <TD>{data.term}</TD>
                                        <TD>{data.title}</TD>
                                        <TD>{data.description}</TD>
                                    </>
                                </TDR>
                            )
                        })}

                    </>

                </tbody>
            </table>
        </div >

    </>
}


export default SeoSettingsTable;
