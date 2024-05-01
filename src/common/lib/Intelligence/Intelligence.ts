import type { ConversationTree } from "@/common/lib/ConversationTree/ConversationTree.ts";
import type { TreeNodeID } from "@/common/lib/Tree/Tree.ts";
import type { Stream } from "effect/Stream";

export enum SupportedIntelligence {
	GPT4 = "GPT4",
}

export interface Intelligence {
	readonly getName: () => SupportedIntelligence;
	readonly getCompletion: (
		tree: ConversationTree,
		node: TreeNodeID,
	) => Stream<unknown>;
	readonly cancelCompletion: () => void;
}
