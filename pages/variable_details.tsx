import { SetStateAction, useEffect, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import Variable from "@/components/table/variables/Variable";
import Loader from "@/components/loader";
import "react-toastify/dist/ReactToastify.css";
import {
  CREATE_DEFAULT_MAPPING,
  DELTE_QUARTER,
  GET_TERMS_BY_COMPANY,
} from "@/utils/query";
import { useLazyQuery, useMutation } from "@apollo/client";
import { useRouter } from "next/router";
import YearDropdown from "@/components/year_dropdown/year_dropdown";
import { Modal } from "@/components/model";
import { ADD_QUARTER } from "@/utils/query";


interface KpiTerm {
  id: string;
  name: string;
  quarterWiseTable: boolean;
  summaryOnly: boolean;
  updatedAt: Date;
  company: string;
  __typename: string;
}

export default function VariableDetails() {
  const [termId, setTermId] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const [company, setCompany] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [editId,setEditId] = useState("");
  const [refetch, setRefetch] = useState(false);
  const [quarter, setQuarter] = useState("1");
  const [year, setYear] = useState("2023");
  const [showQuarter, setShowQuarter] = useState(false);
  const [addQuarter, { data: addQuarterData }] = useMutation(ADD_QUARTER);
  const [deleteQuarter] = useMutation(DELTE_QUARTER);
  const [updateQuarter, setUpdateQuater] = useState(false);
  const [defaultMapping] = useMutation(CREATE_DEFAULT_MAPPING);
  const [cellData, setCellData] = useState({});

  const [showDelete, setShowDelete] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const addDefaultMapping = async (id: any) => {
    await defaultMapping({
      variables: {
        termId: termId,
        quarterId: id,
      },
    });
  };

  useEffect(() => {
    if (updateQuarter && addQuarterData?.addUpdateQuarter?.id) {
      addDefaultMapping(addQuarterData?.addUpdateQuarter?.id);
    }
    setUpdateQuater(false);
  }, [addQuarterData]);

  const handleOnAddQuarter = async (val: { quarter: any; year: any }) => {
    setShowLoader(true);
    setUpdateQuater(true);
    await addQuarter({
      variables: {
        variableInfo: {
          quarter: Number(val.quarter),
          year: Number(val.year),
        },
        termId: termId,
      },
    });
    setShowLoader(false);
    setRefetch(true);
  };

  const handleOnDeleteQuarter = async () => {
    await deleteQuarter({
      variables: {
        quarterId: deleteId,
      },
    });
    setRefetch(true);
  };

  const handleOnEditQuarter = async () => {
    setRefetch(true);
  };

  

  const [getTermsDetails, { data: termsData }] = useLazyQuery(
    GET_TERMS_BY_COMPANY,
    {
      fetchPolicy: "network-only",
      variables: {
        companyId: company,
      },
    }
  );
  const router = useRouter();
  useEffect(() => {
    setCompany(router.query.company);
  }, [router.query]);

  useEffect(() => {
    if (company) {
      getTermsDetails();
    }
  }, []);

  useEffect(() => {
    if (termsData?.getKpiTermsByCompanyId?.length) {
      setTermId(termsData?.getKpiTermsByCompanyId[0].id);
    } else {
      setTermId("");
    }
  }, [termsData]);

  useEffect(() => {
    getTermsDetails();
  }, [company]);
  const selectedTerm = termsData?.getKpiTermsByCompanyId?.find(
    (cur: { id: string }) => cur.id === termId
  );

  return (
    <Layout title="Financial Summary" page={LayoutPages.variable_details}>
      <>
        {showLoader && <Loader />}
        <div className="flex justify-between gap-[20px]">
          <div className="flex  gap-[20px] ">
            <div className="flex flex-col mb-[20px]">
              <label
                htmlFor="quarter"
                className="text-sm font-bold text-gray-700"
              >
                KPIs Term:
              </label>
              <select
                id="quarter"
                name="term"
                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                value={termId}
                onChange={(event) => {
                  setTermId(event.target?.value);
                }}
              >
                {(termsData?.getKpiTermsByCompanyId ?? []).map(
                  (cur: KpiTerm) => {
                    return (
                      <option key={cur.id} value={cur?.id}>
                        {cur?.name}
                      </option>
                    );
                  }
                )}
              </select>
            </div>
            {(selectedTerm?.quarterWiseTable || selectedTerm?.summaryOnly) && (
              <>
                <div className="flex flex-row items-center gap-[20px] mb-[20px]">
                  <YearDropdown
                    onChange={(event: {
                      target: { value: SetStateAction<string> };
                    }) => {
                      setYear(event?.target.value);
                    }}
                    year={year}
                  />
                </div>
                <div className="flex flex-col mb-[20px]">
                  <label
                    htmlFor="quarter"
                    className="text-sm font-bold text-gray-700"
                  >
                    Quarter:
                  </label>
                  <select
                    id="quarter"
                    name="quarter"
                    className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                    value={quarter}
                    onChange={(event) => {
                      setQuarter(event.target?.value);
                    }}
                  >
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </div>
              </>
            )}
          </div>
          <div>
            {!selectedTerm?.quarterWiseTable && (
              <button
                type="button"
                className="bg-blue-500 hover:bg-blue-600 transform hover:scale-105 text-white font-medium rounded-lg py-3 px-3 inline-flex items-center space-x-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto h-[50px]"
                onClick={() => setShowQuarter(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ionicon w-7 h-7"
                  viewBox="0 0 512 512"
                >
                  <path
                    d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="32"
                  />
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="32"
                    d="M256 176v160M336 256H176"
                  />
                </svg>
                <span>Add a Quarter</span>
              </button>
            )}
            {selectedTerm?.quarterWiseTable && (
              <button
                type="button"
                className="bg-blue-500 hover:bg-blue-600 transform hover:scale-105 text-white font-medium rounded-lg ml-3 py-3 px-3 inline-flex items-center space-x-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 ml-auto h-[50px]"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="white"
                  viewBox="0 0 48 48"
                  width="28px"
                  height="28px"
                >
                  <path d="M 24 4 C 20.491685 4 17.570396 6.6214322 17.080078 10 L 10.238281 10 A 1.50015 1.50015 0 0 0 9.9804688 9.9785156 A 1.50015 1.50015 0 0 0 9.7578125 10 L 6.5 10 A 1.50015 1.50015 0 1 0 6.5 13 L 8.6386719 13 L 11.15625 39.029297 C 11.427329 41.835926 13.811782 44 16.630859 44 L 31.367188 44 C 34.186411 44 36.570826 41.836168 36.841797 39.029297 L 39.361328 13 L 41.5 13 A 1.50015 1.50015 0 1 0 41.5 10 L 38.244141 10 A 1.50015 1.50015 0 0 0 37.763672 10 L 30.919922 10 C 30.429604 6.6214322 27.508315 4 24 4 z M 24 7 C 25.879156 7 27.420767 8.2681608 27.861328 10 L 20.138672 10 C 20.579233 8.2681608 22.120844 7 24 7 z M 11.650391 13 L 36.347656 13 L 33.855469 38.740234 C 33.730439 40.035363 32.667963 41 31.367188 41 L 16.630859 41 C 15.331937 41 14.267499 40.033606 14.142578 38.740234 L 11.650391 13 z M 20.476562 17.978516 A 1.50015 1.50015 0 0 0 19 19.5 L 19 34.5 A 1.50015 1.50015 0 1 0 22 34.5 L 22 19.5 A 1.50015 1.50015 0 0 0 20.476562 17.978516 z M 27.476562 17.978516 A 1.50015 1.50015 0 0 0 26 19.5 L 26 34.5 A 1.50015 1.50015 0 1 0 29 34.5 L 29 19.5 A 1.50015 1.50015 0 0 0 27.476562 17.978516 z" />
                </svg>
                <span>Delete Quarter</span>
              </button>
            )}
          </div>
        </div>
        {!!termId && (
          <Variable
            termId={termId}
            year={year}
            quarter={quarter}
            selectedTerm={selectedTerm}
            setShowDelete={setShowDelete}
            setShowEdit={setShowEdit}
            setDeleteId={setDeleteId}
            refetch={refetch}
            setEditId={setEditId}
          />
        )}
        {showQuarter && (
          <QuarterData
            onSuccess={handleOnAddQuarter}
            onClose={() => {
              setShowQuarter(false);
            }}
          />
        )}
        {showDelete && (
          <DeleteVariable
            onSuccess={handleOnDeleteQuarter}
            onClose={() => {
              setShowDelete(false);
            }}
          />
        )}
        {showEdit && (
          <EditVariable
            cellData={cellData}
            onSuccess={handleOnEditQuarter}
            onClose={() => {
              setShowEdit(false);
            }}
          />
        )}
      </>
    </Layout>
  );
}


interface QuarterDataProps {
  onSuccess?: any;
  onClose?: any;
  data?: any;
}

function QuarterData(props: QuarterDataProps) {
  const [val, setVal] = useState({
    quarter: "1",
    year: "2023",
  });

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    const name = e.target.name;

    setVal((prevVal) => ({
      ...prevVal,
      [name]: value
    }));
  };

  const handleOnSave = () => {
    if (!val.quarter || !val.year) {
      return;
    };
    props.onSuccess && props.onSuccess(val);
    props.onClose && props.onClose();
  }

  return (
    <Modal
      showModal={true}
      handleOnSave={handleOnSave}
      title="Quarter Data"
      onClose={() => props.onClose && props.onClose()}
    >
      <>
        <form className="form w-100">
          <div className="grid gap-4">
            <div className="flex flex-row gap-5">
              <div className="flex flex-row items-center gap-[20px] mb-[20px]">
                <YearDropdown onChange={handleOnChange} year={val.year} />
              </div>
              <div className="flex flex-col mb-[20px]">
                <label
                  htmlFor="quarter"
                  className="text-sm font-bold text-gray-700"
                >
                  Quarter:
                </label>
                <select
                  id="quarter"
                  name="quarter"
                  className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                  value={val.quarter}
                  onChange={handleOnChange}
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </div>
            </div>
          </div>
        </form>
      </>
    </Modal>
  );
}

interface DeleteVariableProps {
  onSuccess?: any;
  onClose?: any;
  id?: any;
}

function DeleteVariable(props: DeleteVariableProps) {
  const handleOnSave = () => {
    props.onSuccess && props.onSuccess();
    props.onClose && props.onClose();
  };

  return (
    <Modal
      showModal={true}
      handleOnSave={handleOnSave}
      title="Delete a Quarter"
      onClose={() => props.onClose && props.onClose()}
      confirmButton="Delete"
    >
      <>
        <div>Are you sure you want to delete?</div>
      </>
    </Modal>
  );
}

interface EditVariableProps {
  onSave?: any;
  onClose?: any;
  cellData?: any;
  selectedColumn?: any;
  onSuccess?: any;
}

function EditVariable(props: EditVariableProps) {
 
  const handleOnSave = async () => {
    if (!!props.onSave) {
      props.onSave(
        props.cellData.id,
        props.cellData.groupKey,
        props?.cellData?.quarterId,
        props?.cellData?.termId,
        props?.cellData?.variableId
      );
    }
  };

  const [selectedOption, setSelectedOption] = useState("option1"); // Default selected option

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
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
                Colum Background:
              </label>
          </div>
          <div className="mt-5">
              <label className="mr-3">
                <input
                  type="radio"
                  name="options"
                  value="option1"
                  checked={selectedOption === "option1"}
                  onChange={handleOptionChange}
                  className="m-1"
                />
                Red
              </label>

              <label>
                <input
                  type="radio"
                  name="options"
                  value="option2"
                  checked={selectedOption === "option2"}
                  onChange={handleOptionChange}
                  className="m-1"
                />
                Green
              </label>
            </div>
        </form>
      </>
    </Modal>
  );
}
