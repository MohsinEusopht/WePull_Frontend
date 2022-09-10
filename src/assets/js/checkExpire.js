import moment from "moment";
import {encryptStorage} from "./encryptStorage";
let result = null;
const check = () => {
    let expire_at = moment.unix(encryptStorage.getItem("expired-at")).toISOString();
    let currentTime = new Date().toISOString();

    if(currentTime > expire_at) {
        result = true;
        // toast.error("Expired")
    }
    else {
        result = false;
        // toast.error("Not Expired")
    }
    return result;
}

export default check