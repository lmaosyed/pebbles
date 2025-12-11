const ADMIN = {
  LOGIN: "/api/admin/login",

  // USERS
  USERS: "/api/admin/users",
  BAN_USER: (id) => `/api/admin/users/ban/${id}`,
  UNBAN_USER: (id) => `/api/admin/users/unban/${id}`,
DELETE_USER: (id) => `/api/admin/users/${id}`,

  // LISTINGS
  LISTINGS: "/api/admin/listings",
  DELETE_LISTING: (id) => `/api/admin/listings/${id}`,
  SOFT_DELETE_LISTING: (id) => `/api/admin/listings/${id}/soft`,
  RESTORE_LISTING: (id) => `/api/admin/listings/${id}/restore`,

  // REPORTS
  REPORTS: "/api/admin/reports",
  RESOLVE_REPORT: (id) => `/api/admin/reports/${id}/resolve`,

  // LOGS
  LOGS: "/api/admin/logs",

  // STATS
  STATS: "/api/admin/stats",
};

export default ADMIN;
