import { gql} from "@apollo/client";


const ADD_FINANCIAL_SUMMARY_PARAMETER = gql`
mutation addUpdateFinancialQuarters($financialQuarter:AddUpdateFinancialQuarters!){
  addUpdateFinancialQuarters(
    financialQuarter: $financialQuarter
  ) {
    success
  }
}`;

const GET_FINANCIAL_SUMMARY_PARAMETERS = gql`
query getFinancialSummaryByCompany($companyName: String!){
  getFinancialSummaryByCompany(
    companyName: $companyName
  ) {
    id
    company
    linkTo
    isVisibleToChart
    unit
  }
}`;

const GET_OPERATIONAL_SUMMARY_PARAMETERS = gql`
query getOperationalSummaryByCompany($companyName: String!){
  getOperationalSummaryByCompany(
    companyName: $companyName
  ) {
    id
    company
    linkTo
    unit
    operationType
    subIndustry
    industry
  }
}`;


const GET_CAPACITY_SUMMARY_PARAMETERS = gql`
query getCapacityQuarterSummaryByCompany($companyName: String!){
  getCapacityQuarterSummaryByCompany(
    companyName: $companyName
  ) {
    id
    title
    company
    summary
    quarter
    year
  }
}`;

const ADD_QUARTERS_DETAILS = gql`
  mutation addQuarters($addQuarters: AddQuarters!){
  addQuarters(addQuarters: $addQuarters) {
    success
    affectedRow
  }
}
`;

const FINANCIAL_REPORT_BY_COMPANY_NAME = gql`
query getFinancialReportsByCompany(
    $companyName: String!
  ) {
  getFinancialReportsByCompany(
    companyName: $companyName
  ){
    financialQuarters {
      financialSummary {
        id
        company
        title
        graphType
        yoy
      }
      quarters {
        id
        quarter
        year
        value
      }
    }
  }
}`;

const OPERATIONAL_REPORT_BY_COMPANY_NAME = gql`
query getOperationalReportsByCompany(
    $companyName: String!
  ) {
  getOperationalReportsByCompany(
    companyName: $companyName
  ){
    operationalQuarters {
      operationalSummary{
        id
        company
        title
        graphType
        yoy
        operationType
      }
      quarters {
        year
        id
        quarter
        value
      }
    }
  }
}`;

const CREATE_OPERATIONAL_SUMMARY = gql`
mutation addUpdateOperationalQuarters($operationalQuarter:AddUpdateOperationalQuarters!){
  addUpdateOperationalQuarters(
    operationalQuarter: $operationalQuarter
  ) {
    success
  }
}`;

const CREATE_CAPACITY_OPERATIONAL_SUMMARY = gql`mutation createCapacityQuarterSummary(
  $summaryInfo:CreateCapacityQuarterSummary!
  ){
  createCapacityQuarterSummary(
    summaryInfo: $summaryInfo
  ) {
    title
    company
    summary
  }
}`;


const CREATE_OUTLOOKL_SUMMARY = gql`mutation createOutLookSummary(
  $summaryInfo:CreateOutLookSummary!
  ){
  createOutLookSummary(
    summaryInfo: $summaryInfo
  ) {
    id
    company
    summary
  }
}`;


const CREATE_CAPASITY_SUMMARY = gql`mutation addCapacitySummaryDetails(
  $capacityInfo:AddCapacitySummary!
  ){
  addCapacitySummaryDetails(
    capacityInfo: $capacityInfo
  ) {
    id
    company
    product
  }
}`;

const GET_OUT_LOOK_SUMMARY = gql`query getOutLookSummaryByCompany(
  $companyName: String!
) {
  getOutLookSummaryByCompany(
  companyName: $companyName
) {
  id
  company
  summary
  quarter
  year
}
}`;

const GET_VEHICLE_CAPACITY_SUMMARY = gql`query getCapacityReportsByCompanyName(
  $companyName: String!
  ) {
    getCapacityReportsByCompanyName(
    companyName: $companyName
  ) {
    capacityQuarters {
      quarterSummary {
        id
        title
        company
        summary
        quarter
        year
      }
      capacityInfo {
        id
        company
        region
        product
        status
        capacity
      }
    }
  }
}`;

export {
    ADD_FINANCIAL_SUMMARY_PARAMETER,
    GET_FINANCIAL_SUMMARY_PARAMETERS,
    ADD_QUARTERS_DETAILS,
    FINANCIAL_REPORT_BY_COMPANY_NAME,
    CREATE_OPERATIONAL_SUMMARY,
    GET_OPERATIONAL_SUMMARY_PARAMETERS,
    CREATE_CAPACITY_OPERATIONAL_SUMMARY,
    GET_CAPACITY_SUMMARY_PARAMETERS,
    CREATE_OUTLOOKL_SUMMARY,
    GET_OUT_LOOK_SUMMARY,
    OPERATIONAL_REPORT_BY_COMPANY_NAME,
    CREATE_CAPASITY_SUMMARY,
    GET_VEHICLE_CAPACITY_SUMMARY,
}