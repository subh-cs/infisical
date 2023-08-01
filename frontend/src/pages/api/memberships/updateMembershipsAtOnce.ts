import SecurityClient from "@app/components/utilities/SecurityClient";

/**
 * This route lets us get all the memberships.
 * @returns
 */

const updateMultipleMembershipsAtOnce = (membershipsToUpdate: any, userId: string) =>
    SecurityClient.fetchCall(`/api/v1/membership/${userId}/update-memberships-at-once`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            membershipsToUpdate: membershipsToUpdate
        })

    }).then(async (res) => {
        if (res && res.status === 200) {
            return res.json();
        }
        console.log("Failed to update membership rules");
        return undefined;
    });

export default updateMultipleMembershipsAtOnce;