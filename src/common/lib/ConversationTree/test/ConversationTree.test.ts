import { buildConversationTree } from "@/common/lib/ConversationTree/ConversationTree.ts";
import { SupportedIntelligence } from "@/common/lib/Intelligence/Intelligence.ts";
import { IntelligenceService } from "@/common/lib/Intelligence/IntelligenceService.ts";
import { Console, Context, Effect, Schedule } from "effect";
import { describe, it, vi } from "vitest";

describe("ConversationTree", () => {
	it("should work", async () => {
		const intelligenceService = {
			getIntelligence: vi.fn(),
		};

		const context = Context.empty().pipe(
			Context.add(IntelligenceService, intelligenceService),
		);

		const result = await Effect.runPromise(
			Effect.provide(
				buildConversationTree({
					defaultIntelligence: SupportedIntelligence.GPT4,
				}),
				context,
			),
		);

		console.log("heh");
		await result.publish({
			type: "init",
		});

		await result.publish({
			type: "init",
		});

		await result.publish({
			type: "init",
		});
	});
});
