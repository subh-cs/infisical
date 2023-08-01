import SecurityClient from "@app/components/utilities/SecurityClient";

/**
 * This route lets us get all the memberships.
 * @returns
 */

const deleteMultipleMembershipsAtOnce = (membershipsToDelete: any, userId: string) =>
    SecurityClient.fetchCall(`/api/v1/membership/${userId}/delete-memberships-at-once`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            membershipsToDelete: membershipsToDelete,
        })

    }).then(async (res) => {
        if (res && res.status === 200) {
            return res.json();
        }
        console.log("Failed to update membership rules");
        return undefined;
    });

export default deleteMultipleMembershipsAtOnce;