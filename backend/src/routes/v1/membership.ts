import express from "express";
const router = express.Router();
import { body, param } from "express-validator";
import { requireAuth, validateRequest } from "../../middleware";
import { membershipController } from "../../controllers/v1";
import { membershipController as EEMembershipControllers } from "../../ee/controllers/v1";
import { AuthMode } from "../../variables";

// note: ALL DEPRECIATED (moved to api/v2/workspace/:workspaceId/memberships/:membershipId)
// TODO endpoint: consider moving these endpoints to be under /workspace to be more RESTful

// get all memberships of every workspace
router.get("/:userId/get-all-memberships", requireAuth({
	acceptedAuthModes: [AUTH_MODE_JWT],
}), param("userId").exists().trim(),
	validateRequest,
	membershipController.findAllMembershipsByUserId);

// add multiple memberships at once
router.post("/:userId/add-memberships-at-once", requireAuth({
	acceptedAuthModes: [AUTH_MODE_JWT],
}), param("userId").exists().trim(),
	body("membershipsToAdd").isArray().exists(),
	validateRequest,
	membershipController.addMultipleMembershipsAtOnce);

// update multiple memberships at once
router.put("/:userId/update-memberships-at-once", requireAuth({
	acceptedAuthModes: [AUTH_MODE_JWT],
}), param("userId").exists().trim(),
	body("membershipsToUpdate").isArray().exists(),
	validateRequest,
	membershipController.updateMultipleMembershipsAtOnce);

// delete multiple memberships at once
router.delete("/:userId/delete-memberships-at-once", requireAuth({
	acceptedAuthModes: [AUTH_MODE_JWT],
}), param("userId").exists().trim(),
	body("membershipsToDelete").isArray().exists(),
	validateRequest,
	membershipController.deleteMultipleMembershipsAtOnce);

router.get( // TODO endpoint: deprecate - used for old CLI (deprecate)
	"/:workspaceId/connect",
	requireAuth({
		acceptedAuthModes: [AuthMode.JWT],
	}),
	param("workspaceId").exists().trim(),
	validateRequest,
	membershipController.validateMembership
);

router.delete( // TODO endpoint: check dashboard
	"/:membershipId",
	requireAuth({
		acceptedAuthModes: [AuthMode.JWT],
	}),
	param("membershipId").exists().trim(),
	validateRequest,
	membershipController.deleteMembership
);

router.post( // TODO endpoint: check dashboard
	"/:membershipId/change-role",
	requireAuth({
		acceptedAuthModes: [AuthMode.JWT],
	}),
	body("role").exists().trim(),
	validateRequest,
	membershipController.changeMembershipRole
);

router.post( // TODO endpoint: check dashboard
	"/:membershipId/deny-permissions",
	requireAuth({
		acceptedAuthModes: [AuthMode.JWT],
	}),
	param("membershipId").isMongoId().exists().trim(),
	body("permissions").isArray().exists(),
	validateRequest,
	EEMembershipControllers.denyMembershipPermissions
);



export default router;
