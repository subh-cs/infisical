import SecurityClient from "@app/components/utilities/SecurityClient";
/**
 * This route lets us get the all workspaces within a given organization
 * @returns
 */
const getAllWorkspacesByOrgId = (orgId:string) =>
  SecurityClient.fetchCall(`/api/v1/workspace/get-all-workspaces-within-org/${orgId}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  }).then(async (res) => {
    if (res?.status === 200) {
      return res.json();
    }

    throw new Error("Failed to get projects");
  });

export default getAllWorkspacesByOrgId;
