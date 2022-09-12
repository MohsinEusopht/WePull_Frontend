import React, {useState, useEffect} from "react";
import config from '../../../configs/config';
import logo from '../../../assets/image/logo.png';
import axios from 'axios';
import {headers, defaultHeader} from '../../../assets/js/request_header';
import {makeUrl} from "../../../assets/js/makeUrl";
import {encryptStorage} from '../../../assets/js/encryptStorage';
import {addHours, checkLogin, currency_list} from '../../../assets/js/helper';
import moment from "moment";
import { toast } from "react-hot-toast";
import {useNavigate, useParams} from "react-router";
import { errors } from "../../../assets/js/error";
import validator from 'validator'
function login(props) {
    const navigate = useNavigate();

    const error_code = useParams().error_code?useParams().error_code:null;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState(true);
    const [emailErrorText, setEmailErrorText] = useState("");
    const [passwordError, setPasswordError] = useState(true);
    const [passwordErrorText, setPasswordErrorText] = useState("");

    const [isLogin, setIsLogin] = useState(false);
    props.setLoading(false);
    const checkLoginStatus = async () => {
        await checkLogin().then((res) => {
            if(res) {
                navigate('/dashboard');
                setIsLogin(false);
            }
            else{

                setIsLogin(true);
            }
        });
    }
    //run when render
    useEffect(() => {
        // toast.success('Successfully toasted!')
        if(error_code) {
            console.log("errors.find(el => el.code === error_code)",errors.find(x => x.code.toString() === error_code.toString()));
            toast.error(errors.find(x => x.code.toString() === error_code.toString()).message);
            navigate("/")
        }
        checkLoginStatus();
    },[]);

    let loginStatus = false;
    const performLogin = async (email, password) => {
        if(!loginStatus) {
            loginStatus = true;
            let data = {
                email: email,
                password: password
            }
            const loadingToast = toast.loading('Loading...');
            let url = makeUrl('users', 'login');
            setTimeout(async () => {
                await axios.post(url , data, {}).then((res) => {
                    toast.remove(loadingToast);
                    if (res.data.status === 200) {
                        toast.success('Sign in Successfully!');
                        res.data.data.password = "";
                        let token = res.data.token;
                        let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
                        let user = JSON.stringify(res.data.data);
                        encryptStorage.setItem("token", token);
                        encryptStorage.setItem("user", user);
                        encryptStorage.setItem("uid", res.data.data.id);
                        encryptStorage.setItem("username", res.data.data.first_name);
                        encryptStorage.setItem("company-id", res.data.data.company_id);
                        encryptStorage.setItem("company-type", res.data.data.user_type);
                        encryptStorage.setItem("user-type", res.data.data.role_id===1?'admin':'user');
                        encryptStorage.setItem("expired-at",  moment(addHours(3)).unix())
                        encryptStorage.setItem("timezone", timezone);
                        encryptStorage.setItem("company-name", res.data.company_data.company_name);
                        encryptStorage.setItem("currency-code", res.data.company_data.currency);
                        encryptStorage.setItem("current-page", 'dashboard');
                        if (res.data.company_data.currency !== null) {
                            let currency = currency_list.filter(el => el.name ===  res.data.company_data.currency);
                            encryptStorage.setItem("currency-symbol", currency[0].code);
                        }
                        navigate('/dashboard');
                    }
                    else if(res.data.status === 500 || res.data.status === 0) {
                        const errorMsg = toast.error(res.data.message);
                        loginStatus = false;
                    }
                });
            }, 1000);
        }
    }

    const handleLogin = async () => {
        if (!validator.isEmail(email)) {
            await setEmailError(true);
            await setEmailErrorText("Please enter valid email address.");
            if(email === "") {
                await setEmailError(true);
                await setEmailErrorText("Email is required.");
            }
        } else {
            await setEmailError(false);
            await setEmailErrorText("");
        }

        if(password === "") {
            await setPasswordError(true);
            await setPasswordErrorText("Password is required");
        }

        if(email !== "" && password !== "" && validator.isEmail(email)) {
            await performLogin(email, password);
        }
    }

    return (<div style={{position:"relative",width:"100%",height:"100vh", display: isLogin?"block":"none"}} className={"multiBackground"}>
        <div className={"col-lg-4 offset-lg-4 col-md-6 offset-md-3 centerDiv"}>
            <img src={logo} width={"40%"} className={"mx-auto d-block"}/>
            <hr/>
            <h4>Login</h4>
            <br/>
            <label className={"db-label"}>Email</label>
            <input type={"email"} className={"form-control"} placeholder={"Enter email address"} onInput={(e) => {
                setEmail(e.target.value);
                setEmailError(false);
            }}/>
            <span className={"error-text"} style={{display: emailError}}>{emailErrorText}</span>
            <br/>
            <label className={"db-label"}>Password</label>
            <input type={"password"} className={"form-control"} placeholder={"Enter password"} onInput={(e) => {
                setPassword(e.target.value);
                setPasswordError(false);
            }}/>
            <span className={"error-text"} style={{display: passwordError}}>{passwordErrorText}</span>
            <br/>
            <button className={"btn custom_btn"} style={{width:"100%"}} onClick={handleLogin}>Sign In</button>
            <a className={"anchor"} href={"/#/forgot-password"}><p className={"text-center mt-3"} style={{marginBottom:"0px"}}>Forgot Password?</p></a>
            <p className={"text-center"}>Don't have an account? <a href={"/#/sign-up"} className={"anchor"}>Sign up</a></p>
            <hr/>
            <div style={{display: "flex", justifyContent: "space-evenly"}}>
                <a href={makeUrl('xero','auth/login')} className={"xeroBtn"}>Sign in with Xero</a>
                <a href={makeUrl('quickbooks','auth/login')} className={"qbBtn"}>Sign in with Intuit</a>
            </div>
        </div>
    </div>)
}

export default login;