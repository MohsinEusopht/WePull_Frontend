import React, {lazy, useEffect, useState} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from '../../assets/image/logo.png';
import SideNavigation from "./side_navigation";
import icons from "../../assets/image/icons";
import moment from "moment";
import {encryptStorage} from "../../assets/js/encryptStorage";
import {useNavigate} from "react-router";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faCloudArrowDown, faUser} from '@fortawesome/free-solid-svg-icons'
import {makeUrl} from "../../assets/js/makeUrl";
import axios from "axios";
import {toast} from "react-hot-toast";
import {currency_list} from "../../assets/js/helper";
import loadingSyncingImage from '../../assets/image/cloudSync1.gif';
import loadingImg from '../../assets/image/loading2.gif';
export default function NavBar(props){
    const navigate = useNavigate();
    const [navIconStatus, setNavIconStatus] = useState(0);
    const [navIcon, setNavIcon] = useState(icons.menu);
    const [syncIcon, setSyncIcon] = useState(icons.sync);
    const [profileIcon, setProfileIcon] = useState(icons.profile);
    const [sideBarVisibility, setSideBarVisibility] = useState(0);
    const [companies, setCompanies] = useState([]);
    const [lastSyncDate, setLastSyncDate] = useState("");
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

    useEffect(()=>{
        console.log("load nav");
        getLastSyncDate();

        if(encryptStorage.getItem("user") && encryptStorage.getItem("user").role_id === 1) {
            getCompanies(encryptStorage.getItem("uid")).then((response)=>{
                setCompanies(response);
                // console.log("resss",response)
            });
        }

        setNavIconStatus(0);
        setSideBarVisibility(0);
        setNavIcon(icons.menu);
    },[]);


   const handleNavClick = () => {
       if(navIconStatus === 0) {
           setNavIconStatus(1);
           setSideBarVisibility(1);
           setNavIcon(icons.menu_cross);
       }
       else {
           setNavIconStatus(0);
           setSideBarVisibility(0);
           setNavIcon(icons.menu);
       }
   }

   const handleProfileClick = () => {
       console.log("profile lcick")
       if(encryptStorage.getItem("current-page") !== "profile") {
           props.setLoading(true);
           encryptStorage.setItem("current-page", "profile");
           navigate('/profile');
           setNavIconStatus(0);
           setSideBarVisibility(0);
           setNavIcon(icons.menu);
       }
   }

   const handleVisible = () => {
       setNavIconStatus(0);
       setSideBarVisibility(0);
       setNavIcon(icons.menu);
   }

   const getLastSyncDate = async () => {
        let company_id = encryptStorage.getItem("company-id");
        await axios
            .get(
                makeUrl('users',`/getLastSyncedActivity/${company_id}/All`),
                {headers}
            )
            .then((res) => {
                // console.log("res.data.data[0].created_at",res.data.data.created_at);
                setLastSyncDate(res.data.data?res.data.data.created_at:null);
            });
    }

   const activateCompany = async (company_id) => {
       axios(makeUrl('users',`company/activate/${company_id}/${encryptStorage.getItem("uid")}`), {headers})
           .then((res) => {
                if(res.data.status === 200) {
                    console.log("activate",res.data);
                    encryptStorage.setItem("company-id", res.data.company_data.id);
                    encryptStorage.setItem("company-name", res.data.company_data.company_name);
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
                    toast.success(res.data.message);
                    setNavIconStatus(0);
                    setSideBarVisibility(0);
                    setNavIcon(icons.menu);
                    navigate("/");

                    console.log("now curr",encryptStorage.getItem("currency-code"));
                }
            })
   }


   const handleCompanyActivation = async (e) => {
       console.log("company_id", e.target.value);
       await activateCompany(e.target.value);
   }

   const handleAllSync = async () => {
       props.setLoading(true, loadingSyncingImage);
       let url = "";
       if(encryptStorage.getItem("company-type") === "xero") {
           if(encryptStorage.getItem("user-type") === "admin") {
               url = makeUrl('xero',`/sync/all/${encryptStorage.getItem("uid")}/${encryptStorage.getItem("company-id")}`);
           }
           else {
               url = makeUrl('xero',`/sync/all/${encryptStorage.getItem("user").created_by}/${encryptStorage.getItem("company-id")}`);
           }
       }
       else if(encryptStorage.getItem("company-type") === "quickbooks") {
           if(encryptStorage.getItem("user-type") === "admin") {
               url = makeUrl('quickbooks',`/sync/all/${encryptStorage.getItem("uid")}/${encryptStorage.getItem("company-id")}`);
           }
           else {
               url = makeUrl('quickbooks',`/sync/all/${encryptStorage.getItem("user").created_by}/${encryptStorage.getItem("company-id")}`);
           }
       }

       if(url !== "") {
           axios.get(url, {headers}).then((res) => {
               props.setLoading(false, loadingImg);
               if(res.data.status === 200) {
                   toast.success(res.data.message);
                   navigate("/");
               }
               else {
                   toast.error(res.data.message);
               }
           });
       }
       else {
           toast.error("Something went wrong, Please try again")
       }
   }


    return(<div>
        <nav className="bg-white shadow-sm pt-3 pb-3" style={{zIndex:"999",position:"fixed",paddingRight:"20px",paddingLeft:"20px",width:"100%"}}>
            <div className="h-full flex items-center" style={{float:"right",verticalAlign:"middle",justifyContent:"center",paddingTop:"5px",position:"relative"}}>

                <img className={"cursor-pointer nav-icon"} title={"Last synced at "+moment(lastSyncDate).format('DD-MMM-YYYY hh:mm A')} onClick={handleAllSync} width={"35px"} style={{marginRight:"20px"}} src={syncIcon}/>
                <img className={"cursor-pointer " + (encryptStorage.getItem("current-page")==="profile"?"nav-icon-active":"nav-icon")} title={"View Profile"} width={"35px"} style={{marginRight:"20px"}} src={profileIcon} onClick={handleProfileClick}/>
                <img className={"cursor-pointer nav-icon"} title={navIconStatus?"Hide Navigation":"Show Navigation"} onClick={handleNavClick} width={"40px"} src={navIcon}/>

                {encryptStorage.getItem("user-type") === "admin"?
                    <div className={"company-select-div"}>
                        <label className={"db-label"}>Active company</label>
                        <select onChange={handleCompanyActivation} className={"form-control company-select"}>
                            {companies.length>0?companies.map((part, id) => (
                                <option value={part.id} selected={part.active_status===1?true:false}>{part.company_name}</option>
                            )):""}
                        </select>
                    </div>
                    :""}
                {/*<FontAwesomeIcon icon={faCloudArrowDown} title={"Last synced at "+moment(new Date()).format('DD-MMM-YYYY')} className={"cursor-pointer nav-icon"} style={{height:"20px"}}/>*/}
                {/*<FontAwesomeIcon icon={faUser} title={"Profile"} className={"cursor-pointer nav-icon"} onClick={handleProfileClick} style={{height:"20px"}}/>*/}
                {/*<FontAwesomeIcon icon={navIcon} title={navIconStatus?"Hide Navigation":"Show Navigation"} onClick={handleNavClick} style={{height:(navIconStatus === 1 ? "23px":"20px")}} className={"cursor-pointer nav-icon"}/>*/}
            </div>
            <div className="flex justify-between h-16">
                <div className="h-full flex items-center">
                    <div className="ml-5 flex items-center">
                        <a href={"/"}>
                            <img
                                alt="logo"
                                className="object-between h-10 mt-2 mb-1 cursor-pointer" style={{width:"140px"}}
                                src={logo}
                            />
                        </a>
                    </div>
                </div>
            </div>
        </nav>
        <SideNavigation setLoading={props.setLoading} lastSyncDate={lastSyncDate} visibility={sideBarVisibility} goToProfile={handleProfileClick} changeVisibility={handleVisible} />
    </div>);
}