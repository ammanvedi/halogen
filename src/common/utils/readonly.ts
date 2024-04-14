import { Brand, Option as O } from "effect";

const freeze = <T>(
	o: Brand.Brand.Unbranded<T>,
): O.Option<Brand.Brand.BrandErrors> => {
	try {
		Object.freeze(o);
		return O.none();
	} catch (e) {
		return O.some([
			{
				message: e instanceof Error ? e.message : JSON.stringify(e),
				meta: e,
			},
		]);
	}
};

export type RO<T> = Readonly<T> & Brand.Brand<"Readonly">;

export const RO = <T>(unbr: Brand.Brand.Unbranded<RO<T>>) =>
	Brand.refined<RO<T>>((unbranded) => freeze<RO<T>>(unbranded))(unbr);

export type DeepReadonly<T> = Readonly<{
	[K in keyof T]: T[K] extends number | string | symbol
		? Readonly<T[K]>
		: Readonly<DeepReadonly<T[K]>>;
}>;
