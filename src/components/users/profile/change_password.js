import React, {useState, useEffect} from "react";
import config from '../../../configs/config';
import logo from '../../../assets/image/logo.png';
import axios from 'axios';
import {headers, defaultHeader} from '../../../assets/js/request_header';
import {makeUrl} from "../../../assets/js/makeUrl";
import {encryptStorage} from '../../../assets/js/encryptStorage';
import {addHours, currency_list} from '../../../assets/js/helper';
import moment from "moment";
import { toast } from "react-hot-toast";
import NavBar from "../../navigation/nav_bar";
import SideNavigation from "../../navigation/side_navigation";
import {useNavigate} from "react-router";
function change_password(props) {
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState("")

    const [password, setPassword] = useState("")
    const [passValid, setPassValid] = useState(true);

    const [confirmPassword, setConfirmPassword] = useState("")
    const [confirmValid, setConfirmValid] = useState(true);

    const [allFieldSet, setAllFieldSet] = useState(false);
    const [firstCondition, setFirstCondition] = useState(false);
    const [secondCondition, setSecondCondition] = useState(false);
    const [thirdCondition, setThirdCondition] = useState(false);
    const [forthCondition, setForthCondition] = useState(false);

    const [PWFocus, setPWFocus] = useState(false);
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${encryptStorage.getItem("token")}`,
    };


    //run when render
    useEffect(() => {
        // toast.success('Successfully toasted!')
        encryptStorage.setItem("current-page","profile")
        setTimeout(() => {
            props.setLoading(false);
        }, 1500)
    }, []);

    const handleChangePassword = async () => {
        if(currentPassword !== "" && password !== "" && confirmPassword !== "") {
            setAllFieldSet(true);
            const body = {
                user_id: encryptStorage.getItem("user").id,
                current_password: currentPassword,
                password: password
            }

            let url = makeUrl('users','/changeUserPassword');
            await axios.post(url, body, {headers}).then((res) => {
                if(res.data.status === 200) {
                    console.log("updated", res.data);
                    toast.success(res.data.message)
                    navigate('/profile');
                }
                else {
                    toast.error(res.data.message)
                }
            })
        }
        else {
            setAllFieldSet(false);
        }
    }

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
        if(confirmPassword !== "" && password !== "" && currentPassword !== "") {
            res = true;
            setAllFieldSet(true);
        }
        else {
            setAllFieldSet(false);
        }

        return res;
    }

    return (<div style={{overflow:"hidden"}}>
        <div className={"col-md-12 row mt-4 p-2"} style={{height:"100vh",display:"flex",alignItems:"center"}}>
            <div className={"col-md-6 offset-md-3 col-lg-6 offset-lg-3 col-xl-4 offset-xl-4 mt-2"}>
                <div className={"col-md-12 bg-white p-2 rounded shadow-sm p-3"}>
                    <h5 className={"app_text_color text-center"}>Change Password</h5>
                    <hr width={"60%"}/>

                    <label className={"db-label"}>
                        Current Password
                    </label>
                    <input type={"password"} className={"form-control"} placeholder={"Enter Current Password"} onChange={(e) => { setCurrentPassword(e.target.value); checkAllFields();}}/>
                    <div style={{position:"relative"}}>
                        <label className={"db-label mt-3"}>
                            New Password
                        </label>
                        <input type={"password"} className={"form-control"} placeholder={"Enter New Password"} onFocus={handleFocus} onBlur={handleFocusOut} onChange={handlePassword}/>
                        <span style={{color:"red",fontSize:"11px"}}>{passValid ? "" : "Please fulfill the password requirements"}</span>
                        <div className={"bg-white"} style={{width:"250px",display:(PWFocus?"block":"none"),position:"absolute",bottom:"-165px",backgroundColor:"red",right:"0",paddingRight:"30px",paddingLeft:"30px",borderRadius:"10px",border:"1px solid #333",zIndex:"999"}}>
                            <p style={{fontWeight:"600"}}>Password Requirements</p>
                            <ul id="ul" style={{fontSize:"12px",listStyleType:"none",marginLeft:"-50px"}}>
                                <li className={firstCondition?"firstTrue":"firstFalse"}>At least 7 characters.</li>
                                <li className={secondCondition?"firstTrue":"firstFalse"}>Contains uppercase and lowercase letters.</li>
                                <li className={thirdCondition?"firstTrue":"firstFalse"}>Contains numbers.</li>
                                <li className={forthCondition?"firstTrue":"firstFalse"}>Contains at least one special character, <br/>e.g., ! @ # ? ]</li>
                            </ul>
                        </div>
                    </div>
                    <label className={"db-label mt-3"}>
                        Confirm Password
                    </label>
                    <input type={"password"} className={"form-control"} placeholder={"Enter Confirm Password"} onChange={handleConfirmPassword}/>
                    <span style={{color:"red",fontSize:"11px"}}>{confirmValid ? "" : "Password do not match"}</span>
                    <br/>
                    <button className={"btn custom_btn"} disabled={
                        (confirmValid
                            ? (passValid ?
                                (allFieldSet ?
                                    false
                                    : true)
                                : true)
                            : true)} style={{float:"right"}} onClick={handleChangePassword}>Save</button>
                    <button onClick={() => {navigate("/profile")}} className={"btn btn-danger"} style={{float:"right",marginRight:"10px"}}>Cancel</button>
                    <br/><br/>
                    <span style={{color:"red",fontSize:"11px",float:"right"}}>{(confirmValid
                        ? (passValid ?
                            allFieldSet ?
                                ""
                                : "Please complete all requirements"
                            : "Please complete all requirements")
                        : "Please complete all requirements")}</span>
                    <br/>
                </div>
            </div>
        </div>
    </div>)
}

export default change_password;