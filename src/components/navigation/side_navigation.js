import React, { useEffect, useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../../assets/image/logo.png';
import {encryptStorage} from "../../assets/js/encryptStorage";
import moment from "moment";
import {logout} from "../../assets/js/logout";
import {makeUrl} from "../../assets/js/makeUrl";
import {toast} from "react-hot-toast";
import {useNavigate} from "react-router";
import {navigate} from "../../assets/js/helper";
import NavBar from "./nav_bar";
import {
    faBuilding,
    faCodeBranch,
    faDashboard,
    faMoneyCheckDollar,
    faNetworkWired, faRightFromBracket,
    faShop, faSitemap,
    faTruck, faUser, faUserCircle,
    faUsers
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export default function SideNavigation(props){
    const [visibility, setVisibility] = useState(true);
    useEffect(()=> {
        // console.log("vis",props.visibility);
    },[]);

    // const navigate = useNavigate();
    let logoutStatus = false;
    const logoutHandle = async () => {
        // console.log("logout")
        if(!logoutStatus) {
            logoutStatus = true;
            const response = await logout();
            // console.log(response);
            const toastId = toast.loading('Signing off...');
            setTimeout(async () => {
                toast.remove(toastId);
                if(response.status) {
                    // toast.success(response.message);
                    navigate("/login");
                }
            },1500);
        }
    }

    const handleDashboardClick = () => {
        if(encryptStorage.getItem("current-page") !== "dashboard") {
            props.setLoading(true);
            props.changeVisibility();
            navigate('/dashboard');
        }
    }

    const handleExpensesClick = () => {
        if(encryptStorage.getItem("current-page") !== "expenses") {
            props.setLoading(true);
            props.changeVisibility();
            navigate('/expenses');
        }
    }

    const handleCompaniesClick = () => {
        if(encryptStorage.getItem("current-page") !== "companies") {
            props.setLoading(true);
            props.changeVisibility();
            navigate('/companies');
        }
    }

    const handleCategoriesClick = () => {
        if(encryptStorage.getItem("current-page") !== "categories") {
            props.setLoading(true);
            props.changeVisibility();
            navigate('/categories');
        }
    }

    const handleSuppliersClick = () => {
        if(encryptStorage.getItem("current-page") !== "suppliers") {
            props.setLoading(true);
            props.changeVisibility();
            navigate('/suppliers');
        }
    }

    const handleUsersClick = () => {
        if(encryptStorage.getItem("current-page") !== "users") {
            props.setLoading(true);
            props.changeVisibility();
            navigate('/users');
        }
    }


    const renderUserMenu = () => {
        if(encryptStorage.getItem("user-type") === "user") {
            return (<>
                <div className={"nav-items mt-3 cursor-pointer"}>
                    <span className={encryptStorage.getItem("current-page") === "dashboard" ? "active": ""} onClick={handleDashboardClick}>Dashboard</span>
                    <span className={encryptStorage.getItem("current-page") === "expenses" ? "active": ""} onClick={handleExpensesClick}>Expenses</span>
                    <span className={encryptStorage.getItem("current-page") === "suppliers" ? "active": ""} onClick={handleSuppliersClick}>Suppliers</span>
                    <span onClick={logoutHandle}>Sign out</span>
                </div>
            </>);
        }

        return;
    }

    const renderAdminMenu = () => {
        if(encryptStorage.getItem("user-type") === "admin") {
            return (<>
                <div className={"nav-items mt-3 cursor-pointer"}>
                    <span className={encryptStorage.getItem("current-page") === "dashboard" ? "active": ""} onClick={handleDashboardClick}><FontAwesomeIcon icon={faDashboard}/> Dashboard</span>
                    <span className={encryptStorage.getItem("current-page") === "users" ? "active": ""} onClick={handleUsersClick}><FontAwesomeIcon icon={faUsers}/> Users</span>
                    <span className={encryptStorage.getItem("current-page") === "companies" ? "active": ""} onClick={handleCompaniesClick}><FontAwesomeIcon icon={faBuilding}/> Companies</span>
                    <span className={encryptStorage.getItem("current-page") === "expenses" ? "active": ""} onClick={handleExpensesClick}><FontAwesomeIcon icon={faMoneyCheckDollar}/> Expenses</span>
                    <span className={encryptStorage.getItem("current-page") === "suppliers" ? "active": ""} onClick={handleSuppliersClick}><FontAwesomeIcon icon={faTruck}/> Suppliers</span>
                    <span className={encryptStorage.getItem("current-page") === "categories" ? "active": ""} onClick={handleCategoriesClick}><FontAwesomeIcon icon={faCodeBranch}/> Categories</span>
                    <span onClick={logoutHandle}><FontAwesomeIcon icon={faRightFromBracket}/> Sign out</span>
                </div>
            </>);
        }

        return;
    }



    return(
        <div className={"side-nav m-0"} style={{right:(props.visibility===1?"0":"-270px")}}>
            <div className={"userInfo"}>
                {/*<h3>Hi, {encryptStorage.getItem("username")?encryptStorage.getItem("username"):null}</h3>*/}
                <h5 title={"View Profile"} onClick={props.goToProfile} className={"username-badge"}><FontAwesomeIcon icon={faUserCircle}/> {encryptStorage.getItem("user")? encryptStorage.getItem("user").first_name + " " + encryptStorage.getItem("user").last_name:""}</h5>
                <h6>{encryptStorage.getItem('user-type')?encryptStorage.getItem('user-type').toUpperCase():null}</h6>
            </div>
            <hr style={{width:"60%",margin:"auto"}}/>
            {renderUserMenu()}
            {renderAdminMenu()}
            <span className={"sync_at"}>Last synced at <b>{moment(props.lastSyncDate).format('DD-MMM-YYYY hh:mm A')}</b></span>
        </div>
    );
}