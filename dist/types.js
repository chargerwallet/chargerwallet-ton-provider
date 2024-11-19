export var ConnectEventErrorMessage;
(function (ConnectEventErrorMessage) {
    ConnectEventErrorMessage["UNKNOWN_ERROR"] = "Unknown error";
    ConnectEventErrorMessage["BAD_REQUEST"] = "Bad request";
    ConnectEventErrorMessage["APP_MANIFEST_NOT_FOUND"] = "App manifest not found";
    ConnectEventErrorMessage["APP_MANIFEST_CONTENT_ERROR"] = "App manifest content error";
    ConnectEventErrorMessage["UNKNOWN_APP"] = "Unknown app";
    ConnectEventErrorMessage["USER_DECLINED"] = "User declined the connection";
})(ConnectEventErrorMessage || (ConnectEventErrorMessage = {}));
export var SendTransactionErrorMessage;
(function (SendTransactionErrorMessage) {
    SendTransactionErrorMessage["UNKNOWN_ERROR"] = "Unknown error";
    SendTransactionErrorMessage["BAD_REQUEST_ERROR"] = "Bad request";
    SendTransactionErrorMessage["UNKNOWN_APP_ERROR"] = "Unknown app";
    SendTransactionErrorMessage["USER_REJECTS_ERROR"] = "User rejects";
    SendTransactionErrorMessage["METHOD_NOT_SUPPORTED"] = "Method is not supported";
})(SendTransactionErrorMessage || (SendTransactionErrorMessage = {}));
