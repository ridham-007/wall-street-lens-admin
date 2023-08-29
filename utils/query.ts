import { gql} from "@apollo/client";


const ADD_FINANCIAL_SUMMARY_PARAMETER = gql`
mutation createFinancialSummary($summaryInfo:CreateFinancialSummary!){
  createFinancialSummary(
    summaryInfo: $summaryInfo
  ) {
    id
    company
    linkTo
    isVisibleToChart
    unit
    createdAt
    updatedAt
    metaData
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

const ADD_QUARTERS_DETAILS = gql`
  mutation addQuarters($addQuarters: AddQuarters!){
  addQuarters(addQuarters: $addQuarters) {
    success
    affectedRow
  }
}
`;

export {
    ADD_FINANCIAL_SUMMARY_PARAMETER,
    GET_FINANCIAL_SUMMARY_PARAMETERS,
    ADD_QUARTERS_DETAILS,
}