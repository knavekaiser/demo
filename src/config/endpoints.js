const baseApiUrl = process.env.REACT_APP_HOST;

export default {
  baseApiUrl,
  locations: `${baseApiUrl}/location`,
  users: `${baseApiUrl}/user`,
  departments: `${baseApiUrl}/department`,
  userPermissions: `${baseApiUrl}/userPermission`,
  userPermission_updateByRole: `${baseApiUrl}/userPermission/search/updateByRole`,
  uploadFiles: `${baseApiUrl}/upload-multiple-files`,
};
