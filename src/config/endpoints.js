const baseApiUrl = "http://139.59.44.254:8080";

export default {
  baseApiUrl,
  locations: `${baseApiUrl}/location`,
  users: `${baseApiUrl}/user`,
  departments: `${baseApiUrl}/department`,
  userPermissions: `${baseApiUrl}/userPermission`,
  userPermission_updateByRole: `${baseApiUrl}/userPermission/search/updateByRole`,
};
