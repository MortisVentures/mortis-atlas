export { prisma, default } from "./prisma";

// Activity utilities
export {
  getActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  getUpcomingMeetings,
  getRecentActivities,
  getActivitiesByDeal,
  getActivitiesByCompany,
  getActivitiesByContact,
  markActivityCompleted,
  ACTIVITY_TYPE_CONFIG,
  type ActivityInput,
  type ActivityFilters,
  type ActivityWithRelations,
} from "./activities";

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
