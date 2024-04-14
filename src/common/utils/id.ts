import {Brand} from "effect";
import {v4} from "uuid";

export type ID = string & Brand.Brand<'ID'>

const ID = Brand.nominal<ID>()

export const createID = () => {
    return ID(v4())
}