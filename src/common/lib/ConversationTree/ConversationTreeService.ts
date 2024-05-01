import type {
	ConversationTree,
	ConversationTreeEvent,
} from "@/common/lib/ConversationTree/ConversationTree.ts";
import { Context, type PubSub, type SubscriptionRef } from "effect";

export class ConversationTreeService extends Context.Tag(
	"ConversationTreeService",
)<
	ConversationTreeService,
	{
		readonly conversationTree: SubscriptionRef.SubscriptionRef<ConversationTree>;
		readonly publish: PubSub.PubSub<ConversationTreeEvent>["publish"];
	}
>() {}
