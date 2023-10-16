import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactFragment,
  ReactPortal,
  useEffect,
  useState,
} from "react";
import Layout, { LayoutPages } from "@/components/layout";
import VariableTable from "@/components/table/variables/VariableTable";
import "react-toastify/dist/ReactToastify.css";
import { useLazyQuery, useMutation } from "@apollo/client";
import {
  ADD_UPDATE_MASTER_VERIABLE,
  GET_COMPANIES,
  GET_INDUSTRIES,
  GET_MAPPING_VIEW,
  GET_SUB_INDUSTRIES,
  GET_TERMS_BY_COMPANY,
  GET_VARIBALES_KPI_TERM,
} from "@/utils/query";
import { useRouter } from "next/router";
import { DeleteVariableProps } from "@/utils/data";
import AccordionItem from "@/components/Accordian";
import { AddUpdateParameterProps } from "@/utils/data";
import { Modal } from "@/components/model";

export default function FinancialPage() {
    const [show, setShow] = useState(false);
    const [industry, setIndustry] = useState('all');
    const [subIndustry, setSubIndustry] = useState('all');
    const [company, setCompany] = useState('all');
    const [filterData, setFilterData] = useState([]);
    const [showDelete, setShowDelete] = useState(false);
    const [deleteId, setDeleteId] = useState("");
  
  const router = useRouter();

  const [getCompanies, { data: companies }] = useLazyQuery(GET_COMPANIES, {
    fetchPolicy: "network-only",
  });

    const [getIndustries, { data: industries }] = useLazyQuery(GET_INDUSTRIES, {
        fetchPolicy: "network-only",
    });

    const [getSubIndustries, { data: subIndustries }] = useLazyQuery(
        GET_SUB_INDUSTRIES,
        {
            fetchPolicy: "network-only",
        }
    );

    useEffect(() => {
        getCompanies();
        getIndustries();
        getSubIndustries();
    }, []);

    const [addUpdateMasterVariable] = useMutation(ADD_UPDATE_MASTER_VERIABLE);
    const [getVariablesMapping, { data: masterVariables, refetch: refetchMasterVariables }] = useLazyQuery(
        GET_MAPPING_VIEW,
    );

    useEffect(() => {
        const filteredData = masterVariables?.getMappingView?.map((item: { mapping: any[]; }) => {
            const validMappings = item?.mapping?.filter((mappingItem: { company: string; industry: string; subIndustry: string; }) => {
                return (
                    (mappingItem.company === company || company === 'all') &&
                    (mappingItem.industry === industry || industry === 'all') &&
                    (mappingItem.subIndustry === subIndustry || subIndustry === 'all')
                );
            }) || [];

            return {
                ...item,
                mapping: validMappings,
                showFilter: validMappings?.length > 0 || (item?.mapping?.length === 0 && company === 'all' && industry === 'all' && subIndustry === 'all')
            };
        }).filter((item: { mapping: string | any[]; showFilter: boolean }) => item.showFilter);
        setFilterData(filteredData);
    }, [company, industry, subIndustry, masterVariables])

    const onAddUpdateQuarter = async (perameters: any) => {
        await addUpdateMasterVariable({
            variables: {
                variableInfo: {
                    id: perameters?.id,
                    title: perameters?.name,
                },
            }
        });
        refetchMasterVariables();
    }

  useEffect(() => {
    getCompanies();
    getIndustries();
    getSubIndustries();
  }, []);

    useEffect(() => {
        getVariablesMapping();
    }, []);

    const getContent = (data: any) => {
        return <VariableTable
            data={data}
            companies={companies?.getCompanies || []}
            industries={industries?.getIndustries || []}
            subIndustries={subIndustries?.getSubIndustries || []}
        />
    }

    const handleShowDelete = (identifier: any) => {

        setShowDelete(true);
        setDeleteId(identifier);
       console.log(filterData[2].masterVariable.id,"gggggggg")
       
      };


    return (
        <Layout title="Veriables" page={LayoutPages.variables}>
            <>
                <div className="flex items-center gap-[20px] justify-between">
                    <div
                        className="w-full flex justify-start mb-[20px] gap-[10px]"
                    >
                        <div className="flex flex-col items-start">
                            <label
                                htmlFor="quarter"
                                className="text-sm font-bold text-gray-700 text-left"
                            >
                                Industries:
                            </label>
                            <select
                                id="quarter"
                                name="term"
                                className="w-[200px] mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                                value={industry}
                                onChange={(event) => {
                                    setIndustry(event.target?.value);
                                }}
                            >
                                <option value="all">ALL</option>
                                {(industries?.getIndustries ?? []).map(
                                    (cur: { id: string; attributes: { name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined; }; }) => {
                                        return (
                                            <option key={cur.id} value={cur?.id}>
                                                {cur?.attributes?.name}
                                            </option>
                                        );
                                    }
                                )}
                            </select>
                        </div>

                        <div className="flex flex-col items-start">
                            <label
                                htmlFor="quarter"
                                className="text-sm font-bold text-gray-700"
                            >
                                Company:
                            </label>
                            <select
                                id="quarter"
                                name="term"
                                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none w-[200px]"
                                value={company}
                                onChange={(event) => {
                                    setCompany(event.target?.value);
                                }}
                            >
                                <option value="all">ALL</option>
                                {(companies?.getCompanies ?? []).map(
                                    (cur: { id: string; attributes: { name: string | number | boolean | ReactElement<any, string | JSXElementConstructor<any>> | ReactFragment | ReactPortal | null | undefined; }; }) => {
                                        return (
                                            <option key={cur.id} value={cur?.id}>
                                                {cur?.attributes?.name}
                                            </option>
                                        );
                                    }
                                )}
                            </select>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-[20px] justify-between">
                    <div
                        className="w-full flex justify-start mb-[20px]"
                    >
                        <button
                            type="button"
                            className="bg-blue-500 hover:bg-blue-600 my-[20px]transform hover:scale-105 text-white font-medium rounded-lg py-3 px-3 inline-flex items-center space-x-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={() => setShow(true)}
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
                            <span>Add a Variable</span>
                        </button>
                    </div>
                </div>
                {filterData?.map((cur: {
                     masterVariable: { title: string; id: string;}; mapping: any; 
}) => {
                    return <AccordionItem 
                        key={cur.id}
                        title={cur?.masterVariable?.title} 
                        content={getContent(cur?.mapping)}
                        onDelete={() => { handleShowDelete(cur.masterVariable.id) }}
                        onEdit={() => {setShow(true)}}
                    />
                    
                })}
                
                {show && (<AddUpdateVariable onClose={() => { setShow(false) }} onSuccess={onAddUpdateQuarter} />)}
                {showDelete && (<DeleteVariable onClose={() => {setShowDelete(false); setDeleteId('');}}/> )}
            </>
        </Layout>
    );
}

function AddUpdateVariable(props: AddUpdateParameterProps) {
  const [val, setVal] = useState({
    id: props?.data?.id,
    name: props?.data?.title,
  });

  const handleOnSave = () => {
    if (!val.name) {
      // toast('Title is required', { hideProgressBar: false, autoClose: 7000, type: 'error' });
      return;
    }
    props.onSuccess && props.onSuccess(val);
    props.onClose && props.onClose();
  };

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement> | any) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    const name = e.target.name;

    setVal((prevVal) => ({
      ...prevVal,
      [name]: value,
    }));
  };

  return (
    <Modal
      showModal={true}
      handleOnSave={handleOnSave}
      title="Add a Variable"
      onClose={() => props.onClose && props.onClose()}
    >
      <>
        <form className="form w-100">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col">
              <label
                htmlFor="Name"
                className="text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="Name"
                name="name"
                value={val.name}
                onChange={handleOnChange}
                required
                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none w-full"
              />
            </div>
          </div>
        </form>
      </>
    </Modal>
  );
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
      title="Delete a Variable"
      onClose={() => props.onClose && props.onClose()}
      confirmButton="Delete"
    >
      <>
        <div>Are you sure you want to delete?</div>
      </>
    </Modal>
  );
}
