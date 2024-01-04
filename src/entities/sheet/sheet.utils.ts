import { Action } from "./logic/actions/action";
import { BasicAction } from "./logic/actions/basic";
import { Lookup } from "./logic/actions/lookup";
import { ActionType, Sheet } from "./sheet.type";

export const actionFactory: Record<keyof typeof ActionType, Action> = {
    basic: new BasicAction(),
    lookup: new Lookup()
}

//TODO think how to break this
export const getActionType = (value: any): keyof typeof ActionType => {
    if (isLookup(value)) return ActionType.lookup
    else return ActionType.basic
}

export const isLookup = (value: string) => /^lookup\(\w+,\d+\)$/.test(value)