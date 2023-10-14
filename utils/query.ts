import { gql } from "@apollo/client";

const LOG_IN = gql`
mutation signIn($username: String!, $password: String!){
  signIn(username: $username, password: $password){
    accessToken
  }
}
`

const GET_TERMS_BY_COMPANY = gql`query getKpiTermsByCompanyId(
  $companyId: String!
  ) {
    getKpiTermsByCompanyId(
    companyId: $companyId
  ) {
      id
      name
      quarterWiseTable
      summaryOnly
      updatedAt
      company
  }
}`;

const GET_VIEW_FOR_TERM = gql`query getViewForTerm(
  $termId: String!
  $quarter: Float
  $year: Float
  ) {
    getViewForTerm(
    termId: $termId
    quarter: $quarter
    year: $year
  ) {
      headers{
        id
        name
        quarterWise
        highlightColor
      }
      rows{
        title
        cells{
          id
          value
          quarter
          year
          groupKey
          extraInfo
          termId
          variableId
          quarterId
          highlightColor
        }
      }
      description
      title
      quarterId
      quarterWiseTable
  }
}`;

const GET_VARIBALES_KPI_TERM = gql`query getVariablesByKpiTerm(
  $termId: String!
  ) {
    getVariablesByKpiTerm(
    termId: $termId
  ) {
      id
      masterVariable {
        title
      }
      category
      priority
      yoy
      updatedAt
      kpiTerm {
        id
        name
        company
        quarterWiseTable
        summaryOnly
        updatedAt
      }
  }
}`;

const PROCCESS_BULK_UPLOAD = gql`mutation processBulkUploadTypeOne(
  $bulkUpload:BulkUploadTypeOne!
  ){
  processBulkUploadTypeOne(
    bulkUpload: $bulkUpload
  ) 
}`;

const UPDATE_MAPPED_VALUE = gql`mutation addUpdateMappedValue(
    $mappingInfo: AddUpdateMappedValue!
    $termId: String
    $variableId: String
    $quarterId: String
  ){
  addUpdateMappedValue(
    mappingInfo: $mappingInfo
    termId: $termId
    variableId: $variableId
    quarterId: $quarterId
  ){
    id
  }
}`;

const ADD_UPDATE_TERM_VERIABLE = gql`mutation addUpdateTermVariable(
  $variableInfo:AddUpdateTermVariable!
  $termId: String
  ){
  addUpdateTermVariable(
    variableInfo: $variableInfo
    termId: $termId
  ){
    id
  }
}`;

const ADD_UPDATE_KPI_TERM = gql`mutation addUpdateKpiTerm(
  $kpiInfo:AddUpdateKpiTerm!
  ){
  addUpdateKpiTerm(
    kpiInfo: $kpiInfo
  ){
    id
  }
}`;

const DELETE_VERIABLE_BY_ID = gql`mutation deleteVariableByVariableId(
  $variableId: String!
  ){
  deleteVariableByVariableId(
    variableId: $variableId
  ){
    success
  }
}`;

const DELETE_KPI_BY_ID = gql`mutation deleteKpiTermByTermId(
  $termId: String!
  ){
  deleteKpiTermByTermId(
    termId: $termId
  ){
    success
  }
}`;


const DELETE_CHART_BY_ID = gql`mutation deleteTermChartById(
  $chartId: String!
  ){
  deleteTermChartById(
    chartId: $chartId
  ){
    success
  }
}`;

const ADD_UPDATE_TERM_CHART_MUTATION = gql`
  mutation AddUpdateTermChart(
    $chartInfo: addUpdateTermChart!, 
    ) {
    addUpdateTermChart(
      chartInfo: $chartInfo, 
      ) {
      id
      title
    }
  }
`;

const GET_CHART_BY_KPI_TERM = gql`query getChartsByKpiTerm(
  $termId: String!
  ) {
    getChartsByKpiTerm(
    termId: $termId
  ) {
      id
      title
      type
      visible
      width
      xAxis {
        id 
        title
      }
      yAxis {
        id
        title
      }
      groupBy {
        id
        title
      }
      termVariables {
        id
        title
      }
      kpiTerm {
        id
        name
        company
        quarterWiseTable
        summaryOnly
        updatedAt
      }
  }
}`;

const ADD_QUARTER = gql`
  mutation addUpdateQuarter(
    $variableInfo: AddUpdateQuarterDetail!,
    $termId: String!
    ) {
    addUpdateQuarter(
      variableInfo: $variableInfo,
      termId: $termId
      ) {
      id
    }
  }
`;

const CREATE_DEFAULT_MAPPING = gql`
  mutation createDefaultMapping(
    $termId: String!
    $variableId: String
    $quarterId: String

    ) {
    createDefaultMapping(
      termId: $termId
      variableId: $variableId
      quarterId: $quarterId
      ) 
  }
`;


const DELTE_QUARTER = gql`
  mutation deleteQuarterDetailsByQuarterId(
    $quarterId: String!
    ) {
    deleteQuarterDetailsByQuarterId(
      quarterId: $quarterId
      ) {
      success
    }
  }
`;

const GET_COMPANIES = gql`query getCompanies {
    getCompanies{
      id
      attributes {
        name
        slug
        subIndustries {
          id
          name
        }
      }
  }
}`;

const GET_INDUSTRIES = gql`query getIndustries {
      getIndustries{
        id
        attributes {
          name
        }
    }
}
`;

const GET_SUB_INDUSTRIES = gql`
  query getSubIndustries {
      getSubIndustries{
        id
        attributes {
          name
          industry {
            id
            name
          }
        }
    }
}
`;

const ADD_ROW_FOR_QUARTER_WISE_TABLE = gql`
  mutation addRowForQuarterWiseTable(
    $quarterId: String!
    $termId: String!
    ) {
    addRowForQuarterWiseTable(
      quarterId: $quarterId
      termId: $termId
      ) 
  }
`;

const DELTE_ROW_FOR_QUARTER_WIASE_TABLE = gql`
  mutation deleteRowForQuarterWiseTableByGroup(
    $quarterId: String!
    $termId: String!
    $groupKey: String!
    ) {
    deleteRowForQuarterWiseTableByGroup(
      quarterId: $quarterId
      termId: $termId
      groupKey: $groupKey
      ) {
        success
      }
  }
`;

const ADD_COLUMN_FOR_KPI_TERM = gql`
  mutation addDefaultColumnForTerm(
    $termId: String!
    ) {
    addDefaultColumnForTerm(
      termId: $termId
      )
  }
`;

const ADD_UPDATE_MASTER_VERIABLE = gql`mutation addUpdateMasterVariable(
  $variableInfo:AddUpdateMasterVariable!
  ){
  addUpdateMasterVariable(
    variableInfo: $variableInfo
  ){
    id
    title
  }
}`;

const GET_VARIABLE_MAPPING_BY_COMPANY = gql`query getVariableMappingByCompany(
  $company: company
) {
    getVariableMappingByCompany(
      company: $company  
    ) {
      id
      company
      industry
      subIndustry
      masterVariable {
        title
      }
  }
}`;

export {
  LOG_IN,
  PROCCESS_BULK_UPLOAD,
  GET_TERMS_BY_COMPANY,
  GET_VIEW_FOR_TERM,
  GET_VARIBALES_KPI_TERM,
  UPDATE_MAPPED_VALUE,
  ADD_UPDATE_TERM_VERIABLE,
  ADD_UPDATE_KPI_TERM,
  DELETE_KPI_BY_ID,
  DELETE_VERIABLE_BY_ID,
  ADD_UPDATE_TERM_CHART_MUTATION,
  GET_CHART_BY_KPI_TERM,
  DELETE_CHART_BY_ID,
  ADD_QUARTER,
  DELTE_QUARTER,
  CREATE_DEFAULT_MAPPING,
  GET_COMPANIES,
  GET_INDUSTRIES,
  GET_SUB_INDUSTRIES,
  DELTE_ROW_FOR_QUARTER_WIASE_TABLE,
  ADD_ROW_FOR_QUARTER_WISE_TABLE,
  ADD_COLUMN_FOR_KPI_TERM,
  ADD_UPDATE_MASTER_VERIABLE,
  GET_VARIABLE_MAPPING_BY_COMPANY
}