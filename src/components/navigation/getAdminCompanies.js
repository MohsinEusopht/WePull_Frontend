import {encryptStorage} from "../../assets/js/encryptStorage";
import {makeUrl} from "../../assets/js/makeUrl";
import {lazy} from "react";
import axios from "axios";

const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${encryptStorage.getItem("token")}`,
};
const getCompanies = async (user_id) => {
    let url = makeUrl('users', `getCompanies/${user_id}`);
    let response = null;
    if(url) {
        lazy(
            await axios.get(url, {headers})
                .then((res) => {
                    if(res.data.status === 200) {
                        response = res.data.data;
                    }
                    else{
                        console.log(res.data.message);
                    }
                })
        );
    }
    return response;
}
export const getAdminCompanies = async () => {
    let companies = null;
    if(encryptStorage.getItem("user").role_id === 1) {
        await getCompanies(encryptStorage.getItem("uid")).then((response)=>{
            companies = response;
        });
    }
    return companies;
}