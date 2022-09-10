import {encryptStorage} from "./encryptStorage";

export const logout = () => {
    // if (email) {
        encryptStorage.removeItem("token");
        encryptStorage.removeItem("user");
        encryptStorage.removeItem("uid");
        encryptStorage.removeItem("username");
        encryptStorage.removeItem("company-id");
        encryptStorage.removeItem("company-type");
        encryptStorage.removeItem("user-type");
        encryptStorage.removeItem("expired-at")
        encryptStorage.removeItem("timezone");
        encryptStorage.removeItem("company-name");
        encryptStorage.removeItem("currency-code");
        encryptStorage.removeItem("currency-symbol");
        encryptStorage.removeItem("current-page");
    // }
    const data = {
        status: 1,
        message: "Logout successfully!"
    }
    return data;
}