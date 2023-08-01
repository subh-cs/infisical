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
};

export const AddtoProjectModal = ({
    isOpen,
    onOpenChange,
    selectedUser,
    memberships
}: Props): JSX.Element => {

    const [isLoading, setIsLoading] = useState(false);
    const [searchWorkspaceFilter, setSearchWorkspaceFilter] = useState("");

    const [tempMemberships, setTempMemberships] = useState([]);

    const { workspaces} = useWorkspace();

    const orgWorkspaces =
        workspaces?.filter(
            (workspace) => workspace.organization === localStorage.getItem("orgData.id")
        ) || [];

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

    // a function which will change the role based on the workspaceId
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

    const selectAllToggle = () => {
        if (tempMemberships.length === orgWorkspaces.length) {
            setTempMemberships([]);
        }
        else {
            setTempMemberships(orgWorkspaces.map((workspace: any) => ({ workspace: workspace._id, role: "member", user: selectedUser, _id: memberships.find((membership: any) => membership.workspace === workspace._id)?._id || "" })));
        }
    }

    const onAddToProjects = async () => {
        setIsLoading(true);

        const membershipsToAdd = tempMemberships.filter((membership: any) => !memberships.some((m: any) => m.workspace === membership.workspace)).map((membership: any) => ({
            workspace: membership.workspace,
            role: membership.role,
            user: membership.user
        }));

        const membershipsToDelete = memberships.filter((membership: any) => !tempMemberships.some((m: any) => m.workspace === membership.workspace)).map((membership: any) => ({
            workspace: membership.workspace,
            role: membership.role,
            user: membership.user,
            _id: membership._id
        }));


        const membershipsToUpdate = tempMemberships.filter((membership: any) => memberships.some((m: any) => m.workspace === membership.workspace && m.role !== membership.role)).map((membership: any) => ({
            workspace: membership.workspace,
            role: membership.role,
            user: membership.user,
            _id: membership._id
        }));

        console.log("membershipsToAdd", membershipsToAdd);
        console.log("membershipsToDelete", membershipsToDelete);
        console.log("membershipsToUpdate", membershipsToUpdate);


        const addedData = await addMultipleMembershipsAtOnce(membershipsToAdd, selectedUser as string);

        const updatedData = await updateMembershipsAtOnce(membershipsToUpdate, selectedUser as string);

        const deletedData = await deleteMultipleMembershipsAtOnce(membershipsToDelete, selectedUser as string);

        if (addedData?.success && updatedData?.success && deletedData?.success) {
            Router.reload();
            // console.log("success");
        }
        else {
            alert("Something went wrong");
        }

        setIsLoading(false);
        onOpenChange();
    }

    const filteredWorkspace = useMemo(
        () =>
          orgWorkspaces.filter(
            ({ name }) =>
              name?.toLowerCase().includes(searchWorkspaceFilter.toLowerCase())
          ),
        [orgWorkspaces, searchWorkspaceFilter]
      );


    useEffect(() => {
        if (isOpen) {
            // create a object only containing workspaceId and role from memberships if workspace is also present in orgWorkspaces
            const tempMembershipsObj = memberships?.filter((membership: any) => orgWorkspaces.some((workspace: any) => workspace._id === membership.workspace))?.map((membership: any) => ({
                workspace: membership.workspace,
                role: membership.role,
                user: membership.user,
                _id: membership._id
            }));
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
                            isChecked={tempMemberships.length === orgWorkspaces.length && searchWorkspaceFilter.length === 0 ? true : false}
                            isDisabled={searchWorkspaceFilter.length > 0 ? true : false}
                        />
                        Select all
                    </div>
                    {filteredWorkspace
                        .map((workspace) => (
                            <div key={workspace._id} className="flex justify-between items-center pt-4 px-4">
                                <div className="flex justify-start items-center">
                                    <Checkbox
                                        id={workspace._id}
                                        isChecked={tempMemberships?.some((membership) => membership.workspace === workspace._id)}
                                        onClick={() => onWorkspaceSelect(workspace._id)}
                                    />
                                    {workspace.name}
                                </div>
                                <Select
                                    defaultValue={tempMemberships?.find((membership) => membership.workspace === workspace._id)?.role == "admin" ? "admin" : "member"}
                                    isDisabled={!tempMemberships?.some((membership) => membership.workspace === workspace._id)}
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
                    onClick={onAddToProjects}
                >
                    Give Access 🚀
                </Button>


            </ModalContent>
        </Modal >
    );
};