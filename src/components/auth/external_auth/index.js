import React, {useState, useEffect} from "react";
import logo from "../../../assets/image/logo.png";
import {addHours, checkLogin, currency_list} from "../../../assets/js/helper";
import {useNavigate, useParams} from "react-router";
import config from '../../../configs/config';
import {makeUrl} from "../../../assets/js/makeUrl";
import axios from "axios";
import {toast} from "react-hot-toast";
import {encryptStorage} from "../../../assets/js/encryptStorage";
import moment from "moment";
import sync from '../../../assets/image/sync.gif';

function externalAuth(props) {
    const navigate = useNavigate();

    const type = useParams().type;
    const email = useParams().email;
    const company_type = useParams().company_type;
    const token = useParams().token;

    const [name, setName] = useState("");

    async function login(email, token) {
        const body = {
            email: email,
            token: token
        };

        await axios
            .post(makeUrl('users','auth_login'), body)
            .then((res) => {
                console.log("res",res);
                if (res.data.status === 200) {
                    setName(res.data.data.first_name);
                    toast.success(res.data.message);
                    console.log()
                    res.data.data.password = "";
                    let token = res.data.token;
                    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                    let user = JSON.stringify(res.data.data);
                    encryptStorage.setItem("token", token);
                    encryptStorage.setItem("user", user);
                    encryptStorage.setItem("uid", res.data.data.id);
                    encryptStorage.setItem("username", res.data.data.first_name);
                    encryptStorage.setItem("company-id", res.data.company_data.id);
                    encryptStorage.setItem("company-type", res.data.data.user_type);
                    encryptStorage.setItem("user-type", res.data.data.role_id===1?'admin':'user');
                    encryptStorage.setItem("expired-at",  moment(addHours(3)).unix())
                    encryptStorage.setItem("timezone", timezone);
                    encryptStorage.setItem("company-name", res.data.company_data.company_name);
                    encryptStorage.setItem("current-page", 'dashboard');
                    if (res.data.company_data.currency !== null) {
                        console.log("currency-code is not null");
                        encryptStorage.setItem("currency-code", res.data.company_data.currency);
                        let currency = currency_list.filter(el => el.name ===  res.data.company_data.currency);
                        encryptStorage.setItem("currency-symbol", currency[0].code);
                    }
                    else {
                        encryptStorage.setItem("currency-code", "USD");
                        encryptStorage.setItem("currency-symbol", "$");
                    }
                    return true;
                }
                else if(res.data.status === 500) {
                    const errorMsg = toast.error(res.data.message);
                    return false;
                }
            })
            .catch((err) => console.log("error while auth login",err));
    }

    //run when render
    useEffect( () => {
        console.log("HEREE in auth");
        if(type === "sign-up") {
            props.setLoading(false);
            setTimeout(()=> {
                login(email, token).then((res) => {
                    if(res) {
                        navigate('/dashboard');
                    }
                    else {
                        navigate('/sign-up');
                    }
                });
            },5000)
        }
        else {
            login(email, token).then((res) => {
                props.setLoading(false);
                if(res) {
                    navigate('/dashboard');
                }
                else {
                    navigate('/sign-up');
                }
            });
        }

    },[]);

    return (<div style={{position:"relative",width:"100%",height:"100vh",display: type === "sign-up"?"block":"none"}} className={type === "sign-up"?"bg-light":"bg-white"}>
        <div className={"col-md-4 offset-md-4 centerDiv bg-white shadow-sm"}>
            <img src={logo} width={"40%"} className={"mx-auto d-block"}/>
            <hr/>
            <img src={sync} style={{width:"300px"}} className={"mx-auto d-block"} alt={"Syncing Data..."}/>
            <h2 className={"text-center mt-2"}>Hi, {name}</h2>
            <h5 className={"text-center"}>{type === "login"? "Welcome Back!": "Welcome To WePull"}</h5>
            <h6 className={"text-center"}>We are collecting your information from {company_type}...</h6>
        </div>
    </div>)
}

export default externalAuth;