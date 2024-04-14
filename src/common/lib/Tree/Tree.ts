import {
	type ErrorTree,
	type ErrorTreeNodeAlreadyExists,
	type ErrorTreeNodeNotFound,
	createErrorTreeNodeAlreadyExists,
	createErrorTreeNodeNotFound,
} from "@/common/lib/Error.ts";
import { type ID, createID } from "@utils/id.ts";
import { pipe } from "effect";
import * as E from "effect/Either";

export type TreeNode<Meta> = {
	id: ID;
	parent: TreeNodeID;
	meta: Meta;
	children: Set<ID>;
};

type TreeRoot<Meta> = Omit<TreeNode<Meta>, "parent" | "id"> & {
	id: "root";
	parent: null;
};

type TreeNodeOrRoot<Meta> = TreeNode<Meta> | TreeRoot<Meta>;

export type TreeNodeID = (TreeNode<unknown> | TreeRoot<unknown>)["id"];

type InternalTreeMap<Meta> = {
	root: TreeRoot<Meta>;
	[id: ID]: TreeNode<Meta>;
};

export type Tree<Meta> = InternalTreeMap<Meta>;

const editNode = <
	Meta,
	NodeType extends TreeNode<Meta> | TreeRoot<Meta>,
	EditableProps = NodeType["id"] extends "root"
		? Omit<TreeRoot<Meta>, "id" | "parent">
		: Omit<TreeNode<Meta>, "id">,
>(
	node: NodeType,
	properties: EditableProps,
): NodeType => {
	return {
		...node,
		...properties,
	};
};

const replaceNode =
	<Meta>(tree: InternalTreeMap<Meta>) =>
	(
		node: TreeNodeOrRoot<Meta>,
	): E.Either<InternalTreeMap<Meta>, ErrorTreeNodeNotFound> => {
		return pipe(
			getNode(tree)(node.id),
			E.map(() => ({
				...tree,
				[node.id]: node,
			})),
		);
	};

const addChildToNode =
	<Meta>(tree: InternalTreeMap<Meta>) =>
	(node: TreeNodeID) =>
	(child: ID): E.Either<InternalTreeMap<Meta>, ErrorTree> => {
		return pipe(
			getNode(tree)(node),
			E.map((node) =>
				editNode(node, {
					children: new Set([...node.children, child]),
				}),
			),
			E.flatMap(replaceNode(tree)),
		);
	};

const getNode =
	<Meta>(tree: InternalTreeMap<Meta>) =>
	(id: TreeNodeID): E.Either<TreeNodeOrRoot<Meta>, ErrorTreeNodeNotFound> => {
		return pipe(tree[id], E.fromNullable(createErrorTreeNodeNotFound(id)));
	};

const addNodeToTree =
	<Meta>(tree: InternalTreeMap<Meta>) =>
	(
		node: TreeNode<Meta>,
	): E.Either<InternalTreeMap<Meta>, ErrorTreeNodeAlreadyExists> => {
		return pipe(
			getNode(tree)(node.id),
			E.flip,
			E.mapLeft(createErrorTreeNodeAlreadyExists(node.id)),
			E.map(() => ({
				...tree,
				[node.id]: node,
			})),
		);
	};

const createNode =
	<Meta>(parent: TreeNode<Meta>["parent"]) =>
	(meta: Meta): TreeNode<Meta> => {
		return {
			id: createID(),
			children: new Set(),
			parent,
			meta,
		};
	};

const addNodeWithParent =
	<Meta>(tree: InternalTreeMap<Meta>) =>
	(
		parentId: TreeNodeID,
		meta: Meta,
	): E.Either<[InternalTreeMap<Meta>, TreeNode<Meta>], ErrorTree> => {
		const newNode = createNode<Meta>(parentId)(meta);
		return pipe(
			E.right(newNode),
			E.flatMap((newNode) => addChildToNode(tree)(parentId)(newNode.id)),
			E.flatMap((tree) => addNodeToTree(tree)(newNode)),
			E.map((tree) => [tree, newNode]),
		);
	};

const createTree = <Meta>(meta: Meta): Tree<Meta> => {
	return {
		root: {
			id: "root",
			meta,
			children: new Set(),
			parent: null,
		},
	};
};

export const Tree = {
	addNodeWithParent,
	createTree,
};
