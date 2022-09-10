import React, {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import {encryptStorage} from '../../../assets/js/encryptStorage';
import {makeUrl} from "../../../assets/js/makeUrl";
import { toast } from "react-hot-toast";
import logo from "../../../assets/image/logo.png";

function resetPassword(props) {
    const [password, setPassword] = useState("");
    const [passValid, setPassValid] = useState(true);

    const [confirmPassword, setConfirmPassword] = useState("");
    const [confirmValid, setConfirmValid] = useState(true);


    const [firstCondition, setFirstCondition] = useState(false);
    const [secondCondition, setSecondCondition] = useState(false);
    const [thirdCondition, setThirdCondition] = useState(false);
    const [forthCondition, setForthCondition] = useState(false);

    const [allFieldSet, setAllFieldSet] = useState(false);
    const [PWFocus, setPWFocus] = useState(false);
    const email = useParams().email;
    const token = useParams().token;

    let navigate = useNavigate();

    function hasLowerCase(str) {
        return (/[a-z]/.test(str));
    }

    function hasUpperCase(str) {
        return (/[A-Z]/.test(str));
    }

    function hasNumber(str) {
        return (/[1-9]/.test(str));
    }

    function hasSpecial(str) {
        let format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
        return (format.test(str));
    }

    const checkForgotPasswordToken = async () => {
        const body = {
            email: email,
            token: token
        }
        await axios
            .post(makeUrl('users',`/checkForgotPasswordToken`),body)
            .then(async (res) => {
                // console.log(res.data.data);
                if (res.data.status === 200) {
                    props.setLoading(false);

                } else {
                    toast.error(res.data.message);
                    navigate("/");
                }
            });
    }

    useEffect( () => {
        checkForgotPasswordToken();
    },[])

    const handlePassword = (e) => {
        setPassword(e.target.value);
        checkAllFields();
        console.log("e.target.value.length",e.target.value.length);
        if(e.target.value.length >= 6) {
            setFirstCondition(true);
            // console.log(firstCondition)
        }
        else {
            setFirstCondition(false);
        }

        if(hasUpperCase(e.target.value) && hasLowerCase(e.target.value)) {
            setSecondCondition(true);
        }
        else {
            setSecondCondition(false);
        }

        if(hasNumber(e.target.value)) {
            setThirdCondition(true);
        }
        else {
            setThirdCondition(false);
        }


        if(hasSpecial(e.target.value)) {
            setForthCondition(true);
        }
        else {
            setForthCondition(false);
        }

        if(e.target.value.length >= 6 && hasUpperCase(e.target.value) && hasLowerCase(e.target.value) && hasNumber(e.target.value) && hasSpecial(e.target.value)) {
            setPassValid(true);
        }
        else{
            setPassValid(false);
        }
    };

    const handleFocus = () => {
        setPWFocus(true);
    }

    const handleFocusOut = () => {
        setPWFocus(false);
    }

    const handleConfirmPassword = (e) => {
        setConfirmPassword(e.target.value);
        if(password === e.target.value) {
            setConfirmValid(true);
        }
        else {
            setConfirmValid(false);
        }

        checkAllFields();
    };

    const checkAllFields = () => {
        let res = false;
        if(confirmPassword !== "" && password !== "") {
            res = true;
            setAllFieldSet(true);
        }
        else {
            setAllFieldSet(false);
        }

        return res;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            if(password !== "" && confirmPassword !== "") {
                const body = {
                    email: email,
                    password: password
                };
                console.log(body);
                await axios.post(makeUrl('users', `/resetUserPassword`), body).then((response) =>{
                    if(response.data.status === 200) {
                        toast.success(response.data.message);
                        navigate('/login');
                    }
                    else {
                        toast.error(response.data.message);
                    }
                });
            }
        } catch (e) {
            console.log(e);
        }
    }
    return (
        <div className="bg-light">
            <div className="col-md-4 offset-md-4 p-3 bg-white centerDiv">
                <div className="mb-6 flex justify-center">
                    <img
                        alt="logo"
                        width={"40%"} className={"mx-auto d-block"}
                        src={logo}
                    />
                </div>
                <hr width={"60%"} />
                <h5 className="app_text_color text-center">
                    Reset Password
                </h5>
                <form onSubmit={handleSubmit}>
                    <div className={"mt-3"} style={{position:"relative"}}>
                        <label className="db-label">
                            New Password
                        </label>
                        <input
                            type="password"
                            className={"form-control"}
                            placeholder="Enter user password"
                            value={password}
                            pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{7,20}$"
                            onChange={handlePassword}
                            onFocus={handleFocus}
                            onBlur={handleFocusOut}
                            required={true}
                        />
                        <span style={{color:"red",fontSize:"11px"}}>{passValid ? "" : "Please fulfill the password requirements"}</span>
                        <div className={"bg-white"} style={{display:(PWFocus?"block":"none"),position:"absolute",bottom:"-130px",backgroundColor:"red",right:"0",paddingRight:"30px",paddingLeft:"30px",borderRadius:"10px",border:"1px solid #333",zIndex:"999"}}>
                            <p style={{fontWeight:"600"}}>Password Requirements</p>
                            <ul id="ul" style={{fontSize:"12px",listStyleType:"none",marginLeft:"-50px"}}>
                                <li className={firstCondition?"firstTrue":"firstFalse"}>At least 7 characters.</li>
                                <li className={secondCondition?"firstTrue":"firstFalse"}>Contains uppercase and lowercase letters.</li>
                                <li className={thirdCondition?"firstTrue":"firstFalse"}>Contains numbers.</li>
                                <li className={forthCondition?"firstTrue":"firstFalse"}>Contains at least one special character, <br/>e.g., ! @ # ? ]</li>
                            </ul>
                        </div>
                    </div>
                    <div className={"mt-3"}>
                        <label className="db-label">
                            Confirm Password
                        </label>
                        <input
                            type="password"
                            className={"form-control"}
                            placeholder="Confirm password"
                            // pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*_=+-]).{6,20}$"
                            onChange={handleConfirmPassword}
                            // onClick={() => {setConfirmValid(false)}}
                            required={true}
                        />
                        <span style={{color:"red",fontSize:"11px"}}>{confirmValid ? "" : "Password do not match"}</span>
                    </div>
                    <br/>
                    <br/>

                    <button
                        type="submit"
                        className={"btn custom_btn"}
                        style={{float:"right"}}
                        disabled={
                            (confirmValid
                                ? (passValid ?
                                    (allFieldSet ?
                                        false
                                        : true)
                                    : true)
                                : true)}
                    >
                        Reset Password
                    </button><br/><br/>
                    <span style={{color:"red",fontSize:"11px",float:"right"}}>{(confirmValid
                        ? (passValid ?
                            allFieldSet ?
                                ""
                                : "Please complete all requirements"
                            : "Please complete all requirements")
                        : "Please complete all requirements")}</span>
                </form>
            </div>
        </div>
    );
}

export default resetPassword;
