import SecurityClient from "@app/components/utilities/SecurityClient";

/**
 * This route lets us get all the memberships.
 * @returns
 */

const addMultipleMembershipsAtOnce = (membershipsToAdd: any, userId: string) =>
    SecurityClient.fetchCall(`/api/v1/membership/${userId}/add-memberships-at-once`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            membershipsToAdd: membershipsToAdd,
        })

    }).then(async (res) => {
        if (res && res.status === 200) {
            return res.json();
        }
        console.log("Failed to add membership rules");
        return undefined;
    });

export default addMultipleMembershipsAtOnce;