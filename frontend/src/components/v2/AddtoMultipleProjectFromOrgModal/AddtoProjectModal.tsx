import { useState, useEffect, useMemo } from "react";
import { Button } from "../Button";
import { Modal, ModalContent } from "../Modal";
import { Checkbox, Input, Select, SelectItem } from "@app/components/v2"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { useWorkspace } from "@app/context";
import { Workspace } from "@app/hooks/api/types";
import updateMembershipsAtOnce from "~/pages/api/memberships/updateMembershipsAtOnce";
import addMultipleMembershipsAtOnce from "~/pages/api/memberships/addMultipleMembershipAtOnce";
import deleteMultipleMembershipsAtOnce from "~/pages/api/memberships/deleteMultipleMembershipAtOnce";
import Router from "next/router"

type Props = {
    isOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    selectedUser?: string;
    memberships?: any;
    currentUserOrgRole?: string;
    allWorkspacesWithinOrg?:[]
};

export const AddtoProjectModal = ({
    isOpen,
    onOpenChange,
    selectedUser,
    memberships,
    currentUserOrgRole,
    allWorkspacesWithinOrg
}: Props): JSX.Element => {

    const [isLoading, setIsLoading] = useState(false);
    const [searchWorkspaceFilter, setSearchWorkspaceFilter] = useState("");

    const [tempMemberships, setTempMemberships] = useState([]);

    // a function which will add or remove a workspace from tempMemberships array based on whether it is already present or not
    const onWorkspaceSelect = (workspaceId: string) => {
        const workspaceIndex = tempMemberships.findIndex((membership: any) => membership.workspace === workspaceId);
        if (workspaceIndex === -1) {
            // if workspace is not present in tempMemberships, add it
            setTempMemberships((prevTempMemberships: any) => [...prevTempMemberships, { workspace: workspaceId, role: "member", user: selectedUser, _id: "" }]);
        }
        else {
            // if workspace is already present in tempMemberships, remove it
            setTempMemberships((prevTempMemberships: any) => prevTempMemberships.filter((membership: any) => membership.workspace !== workspaceId));
        }
    }

    // a function which will change the role based on the workspaceId within tempMemberships array
    const onRoleChange = (workspaceId: string, role: string) => {
        const workspaceIndex = tempMemberships.findIndex((membership: any) => membership.workspace === workspaceId);
        if (workspaceIndex !== -1) {
            // if workspace is present in tempMemberships, change the role
            setTempMemberships((prevTempMemberships: any) => {
                const tempMembershipsCopy = [...prevTempMemberships];
                tempMembershipsCopy[workspaceIndex].role = role;
                return tempMembershipsCopy;
            });
        }
    }

    // a function which will toggle the select all checkbox
    const selectAllToggle = () => {
        if (tempMemberships.length === allWorkspacesWithinOrg?.length) {
            setTempMemberships([]);
        }
        else {
            setTempMemberships(allWorkspacesWithinOrg?.map((workspace: any) => ({ workspace: workspace._id, role: "member", user: selectedUser, _id: memberships.find((membership: any) => membership.workspace === workspace._id)?._id || "" })));
        }
    }

    // a function which will give access to all the workspaces to the user
    const onAddToProjects = async () => {
        setIsLoading(true);

        // comparing with the membership (prop) array with latest state, extracting the memberships which were not present before and now have to add
        const membershipsToAdd = tempMemberships.filter((membership: any) => !memberships.some((m: any) => m.workspace === membership.workspace)).map((membership: any) => ({
            workspace: membership.workspace,
            role: membership.role,
            user: membership.user
        }));

        // comparing with the membership (prop) array with latest state, extracting the memberships which were present before and now have to delete
        const membershipsToDelete = memberships.filter((membership: any) => !tempMemberships.some((m: any) => m.workspace === membership.workspace)).map((membership: any) => ({
            workspace: membership.workspace,
            role: membership.role,
            user: membership.user,
            _id: membership._id
        }));

        // comparing with the membership (prop) array with latest state, extracting the memberships which were present before and now have to update the role
        const membershipsToUpdate = tempMemberships.filter((membership: any) => memberships.some((m: any) => m.workspace === membership.workspace && m.role !== membership.role)).map((membership: any) => ({
            workspace: membership.workspace,
            role: membership.role,
            user: membership.user,
            _id: membership._id
        }));


        const addedData = await addMultipleMembershipsAtOnce(membershipsToAdd, selectedUser as string);

        const updatedData = await updateMembershipsAtOnce(membershipsToUpdate, selectedUser as string);

        const deletedData = await deleteMultipleMembershipsAtOnce(membershipsToDelete, selectedUser as string);

        if (addedData?.success && updatedData?.success && deletedData?.success) {
            Router.reload();
        }
        else {
            alert("Something went wrong");
        }

        setIsLoading(false);
        onOpenChange();
    }

    const filteredWorkspace = useMemo(
        () =>
        allWorkspacesWithinOrg?.filter(
                ({ name }) =>
                    name?.toLowerCase().includes(searchWorkspaceFilter.toLowerCase())
            ),
        [allWorkspacesWithinOrg, searchWorkspaceFilter]
    );


    useEffect(() => {
        if (isOpen) {
            // as membership array contains all the memberships including the ones which are not of the current organization, we need to filter them out
            const tempMembershipsObj = memberships?.filter((membership: any) => allWorkspacesWithinOrg?.some((workspace: any) => workspace._id === membership.workspace))?.map((membership: any) => ({
                workspace: membership.workspace,
                role: membership.role,
                user: membership.user,
                _id: membership._id
            }));
            // we will be using tempMemberships to play around with the data and manage the state within the modal
            setTempMemberships(tempMembershipsObj);
        }
        else if (!isOpen) {
            setTempMemberships([]);
        }
    }, [isOpen])


    return (
        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
        >
            <ModalContent
                title="Add to multiple projects"
                subTitle="Use this to add or delete a user from multiple projects at once"
            >
                <Input
                    value={searchWorkspaceFilter}
                    onChange={(e) => setSearchWorkspaceFilter(e.target.value)}
                    leftIcon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
                    placeholder="Search projects..."
                />
                <div className="overflow-y-auto h-96 mt-8">
                    <div className="flex justify-start items-center py-2 border-b border-mineshaft-600">
                        <Checkbox
                            onClick={selectAllToggle}
                            isChecked={tempMemberships.length === allWorkspacesWithinOrg?.length}
                            isDisabled={(searchWorkspaceFilter.length > 0) ? true : false || currentUserOrgRole === "member" ? true : false}
                        />
                        Select all
                    </div>
                    {filteredWorkspace
                        ?.map((workspace) => (
                            <div key={workspace._id} className="flex justify-between items-center pt-4 px-4">
                                <div className="flex justify-start items-center">
                                    <Checkbox
                                        id={workspace._id}
                                        isChecked={tempMemberships?.some((membership) => membership.workspace === workspace._id)}
                                        onClick={() => onWorkspaceSelect(workspace._id)}
                                        isDisabled={currentUserOrgRole === "member" ? true : false}
                                    />
                                    {workspace.name}
                                </div>
                                <Select
                                    defaultValue={tempMemberships?.find((membership) => membership.workspace === workspace._id)?.role == "admin" ? "admin" : "member"}
                                    isDisabled={!tempMemberships?.some((membership) => membership.workspace === workspace._id)|| currentUserOrgRole === "member"}
                                    className="w-40 bg-mineshaft-600"
                                    dropdownContainerClassName="border border-mineshaft-600 bg-mineshaft-800"
                                    onValueChange={(selectedRole: string) =>
                                        onRoleChange(workspace._id, selectedRole)
                                    }
                                >
                                    <SelectItem value="member">Member</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </Select>
                            </div>

                        )
                        )}
                </div>
                {/* </div> */}
                <Button
                    className="w-full mt-8"
                    isLoading={isLoading}
                    onClick={currentUserOrgRole === "member" ? () => onOpenChange() : onAddToProjects}
                >
                    {currentUserOrgRole === "member" ? "Close" : "Add to projects"}
                </Button>


            </ModalContent>
        </Modal >
    );
};