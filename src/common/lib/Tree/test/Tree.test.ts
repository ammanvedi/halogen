import type { ErrorTree } from "@/common/lib/Error.ts";
import { Tree, type TreeNode } from "@/common/lib/Tree/Tree.ts";
import * as E from "effect/Either";
import { beforeEach, describe, expect, it, vi } from "vitest";

const TEST_META = {
	myMeta: "myMeta",
};

vi.mock("@utils/id.ts", () => ({
	createID: () => "child",
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
