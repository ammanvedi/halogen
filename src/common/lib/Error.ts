import type { TreeNodeID } from "@/common/lib/Tree/Tree.ts";

export type ErrorTreeParentNotFound = {
	_tag: "ErrorTreeParentNotFound";
	parentID: TreeNodeID;
};

export const createErrorTreeParentNotFound =
	(parentID: TreeNodeID) => (): ErrorTreeParentNotFound => {
		return {
			_tag: "ErrorTreeParentNotFound",
			parentID,
		};
	};

export type ErrorTreeNodeNotFound = {
	_tag: "ErrorTreeNodeNotFound";
	nodeID: TreeNodeID;
};

export const createErrorTreeNodeNotFound =
	(nodeID: TreeNodeID) => (): ErrorTreeNodeNotFound => {
		return {
			_tag: "ErrorTreeNodeNotFound",
			nodeID,
		};
	};

export type ErrorTreeNodeAlreadyExists = {
	_tag: "ErrorTreeNodeAlreadyExists";
	nodeID: TreeNodeID;
};

export const createErrorTreeNodeAlreadyExists =
	(nodeID: TreeNodeID) => (): ErrorTreeNodeAlreadyExists => {
		return {
			_tag: "ErrorTreeNodeAlreadyExists",
			nodeID,
		};
	};

export type ErrorTreeCircularRelationshipCreated = {
	_tag: "ErrorTreeCircularRelationshipCreated";
	circularPath: TreeNodeID[];
};

export const createErrorTreeCircularRelationshipCreated =
	(circularPath: TreeNodeID[]) => (): ErrorTreeCircularRelationshipCreated => {
		return {
			_tag: "ErrorTreeCircularRelationshipCreated",
			circularPath,
		};
	};

export type ErrorTree =
	| ErrorTreeParentNotFound
	| ErrorTreeNodeNotFound
	| ErrorTreeNodeAlreadyExists
	| ErrorTreeCircularRelationshipCreated;

export type ApplicationError = ErrorTree;
