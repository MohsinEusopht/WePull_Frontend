import React, {useState, useEffect} from "react";
import logo from "../../../assets/image/logo.png";
import {checkLogin} from "../../../assets/js/helper";
import {useNavigate} from "react-router";
import config from '../../../configs/config';
import {makeUrl} from "../../../assets/js/makeUrl";

function signup(props) {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");

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
        checkLoginStatus();
    },[]);

    return (<div style={{position:"relative",width:"100%",height:"100vh", display: isLogin?"block":"none"}} className={"multiBackground"}>
        <div className={"col-lg-4 offset-lg-4 col-md-6 offset-md-3 centerDiv"}>
            <img src={logo} width={"40%"} className={"mx-auto d-block"}/>
            <hr/>
            <h4 className={"text-center"}>Sign Up</h4><br/>
            <div style={{display: "flex", justifyContent: "space-evenly"}}>
                <a href={makeUrl('xero','auth/sign-up')} className={"xeroBtn"}>Sign up with Xero</a>
                <a href={makeUrl('quickbooks','auth/sign-up')} className={"qbBtn"}>Sign up with Intuit</a>
            </div>
            <hr/>
            <p className={"text-center"}>Already have an account? <a href={"/#/login"} className={"anchor"}>Sign In</a></p>
        </div>
    </div>)
}

export default signup;