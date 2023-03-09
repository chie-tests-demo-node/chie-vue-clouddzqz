import {CrossResponseErr} from "../../types";

export default class CrossFormResponseError extends Error {

    /**
     * 错误编码
     */
    code: string | number;

    /**
     * 错误的方法签名
     */
    errNameSign: string | undefined;

    /**
     * 成功的条数
     */
    successLength: number | undefined;

    /**
     * 一共要操作的条数
     */
    totalOperateLength: number | undefined;

    /**
     * 错误JSon数据
     */
    jsonData: any | undefined;

    /**
     * 错误string数据
     */
    strData: string | undefined;

    constructor(err: CrossResponseErr) {
        super(err.message);
        this.name = "CrossFormRequestSendError";
        this.code = err.code;
        this.errNameSign = err.errNameSign;

        this.successLength = err.successLength;
        this.totalOperateLength = err.totalOperateLength;
        this.jsonData = err.jsonData;
        this.strData = err.strData;

        // 解决this指向为当前
        // Object.setPrototypeOf(this, CrossFormResponseError.prototype);

    }


}