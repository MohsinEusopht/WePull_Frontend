import {encryptStorage} from "./encryptStorage";

const defaultHeader = {
    "Content-Type": "application/json"
};

const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${encryptStorage.getItem("token")}`,
};

export { headers, defaultHeader };