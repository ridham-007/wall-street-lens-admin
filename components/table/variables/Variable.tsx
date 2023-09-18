import { useEffect, useState } from "react";
import { TD, TDR, TH, THR } from "../../table";
import { Modal } from "@/components/model";
import Loader from "@/components/loader";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_VIEW_FOR_TERM, UPDATE_MAPPED_VALUE } from "@/utils/query";


export interface TableProps {
  termId: string;
  selectedTerm: any;
  year: string;
  quarter: string;
  setShowDelete: any;
  setDeleteId: any;
  refetch: boolean
}

export interface Row {
  title: string;
  cells: Cell[];
}

export interface Cell {
  id: string;
  value: string;
  year: number;
  quarter: number;
  groupKey: string;
  quarterId: string;
  termId: string;
  variableId: string;
}

export default function Variable({ termId, refetch, selectedTerm, year, quarter, setShowDelete, setDeleteId }: TableProps) {
  const [getTermView, { data: termView, refetch: refetchTermView }] =
    useLazyQuery(GET_VIEW_FOR_TERM, {
      fetchPolicy: 'network-only',
      variables: {
        termId: termId,
        ...(
          (selectedTerm?.quarterWiseTable || selectedTerm?.summaryOnly) && {
            quarter: Number(quarter),
            year: Number(year),
          })
      },
    });

  useEffect(() => {
    getTermView();
  }, [termId])

  useEffect(() => {
    refetchTermView();
  }, [year, quarter, refetch])

  const [show, setShow] = useState(false);
  const [cellData, setCellData] = useState({});
  const [showLoader, setShowLoader] = useState(false);

  const [updateValue] = useMutation(UPDATE_MAPPED_VALUE);
  const { headers = [], rows = [] }: { headers: any; rows: Row[] } =
    termView?.getViewForTerm || {};

  const checkValidId = (id: string) => {
    return !!id && !id.startsWith('Dummy')
  }

  const onSave = async (
    id: string,
    value: string,
    groupKey: string,
    quarterId: string,
    termId: string,
    variableId: string,
  ) => {
    setShowLoader(true);
    await updateValue({
      variables: {
        mappingInfo: {
          ...(checkValidId(id) && { id }),
          value: value,
          groupKey: groupKey,
        },
        ...(!checkValidId(id) && {
          quarterId: quarterId,
          termId: termId,
          variableId: variableId,
        }),
      },
    });
    setShowLoader(false);
    setShow(false);
    refetchTermView();
  };

  useEffect(() => {
    getTermView();
  }, []);

  const handleShowDelete = (identifier: any) => {
    setShowDelete(true);
    setDeleteId(identifier);
  }

  return (
    <>
      {showLoader && (<Loader />)}
      <div
        style={{
          maxHeight: "calc(100vh - 200px)",
        }}
        className="w-[calc((w-screen)- (w-1/5)) overflow-scroll"
      >
        {!selectedTerm?.summaryOnly && (<table className="app-table w-full">
          <thead className="w-full sticky top-0 z-20">
            <THR>
              <>
                {!selectedTerm?.quarterWiseTable ? <TH>KPI Variable</TH> : <TH>Year</TH>}
                {headers?.map((current: any) => {
                  return <TH key={current.id} ><div className="flex">{current.name}
                    {!selectedTerm?.quarterWiseTable && (
                      <span className="px-2 cursor-pointer" onClick={() => { handleShowDelete(current.id) }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px">
                          <path d="M 24 4 C 20.491685 4 17.570396 6.6214322 17.080078 10 L 10.238281 10 A 1.50015 1.50015 0 0 0 9.9804688 9.9785156 A 1.50015 1.50015 0 0 0 9.7578125 10 L 6.5 10 A 1.50015 1.50015 0 1 0 6.5 13 L 8.6386719 13 L 11.15625 39.029297 C 11.427329 41.835926 13.811782 44 16.630859 44 L 31.367188 44 C 34.186411 44 36.570826 41.836168 36.841797 39.029297 L 39.361328 13 L 41.5 13 A 1.50015 1.50015 0 1 0 41.5 10 L 38.244141 10 A 1.50015 1.50015 0 0 0 37.763672 10 L 30.919922 10 C 30.429604 6.6214322 27.508315 4 24 4 z M 24 7 C 25.879156 7 27.420767 8.2681608 27.861328 10 L 20.138672 10 C 20.579233 8.2681608 22.120844 7 24 7 z M 11.650391 13 L 36.347656 13 L 33.855469 38.740234 C 33.730439 40.035363 32.667963 41 31.367188 41 L 16.630859 41 C 15.331937 41 14.267499 40.033606 14.142578 38.740234 L 11.650391 13 z M 20.476562 17.978516 A 1.50015 1.50015 0 0 0 19 19.5 L 19 34.5 A 1.50015 1.50015 0 1 0 22 34.5 L 22 19.5 A 1.50015 1.50015 0 0 0 20.476562 17.978516 z M 27.476562 17.978516 A 1.50015 1.50015 0 0 0 26 19.5 L 26 34.5 A 1.50015 1.50015 0 1 0 29 34.5 L 29 19.5 A 1.50015 1.50015 0 0 0 27.476562 17.978516 z" /></svg>
                      </span>
                    )}
                  </div>
                  </TH>;
                })}
              </>
            </THR>
          </thead>
          <tbody className="w-full">
            {rows.map((current, index) => {
              return (
                <TDR key={index}>
                  <>
                    {!selectedTerm?.quarterWiseTable ? <TD>{current.title ?? ""}</TD> : <TD>{year}</TD>}

                    {current.cells.map((cur) => {
                      return (
                        <TD
                          style="cursor-pointer"
                          onClick={() => {
                            setShow(true);
                            setCellData({
                              id: cur.id,
                              value: cur.value,
                              title: current.title,
                              year: cur.year,
                              quarter: cur.quarter,
                              groupKey: cur.groupKey,
                              quarterId: cur.quarterId,
                              termId: cur.termId,
                              variableId: cur.variableId
                            });
                          }}
                          key={cur.id}
                        >
                          {cur?.value}
                        </TD>
                      );
                    })}
                  </>
                </TDR>
              );
            })}
          </tbody>
        </table>)}
        {/* {selectedTerm.summaryOnly && {

        }} */}
        {show && (
          <AddUpdateParaMeter
            onClose={() => setShow(false)}
            onSave={onSave}
            cellData={cellData}
          />
        )}
      </div>
    </>
  );
}

interface AddUpdateParameterProps {
  onSave?: any;
  onClose?: any;
  cellData?: any;
}

function AddUpdateParaMeter(props: AddUpdateParameterProps) {
  const [val, setVal] = useState(props.cellData?.value);
  const handleOnSave = async () => {
    if (!!props.onSave) {
      props.onSave(
        props.cellData.id,
        val,
        props.cellData.groupKey,
        props?.cellData?.quarterId,
        props?.cellData?.termId,
        props?.cellData?.variableId,
      );
    }
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setVal(value);
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
            <label htmlFor="value" className="text-lg font-bold text-gray-700">
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
