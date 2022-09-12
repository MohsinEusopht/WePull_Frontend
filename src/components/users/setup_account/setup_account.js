import React, {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import axios from "axios";
import {encryptStorage} from '../../../assets/js/encryptStorage';
import {makeUrl} from "../../../assets/js/makeUrl";
import { toast } from "react-hot-toast";
import logo from "../../../assets/image/logo.png";

function SetupAccount(props) {
    const [tac, setTac] = useState(false);
    const [fname, setFirst] = useState(null);
    const [lname, setSecond] = useState(null);
    const [phone, setPhone] = useState(null);
    const [password, setPassword] = useState("");
    const [confirmpassword, setConfirmPassword] = useState("");

    const [fnamevalid, setFnameValid] = useState(false);
    const [lnamevalid, setLnameValid] = useState(false);
    const [passvalid, setPassValid] = useState(false);
    const [confirmvalid, setConfirmValid] = useState(true);
    const [firstCondition, setFirstCondition] = useState(false);
    const [secondCondition, setSecondCondition] = useState(false);
    const [thirdCondition, setThirdCondition] = useState(false);
    const [forthCondition, setForthCondition] = useState(false);

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

    const handleTerm = async (e) => {
        const checked = e.target.checked;
        if(checked) {
            await setTac(true);
        }
        else {
            await setTac(false);
        }
    }

    const checkUserAccount = async () => {
       await axios
            .get(makeUrl('users',`/checkSetupAccount/${email}/${token}`))
            .then(async (res) => {
                // console.log(res.data.data);
                if (res.data.data === 1) {
                    // setBody(true);
                    props.setLoading(false);
                } else {
                    // setBody(false);
                    toast.error("Link Expired");
                    alert("Link Expired");
                    navigate("/");
                }
            });
    }

    useEffect( () => {
        checkUserAccount();
    },[])

    const handlefirstName = (e) => {
        setFirst(e.target.value);
        setFnameValid(false);
    };
    const handlelastName = (e) => {
        setSecond(e.target.value);
        setLnameValid(false);
    };
    const handlePhone = (e) => {
        setPhone(e.target.value);
    };
    const handlePassword = (e) => {
        setPassword(e.target.value);
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
    };
    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const body = {
                email: email,
                first_name: fname,
                last_name: lname,
                contact: phone,
                password: password
            };
            console.log(body);
            let response = await axios.post(makeUrl('users', `/updateAccountInformation`), body);
            toast.success("Account information has been updated successfully");
            toast.success("Now you can login your account with your email and password");

            setTimeout(function () {
                navigate('/');
            }, 800)
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
                        Account Setup
                    </h5>
                    <form onSubmit={handleSubmit}>
                        <div className={"row mt-3"}>
                            <div className={"col-md-6"}>
                                <label className="db-label">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    className={"form-control"}
                                    placeholder="Jone"
                                    value={fname}
                                    minLength={3}
                                    onChange={handlefirstName}
                                    required={true}
                                />
                            </div>
                            <div className={"col-md-6"}>
                                <label className="db-label">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    className={"form-control"}
                                    placeholder="Doe"
                                    value={lname}
                                    minLength={3}
                                    onChange={handlelastName}
                                    required={true}
                                />
                            </div>
                        </div>
                        <div className={"mt-3"} style={{position:"relative"}}>
                            <label className="db-label">
                                Password
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
                            <span style={{color:"red",fontSize:"11px"}}>{passvalid ? "" : "Please fulfill the password requirements"}</span>
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
                            <span style={{color:"red",fontSize:"11px"}}>{confirmvalid ? "" : "Password do not match"}</span>
                        </div>
                        <input type={"checkbox"} className={"mt-3"} onChange={handleTerm} /> I agree to the <a style={{color:"#41ccad",textDecoration:"underline"}}>Terms of service</a> and <a style={{color:"#41ccad",textDecoration:"underline"}}>Privacy policy</a>
                        <br />
                        <br/>

                        <button
                            type="submit"
                            className={"btn custom_btn"}
                            style={{float:"right"}}
                            disabled={
                                (confirmvalid
                                ? (tac ?
                                        (passvalid ?
                                            false :
                                            true)
                                        : true)
                                : true)}
                        >
                            Save And Continue
                        </button><br/><br/>
                        <span style={{color:"red",fontSize:"11px",float:"right"}}>{(confirmvalid
                            ? (tac ?
                                (passvalid ?
                                    "" :
                                    "Please complete all requirements")
                                : "Please complete all requirements")
                            : "Please complete all requirements")}</span>
                    </form>
            </div>
        </div>
    );
}

export default SetupAccount;
