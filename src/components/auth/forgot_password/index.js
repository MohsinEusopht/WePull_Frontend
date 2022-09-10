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
function forgotPassword(props) {
    const navigate = useNavigate();

    const error_code = useParams().error_code?useParams().error_code:null;

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState(true);
    const [emailErrorText, setEmailErrorText] = useState("");
    const [isLogin, setIsLogin] = useState(false);
    const [isLinkSent, setIsLinkSent] = useState(false);
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
        checkLoginStatus();
    },[]);

    const sendLink = async () => {
        const body = {
            email: email
        }
        const loadingToast = toast.loading('Loading...');
        let url = makeUrl('users','/forgotPassword');
        const sendingLink = axios.post(url, body).then((response) => {
            toast.remove(loadingToast);
            if(response.data.status === 200) {
                setIsLinkSent(true);
            }
            else {
                toast.error(response.data.message);
            }
        });
    }

    const handleForgotPassword = async () => {

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

        if(email !== "" && validator.isEmail(email)) {
            await sendLink();
        }
    }

    return (<div style={{position:"relative",width:"100%",height:"100vh", display: isLogin?"block":"none"}} className={"multiBackground"}>
        <div className={"col-md-4 offset-md-4 centerDiv"}>
            <img src={logo} width={"40%"} className={"mx-auto d-block"}/>
            <hr/>
            <h4>Forgot Password</h4>
            <p className={"text-center border rounded pt-2 pb-2"} style={{backgroundColor:"rgba(65, 204, 173,0.4)",display:(isLinkSent?"block":"none")}}>We've sent a password reset link to your email.</p>
            <label className={"db-label"}>Email</label>
            <input type={"email"} className={"form-control"} placeholder={"Enter email address"} onInput={(e) => {
                setEmail(e.target.value);
                setEmailError(false);
            }}/>
            <span className={"error-text"} style={{display: emailError}}>{emailErrorText}</span>
            <br/>
            <button className={"btn custom_btn"} style={{width:"100%"}} onClick={handleForgotPassword}>Send Me Password Reset Link</button>
            <p className={"text-center mt-2"}>Remember your password? <a href={"/#/login"} className={"anchor"}>Sign in</a></p>
        </div>
    </div>)
}

export default forgotPassword;