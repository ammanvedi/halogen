import { ConversationTreeService } from "@/common/lib/ConversationTree/ConversationTreeService.ts";
import type { ApplicationError } from "@/common/lib/Error.ts";
import type { SupportedIntelligence } from "@/common/lib/Intelligence/Intelligence.ts";
import { IntelligenceService } from "@/common/lib/Intelligence/IntelligenceService.ts";
import { Tree } from "@/common/lib/Tree/Tree.ts";
import {
	Console,
	Context,
	Effect,
	Exit,
	PubSub,
	Queue,
	Ref,
	Schedule,
	Scope,
} from "effect";
import { SubscriptionRef } from "effect";

type ConversationNodeIntelligenceTextResponse = {
	intelligence: SupportedIntelligence;
	text: string;
	type: "ConversationNodeIntelligenceResponse";
};

type ConversationNodeSystemTextInstruction = {
	text: string;
	type: "ConversationNodeSystemInstruction";
};

type ConversationNodeUserTextInstruction = {
	text: string;
	type: "ConversationNodeUserInstruction";
};

type ConversationNodeRootNode = {
	defaultIntelligence: SupportedIntelligence;
	type: "ConversationNodeRootNode";
};

type ConversationNodeMeta =
	| ConversationNodeIntelligenceTextResponse
	| ConversationNodeSystemTextInstruction
	| ConversationNodeUserTextInstruction
	| ConversationNodeRootNode;

export type ConversationTree = Tree<ConversationNodeMeta>;

/**
 * tree instance itself should be a service that can be injected
 * all operations on the tree
 * 1. update text in the tree on a node
 */

type ConversationTreeInstance = {
	tree: ConversationTree;
};

/**
 * THIS SHOULD BE TRIGGERED BY AN EVENT AND CAN PUBLISH ITS OWN EVENTS
 */
const addNewUserMessage = Effect.gen(function* (_) {
	const treeService = yield* _(ConversationTreeService);
	const tree = yield* _(Ref.get(treeService.conversationTree));
	const x = yield* _(Tree.walkToRoot(tree)("root"));
});

const handleTreeEvent = (dq: Queue.Dequeue<ConversationTreeEvent>) =>
	Effect.gen(function* (_) {
		yield* _(
			Queue.take(dq).pipe(
				Effect.flatMap((a) => {
					return Console.log(a);
				}),
			),
		);
	});

export type ConversationTreeEvent = { type: "init" };

export const buildConversationTree = (
	rootMeta: Omit<ConversationNodeRootNode, "type">,
): Effect.Effect<
	{
		tree: SubscriptionRef.SubscriptionRef<ConversationTree>;
		destroy: () => Promise<void>;
		readonly publish: (e: ConversationTreeEvent) => Promise<boolean>;
	},
	ApplicationError,
	IntelligenceService
> =>
	Effect.gen(function* (_) {
		const intelligence = yield* _(IntelligenceService);
		const tree: ConversationTree = Tree.createTree({
			...rootMeta,
			type: "ConversationNodeRootNode",
		});
		const treeRef = yield* _(SubscriptionRef.make(tree));
		const treeEventChannel = yield* _(
			PubSub.bounded<ConversationTreeEvent>(20),
		);
		const treeScope = yield* _(Scope.make());

		const dq = yield* _(
			PubSub.subscribe(treeEventChannel),
			/**
			 * Provide our own scope so the subscription can remain when this function
			 * exits, it'll be destroyed when destroy is called
			 */
			Scope.extend(treeScope),
		);

		yield* _(
			Effect.forkIn(
				Effect.repeat(
					Queue.take(dq).pipe(
						Effect.map((d) => {
							console.log("sdssds", d);
							return d;
						}),
						Effect.tap(() => {
							console.log("hththth");
						}),
					),
					Schedule.forever,
				),
				treeScope,
			),
		);

		const helperContext = Context.empty().pipe(
			Context.add(IntelligenceService, intelligence),
			Context.add(ConversationTreeService, {
				conversationTree: treeRef,
				publish: treeEventChannel.publish,
			}),
		);

		return {
			tree: treeRef,
			//addNewUserMessage: Effect.provide(addNewUserMessage, helperContext),
			destroy: () => {
				return Effect.runPromise(Scope.close(treeScope, Exit.unit));
			},
			publish: (a: ConversationTreeEvent) =>
				Effect.runPromise(treeEventChannel.publish(a)),
		};
	});
