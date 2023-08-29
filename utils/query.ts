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

export {
    ADD_FINANCIAL_SUMMARY_PARAMETER,
}