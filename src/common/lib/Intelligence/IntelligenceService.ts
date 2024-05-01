import type { ConfigurationService } from "@/common/lib/Configuration/ConfigurationService.ts";
import type { ApplicationError } from "@/common/lib/Error.ts";
import type {
	Intelligence,
	SupportedIntelligence,
} from "@/common/lib/Intelligence/Intelligence.ts";
import { Context, type Effect } from "effect";

export class IntelligenceService extends Context.Tag("IntelligenceService")<
	IntelligenceService,
	{
		readonly getIntelligence: (
			type: SupportedIntelligence,
		) => Effect.Effect<Intelligence, ApplicationError, ConfigurationService>;
	}
>() {}
