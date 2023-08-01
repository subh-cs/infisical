import SecurityClient from "@app/components/utilities/SecurityClient";

/**
 * This route lets us get all the memberships.
 * @returns
 */

const getAllMembershipsByUserId = (userId: string) =>
    SecurityClient.fetchCall(`/api/v1/membership/${userId}/get-all-memberships`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(async (res) => {
        if (res && res.status === 200) {
            return res.json();
        }
        console.log("Failed to get memberships");
        return undefined;
    });

export default getAllMembershipsByUserId;