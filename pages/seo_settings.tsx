import { Key, useEffect, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import Loader from "@/components/loader";
import { Modal } from "@/components/model";
import { useMutation, useLazyQuery } from "@apollo/client";
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from "next/router";
import { AddMetaProps, LayoutProps, KpiTerm, Seo, DeleteSeoProps } from "@/utils/data"
import { GET_TERMS_BY_COMPANY, ADD_UPDATE_SEO, GET_SEO_BY_COMPANIES, DELETE_SEO_BY_ID } from "@/utils/query";
import SeoSettingsTable, { SeoTableData } from "@/components/table/seo/SeoSettingsTable";
import ChipTextField from "@/components/ChipTextField";
import { json } from "node:stream/consumers";

export default function FinancialPage(props: JSX.IntrinsicAttributes & LayoutProps) {
    const router = useRouter();
    const [company, setCompany] = useState("");
    const [showLoader, setShowLoader] = useState(false);
    const [showSeoModal, setShowSeoModal] = useState(false);
    const [showDeleteSeoModal, setDeleteShowSeoModal] = useState(false);
    const [deleteSeoId, setDeleteSeoId] = useState<string|undefined>();
    const [seoMetaData, setSeoMetaData] = useState<SeoTableData[]>([]);
    const [addUpdateSeoData, setAddUpdateSeoData] = useState<
      AddMetaProps["data"] | undefined
    >();

    const [addOrUpdateSeo] = useMutation(ADD_UPDATE_SEO);
    const [deleteSeoMutation] = useMutation(DELETE_SEO_BY_ID);
    const [getSeoOfCompany, { data: companySeo, refetch: refetchCompanySeo }] = useLazyQuery(GET_SEO_BY_COMPANIES,);

    const onAddUpdateSeo = async (parameters: any) => {
        setShowLoader(true);
        const { data }: any = await addOrUpdateSeo({
          variables: {
            seoInfo: {
              ...(parameters?.id && {
                id: parameters?.id ?? "",
              }),
              value: JSON.stringify(parameters),
            },
            termId: parameters?.term,
          },
        });
        setShowLoader(false);
        refetchCompanySeo();
    }

    const onDeleteSeo = async () => {
      setShowLoader(true);
      const { data }: any = await deleteSeoMutation({
        variables: {
          seoId: deleteSeoId ?? "",
        },
      });
      setShowLoader(false);
      refetchCompanySeo();
    };


    const onEditClick = (index:number) =>{
        setAddUpdateSeoData({
            id:seoMetaData[index].id,
            title:seoMetaData[index].title,
            termId:seoMetaData[index].termId,
            description:seoMetaData[index].description,
            keyword:seoMetaData[index].keyWord,
            isEdit: true,
        });
        setShowSeoModal(true);
    }

    const onDeleteClick = (index:number) =>{
        setDeleteSeoId(seoMetaData[index]?.id);
        setDeleteShowSeoModal(true);
    }

    useEffect(() => {
      let seoData: Array<SeoTableData> = [];
      companySeo?.getSeoByCompanyId?.map((seo: Seo) => {
        let info = Object.assign({}, seo);
        info.value = JSON.parse(seo.value);

        let keyword:Array<string> = [];
        if(Array.isArray(info?.value?.selectedChips)){
            keyword = [...(info?.value?.selectedChips)]
        }
        console.log(keyword);
        let seoTableRow: SeoTableData = {
          title: info.value?.title ?? "-/-",
          id: info.id,
          term: seo.kpiTerm?.name,
          description: info.value?.description ?? "-/-",
          keyWord: keyword,
          termId: seo.kpiTerm?.id
        };
        seoData.push(seoTableRow);
      });
      setSeoMetaData(seoData);
    }, [companySeo]);

    useEffect(() => {
        if(!!company){
            getSeoOfCompany({
                variables:{
                    companyId:company,
                }
            })
        }
    }, [company])

    useEffect(() => {
        if (typeof router.query.company === 'string') {
            setCompany(router.query.company);
        }
    }, [router.query])

    return (
      <Layout title="seo_Settings" page={LayoutPages.seo_settings} {...props}>
        <>
          {showLoader && <Loader />}
          <div className="flex pr-4 gap-4">
            <button
              type="button"
              className="bg-blue-500 ml-auto hover:bg-blue-600 transform hover:scale-105 text-white font-medium rounded-lg py-3 px-3 inline-flex items-center space-x-2 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => {
                setAddUpdateSeoData(undefined);
                setShowSeoModal(true);
              }}
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
              <span>Add Meta</span>
            </button>
          </div>
          <div className="mt-4">
            <SeoSettingsTable metadata={seoMetaData} onEdit={onEditClick} onDelete={onDeleteClick}/>
          </div>
          {showSeoModal && (
            <AddMeta
              onSuccess={onAddUpdateSeo}
              onClose={() => {
                setShowSeoModal(false);
              }}
              data={addUpdateSeoData}
            />
          )}
          {showDeleteSeoModal && (
            <DeleteSeo
              id={deleteSeoId}
              onSuccess={onDeleteSeo}
              onClose={() => {
                setDeleteShowSeoModal(false);
              }}
            />
          )}
        </>
      </Layout>
    );
}
function AddMeta(props: AddMetaProps) {
    const [refetch, setRefetch] = useState(false);
    const [term, setTerm] = useState("");
    const [company, setCompany] = useState("");
    const router = useRouter();
    const [val, setVal] = useState({
      title: props?.data?.title?? "",
      description: props.data?.description??"",
      term:props.data?.termId??"",
      selectedChips:props.data?.keyword??[],
    });
    const [getTermsDetails, { data: termsData, refetch: refetchTerms }] =
      useLazyQuery(GET_TERMS_BY_COMPANY, {
        fetchPolicy: "network-only",
        variables: {
          companyId: company,
        },
      });

    const handleOnSave = async () => {
        let infoToSave: any = Object.assign({}, val);
        if (props.data?.isEdit) {
          infoToSave["id"] = props.data?.id ?? "";
        }
        props.onSuccess && (await props.onSuccess(infoToSave));
        props.onClose && props.onClose();
    };

    const handleTermChange = (event: any) => {
        const selectedTerm = event?.target?.value;
        setVal({
          title: "",
          description: "",
          term: selectedTerm,
          selectedChips: [] as string[],
        });
    }

    const handleOnInputChange = (event: any) => {
        const { name, value } = event.target;
        setVal((prevVal) => ({
            ...prevVal,
            [name]: value,
        }));
    };

    const handleChipsChange = (chips: string[]) => {
        setVal((prevVal) => ({ ...prevVal, selectedChips: chips }));
    };

    useEffect(() => {
        if (typeof router.query.company === 'string') {
            setCompany(router.query.company);
        }
    }, [router.query])

    useEffect(() => {
        if (!!company && refetch) {
            refetchTerms();
        }
        setRefetch(false);
    }, [refetch]);

    useEffect(() => {
        if (!!company?.length) {
            getTermsDetails();
        }
    }, [company]);

    useEffect(() => {
        if (typeof router.query.company === 'string') {
            setCompany(router.query.company);
        }
    }, [router.query]);



    return (
        <Modal
            showModal={true}
            handleOnSave={handleOnSave}
            title="Add Meta"
            onClose={() => props.onClose && props.onClose()}
        >
            <>
                <form className="form w-100">
                    <div className="grid gap-4">
                        <div className="flex gap-5">
                            <div className="flex flex-col">
                                <label
                                    htmlFor="quarter"
                                    className="text-sm  text-gray-700 mr-[20px]"
                                >
                                    Select Kpi term
                                </label>
                                <select
                                    id="quarter"
                                    name="term"
                                    className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                                    value={val.term}
                                    disabled={props?.data?.isEdit}
                                    onChange={handleTermChange}
                                >
                                    <option value="">Select a option</option>
                                    {(termsData?.getKpiTermsByCompanyId ?? []).map((cur: KpiTerm) => {
                                        if(props.data?.isEdit){
                                            if(cur.id === props.data?.termId){
                                                return (
                                                    <option key={cur.id} value={cur?.id}>
                                                        {cur?.name}
                                                    </option>
                                                );
                                            }
                                        }else{
                                            if(!cur.seo){
                                                return (
                                                    <option key={cur.id} value={cur?.id}>
                                                        {cur?.name}
                                                    </option>
                                                );
                                            }
                                        }               
                                    })}
                                </select>
                            </div>
                            <div className="flex flex-col mb-[20px]">
                                <label

                                    className="text-sm font-medium text-gray-700"
                                >
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={val.title}
                                    onChange={handleOnInputChange}
                                    required
                                    className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col mb-[20px]">
                            <label
                                className="text-sm font-medium text-gray-700"
                            >
                                Description
                            </label>
                            <input
                                type="text"
                                id="description"
                                name="description"
                                value={val.description}
                                onChange={handleOnInputChange}
                                required
                                className="mt-1 p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />

                        </div>
                        <div className="flex flex-col mb-[20px]">
                            <label
                                className="text-sm font-medium text-gray-700"
                            >
                                Add keywords
                            </label>
                            <ChipTextField onChipsChange={handleChipsChange} chips={val.selectedChips} />
                        </div>
                    </div>
                </form>
            </>
        </Modal>
    );
}

function DeleteSeo(props: DeleteSeoProps) {
    const handleOnSave = async () => {
        props.onSuccess && await props.onSuccess()
        props.onClose && props.onClose()
    };

    return (
        <Modal
            showModal={true}
            handleOnSave={handleOnSave}
            title="Delete a Seo"
            onClose={() => props.onClose && props.onClose()}
            confirmButton="Delete"
        >
            <>
                <div>Are you sure you want to delete?</div>
            </>
        </Modal>
    );
}

