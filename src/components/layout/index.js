import React, {useState, useEffect} from "react";
import NavBar from "../navigation/nav_bar";
import {useNavigate} from "react-router";
import {checkLogin, navigate} from "../../assets/js/helper";
import {toast} from "react-hot-toast";
import {encryptStorage} from "../../assets/js/encryptStorage";
import {logout} from "../../assets/js/logout";
function layout(props) {
    // const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(false);
    const checkExp = require('../../assets/js/checkExpire');

    const checkIsSessionExpire = async () => {
        let isExpired = checkExp.default();
        console.log("is session expire", isExpired);
        if(isExpired) {
            const response = await logout();
            const toastId = toast.loading('Session expired, Please login again.');
            setTimeout(async () => {
                toast.remove(toastId);
                if(response.status) {
                    navigate("/login");
                }
            }, 800);
        }
        return isExpired;
    }

    const checkLoginStatus = async () => {
        let checkLoginStatus = null;
        await checkLogin().then((res) => {
            if (!res) {
                toast.error("Token expired, Please login again.");
                navigate('/login');
                setIsLogin(false);
                checkLoginStatus = false;
            }
            else {
                checkLoginStatus = true;
                setIsLogin(true);
            }
        });

        return checkLoginStatus;
    }

    //run when render
    useEffect( () => {
        // props.setLoading(true);
        console.log("dashboard")
        checkLoginStatus().then((resCheck) => {
            checkIsSessionExpire().then((res) => {

            });
            console.log("checkLoginStatus",resCheck)
        });


        // toast.success('Successfully toasted!')
    },[]);



    return (<div style={{display: isLogin?"block":"none" }}>
        <NavBar setLoading={props.setLoading} />
        {/*Layout to render all page*/}
        {/*below div will render page that pass by child attribute in helper.js*/}
        <div className={"col-md-12 content pt-1"}>{props.child}</div>
    </div>)
}

export default layout;