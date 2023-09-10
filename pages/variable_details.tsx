import { useEffect, useState } from "react";
import Layout, { LayoutPages } from "@/components/layout";
import Loader from "@/components/loader";
import Variable from "@/components/table/variables/Variable";
import { Modal } from "@/components/model";
import * as XLSX from "xlsx";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GET_VARIBALES_KPI_TERM, GET_VIEW_FOR_TERM } from "@/utils/query";
import { useLazyQuery } from "@apollo/client";

export default function VariableDetails() {
  const [showLoader, setShowLoader] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const [activeTab, setActiveTab] = useState("Variables");
  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName);
  };

  return (
    <Layout title="Financial Summary" page={LayoutPages.variable_details}>
      <>
        {showLoader && <Loader />}
        <Variable />
      </>
    </Layout>
  );
}
