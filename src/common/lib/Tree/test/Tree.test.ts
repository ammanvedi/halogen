import type { ErrorTree } from "@/common/lib/Error.ts";
import { Tree, type TreeNode } from "@/common/lib/Tree/Tree.ts";
import { createID } from "@utils/id.ts";
import { pipe } from "effect";
import * as E from "effect/Either";
import {
	type Mock,
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";

const TEST_META = {
	myMeta: "myMeta",
};

vi.mock("@utils/id.ts", () => ({
	createID: vi.fn(() => "child"),
}));

describe("Tree", () => {
	describe("createTree", () => {
		let result: Tree<typeof TEST_META>;

		beforeEach(() => {
			result = Tree.createTree(TEST_META);
		});

		it("should create the tree correctly", () => {
			expect(result).toEqual({
				root: {
					id: "root",
					parent: null,
					meta: TEST_META,
					children: new Set(),
				},
			});
		});
	});

	describe("walkToRoot", () => {
		beforeEach(() => {
			(createID as Mock).mockImplementation(
				(() => {
					let ct = 0;

					return () => {
						ct++;
						return `child${ct}`;
					};
				})(),
			);
		});

		afterEach(() => {
			(createID as Mock).mockImplementation(() => "child");
		});

		it("should return an error when a node doesnt exist", () => {
			const tree = Tree.createTree(TEST_META);
			const result = Tree.walkToRoot(tree)(createID());
			expect(result).toMatchObject(E.left({ _tag: "ErrorTreeNodeNotFound" }));
		});

		it("should return the correct path when only the root exists", () => {
			const tree = Tree.createTree(TEST_META);
			const result = Tree.walkToRoot(tree)("root");
			expect(result).toMatchObject(
				E.right([
					{
						children: new Set(),
						id: "root",
						meta: {
							myMeta: "myMeta",
						},
						parent: null,
					},
				]),
			);
		});

		it("should return the correct path when there are multiple nodes in the path", () => {
			const result = pipe(
				Tree.createTree(TEST_META),
				(tree) => Tree.addNodeWithParent(tree)("root", TEST_META),
				E.flatMap(([tree, node]) =>
					Tree.addNodeWithParent(tree)(node.id, TEST_META),
				),
				E.flatMap(([tree, node]) =>
					Tree.addNodeWithParent(tree)(node.id, TEST_META),
				),
				E.flatMap(([tree, node]) => Tree.walkToRoot(tree)(node.id)),
			);

			expect(result).toMatchObject(
				E.right([
					{
						id: "child3",
						children: new Set(),
						parent: "child2",
						meta: TEST_META,
					},
					{
						id: "child2",
						children: new Set(["child3"]),
						parent: "child1",
						meta: TEST_META,
					},
					{
						id: "child1",
						children: new Set(["child2"]),
						parent: "root",
						meta: TEST_META,
					},
					{
						id: "root",
						meta: TEST_META,
						children: new Set(["child1"]),
						parent: null,
					},
				]),
			);
		});
	});

	describe("addNodeWithParent", () => {
		let tree: Tree<typeof TEST_META>;
		let result: E.Either<
			[Tree<typeof TEST_META>, TreeNode<typeof TEST_META>],
			ErrorTree
		>;

		beforeEach(() => {
			tree = Tree.createTree(TEST_META);
			result = Tree.addNodeWithParent(tree)("root", TEST_META);
		});

		it("should add the node correctly", () => {
			expect(result).toMatchObject(
				E.right([
					{
						root: {
							id: "root",
							parent: null,
							meta: TEST_META,
							children: new Set(["child"]),
						},
						child: {
							id: "child",
							parent: "root",
							meta: TEST_META,
							children: new Set(),
						},
					},

					{
						id: "child",
						parent: "root",
						meta: TEST_META,
						children: new Set(),
					},
				]),
			);
		});
	});
});
