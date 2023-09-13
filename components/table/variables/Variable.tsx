import { Key, useEffect, useState } from "react";
import { TD, TDR, TH, THR } from "../../table";
import { Modal } from "@/components/model";
import { useLazyQuery, useMutation } from "@apollo/client";
import { GET_VIEW_FOR_TERM, UPDATE_MAPPED_VALUE } from "@/utils/query";

export interface TableProps {
  termId: string;
  selectedTerm: string;
  year: string;
  quarter: string;
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

export default function Variable({ termId, selectedTerm, year, quarter }: TableProps) {
  const [getTermView, { data: termView, refetch: refetchTermView }] =
    useLazyQuery(GET_VIEW_FOR_TERM, {
      variables: {
        termId: termId,
        ...(
          selectedTerm?.quarterWiseTable && {
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
    }, [year, quarter])

  const [show, setShow] = useState(false);
  const [cellData, setCellData] = useState({});
  const [updateValue] = useMutation(UPDATE_MAPPED_VALUE);
  const { headers = [], rows = [] }: { headers: string[]; rows: Row[] } =
    termView?.getViewForTerm || {};

  const checkValidId = (id: string) => {
    return !!id && !id.startsWith('Dummy')
  }
  const onSave = async (
    id: string, 
    value: string, 
    groupKey:string,
    quarterId: string,
    termId: string,
    variableId: string,
    ) => {
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
    setShow(false);
    refetchTermView();
  };

  useEffect(() => {
    getTermView();
  }, []);

  return (
    <div
      style={{
        maxHeight: "calc(100vh - 200px)",
      }}
      className="w-[calc((w-screen)- (w-1/5)) overflow-scroll"
    >
      <table className="app-table w-full">
        <thead className="w-full sticky top-0 z-20">
          <THR>
            <>
              {!selectedTerm?.quarterWiseTable && <TH>KPI Variable</TH>}
              {headers?.map((current: any) => {
                return <TH key={current}>{current}</TH>;
              })}
            </>
          </THR>
        </thead>
        <tbody className="w-full">
          {rows.map((current, index) => {
            return (
              <TDR key={index}>
                <>
                  {!selectedTerm?.quarterWiseTable && <TD>{current.title ?? ""}</TD>}
                  
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
      </table>
      {show && (
        <AddUpdateParaMeter
          onClose={() => setShow(false)}
          onSave={onSave}
          cellData={cellData}
        />
      )}
    </div>
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
