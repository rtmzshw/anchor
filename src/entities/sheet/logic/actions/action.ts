import { Sheet } from "../../sheet.type";

export interface Action {
    calcValue(sheet: Sheet, value: any): any
    validate(sheetId: string, columnId: string,row:number, value: any): Promise<boolean>
}