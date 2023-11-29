import { ReactNode } from "react";
import { LayoutPages } from "@/components/layout"

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

export interface AddMetaProps {
  onSuccess?: any;
  onClose?: any;
  data?: any;
}
export interface DeleteVariableProps {
  onSuccess?: any;
  onClose?: any;
  id?: any;
  selectTerm?: any;
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
  company?: any;
  refetch?: any;
  term?: any;
  currentData?: any;
  selectTerm?: any;
  onEdit?: boolean;
}

export interface AddUpdateColorParameterProps {
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
  company?: any;
  refetch?: any;
  term?: any;
  currentData?: any;
  selectTerm?: any;
  onEdit?: boolean;
}

export interface AddUpdateMasterVariableProps {
  onSuccess?: any;
  onClose?: any;
  onSave?: any;
  refetch?: any;
  data?: any;
  onEdit?: boolean;
  title?: any;
}

export interface AddRelationProps {
  onSuccess?: any;
  onClose?: any;
  onSave?: any;
  refetch?: any;
  data?: any;
}

export interface VariablesArray {
  category: string;
  title: string;
  id: string;
  masterVariable?: any;
}
export interface DeleteChartProps {
  onSuccess?: any;
  onClose?: any;
  id?: any;
}
export interface LayoutProps {
  title?: string;
  page?: LayoutPages;
  children?: JSX.Element;
  companies?: any;
  subIndustries?: any;
  company?: any;
  setCompany?: any;
}
export interface ModalOnClose {
  (reason?: string): void;
}
export interface Props {
  title?: string;
  showModal?: boolean;
  children?: JSX.Element;
  onClose: ModalOnClose;
  handleOnSave: ModalOnClose;
  confirmButton?: string;
  showNote?: boolean;
  message?: any;
}
export interface TableProps {
  data?: any;
  refetch?: any;
  company?: any;
  selectTerm?: any;
  setRefetch?: any;
  setTerm?: any;
  termsData?: any;
  term?: any;
  contentString?: string;
  onClick?: any;
  termId?: string;
  selectedTerm?: any;
  year?: string;
  quarter?: string;
  setShowDelete?: any;
  setShowEdit?: any;
  setDeleteId?: any;
  setEditId?: any;
  setQuarterId?: any;
  companies?: any;
  industries?: any;
  subIndustries?: any;
  refetchMasterVariables?: any;
}
export interface TableView {
  headers: Header[];
  rows: Row[];
  quarterWiseTable: boolean;
  description: string;
  title: string;
  quarterId: string;
}
export interface Header {
  id: string;
  name: string;
  quarterWise: boolean;
}

export interface Row {
  title: string;
  cells: Cell[];
  highlightColor: string;
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
  highlightColor?: string;
}
export interface DropdownProps {
  onChange: any;
  year: string;
}
export interface SheetValue {
  company: string;
  name: string;
  quarterWiseTable: boolean;
  summaryOnly: boolean;
  variables: Variable[];
  title: string;
  description: string;
  quarter: number;
  year: number;
}


export interface Variable {
  title: string;
  category: string;
  priority: string;
  yoy: string;
  quarters: Quarter[];
}

export interface Quarter {
  quarter: number;
  year: number;
  value: string;
}

export interface TraverseMap {
  id?: string;
  value?: string;
  title?: string;
  year?: number;
  quarter?: number;
  groupKey?: string;
  quarterId?: string;
  termId?: string;
  variableId?: string;
  columnIndex?: number;
  highlightColor?: string;
}
export interface DeleteVariableProps {
  onSuccess?: any;
  onClose?: any;
  id?: any;
  data?: any;
}

