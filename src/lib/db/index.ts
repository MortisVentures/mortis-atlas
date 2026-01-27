export { prisma, default } from "./prisma";

// Company utilities
export {
  getCompanies,
  getCompanyById,
  getCompanyWithFullDetails,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyStats,
  getUniqueSectors,
  getUniqueSourceTypes,
  searchCompanies,
  type CompanyFilters,
  type PaginationParams,
  type PaginatedResponse,
  type CompanyInput,
  type CompanyUpdate,
  type CompanyWithRelations,
  type CompanyStats,
} from "./companies";
