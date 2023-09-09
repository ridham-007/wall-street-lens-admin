import { TH, THR } from "../../table";

export default function Variable() {
    return (
        <div style={{
            maxHeight: 'calc(100vh - 200px)'
        }} className="w-[calc((w-screen)- (w-1/5)) overflow-scroll">
            <table className="app-table w-full">
                <thead className="w-full sticky top-0 z-20">
                    <THR>
                        <>
                           <TH>Company</TH> 
                           <TH>Quarter</TH>
                           <TH>Year</TH>
                           <TH>Actions</TH>
                        </>
                    </THR>
                </thead>
            </table>
        </div>
    )
}