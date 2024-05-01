import type { ApplicationError } from "@/common/lib/Error.ts";
import { SupportedIntelligence } from "@/common/lib/Intelligence/Intelligence.ts";
import { Context, type Effect } from "effect";

type Configuration = {
	intelligence: {
		[SupportedIntelligence.GPT4]: {
			apiKey?: string;
		};
	};
};

export class ConfigurationService extends Context.Tag("ConfigurationService")<
	ConfigurationService,
	{
		readonly getConfiguration: () => Effect.Effect<
			Configuration,
			ApplicationError
		>;
	}
>() {}
