import { ReactNode} from "react";
export interface KpiTerm {
    id: string;
    name: string;
    quarterWiseTable: boolean;
    summaryOnly: boolean;
    updatedAt: Date;
    company: string;
    title: ReactNode;
  }
export interface QuarterDataProps {
    onSuccess?: any;
    onClose?: any;
    data?: any;
  }
export interface DeleteVariableProps {
    onSuccess?: any;
    onClose?: any;
    id?: any;
  }
export interface EditQuarterProps {
    onClose?: any;
    cellData?: any;
    selectedColumn?: any;
    onSuccess?: any;
  }
export interface ImportDataProps {
    onSuccess?: any;
    onClose?: any;
    data?: any;
}  
export interface AddUpdateTermProps {
    onSuccess?: any;
    onClose?: any;
    data?: any;
}
export interface DeleteTermProps {
    onSuccess?: any;
    onClose?: any;
    id?: any;
}
export interface AddUpdateParameterProps {
    onSuccess?: any;
    onClose?: any;
    data?: any;
    termsData?: any;
    selectedTerm?: any;
    onSave?: any;
	cellData?: any;
	selectedColumn?: any;
    selectedCompany?: any;
    financialInitData?: any;
    company: any;
    refetch: any;
    term:any;
    currentData?: any;
    selectTerm?: any;
}
export interface VariablesArray {
    category: string;
    title: string;
    id: string;
  }
export interface DeleteChartProps {
    onSuccess?: any;
    onClose?: any;
    id?: any;
}



