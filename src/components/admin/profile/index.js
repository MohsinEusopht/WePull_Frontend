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
import icons from '../../../assets/image/icons';
function profile(props) {
    const navigate = useNavigate();
    const [user, setUser] = useState([]);
    const [email, setEmail] = useState(encryptStorage.getItem('user').email);
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${encryptStorage.getItem("token")}`,
    };

    //run when render
    useEffect(() => {
        // toast.success('Successfully toasted!')
        console.log("admin profile")
        const user = encryptStorage.getItem('user');
        setUser(user);
        encryptStorage.setItem("current-page","profile");
        // console.log(encryptStorage.getItem("current-page"))
        setTimeout(() => {
            props.setLoading(false);
        }, 800)
    }, []);

    let refreshingEmail = false;
    const handleSyncEmail = async () => {
        if(!refreshingEmail) {
            refreshingEmail = true;
            const loadingToast = toast.loading('Refreshing email...');
            let url = "";
            if (encryptStorage.getItem("company-type") === "xero") {
                url = makeUrl('xero',`sync/email/${encryptStorage.getItem('uid')}`);
            }
            else {
                url = makeUrl('quickbooks',`sync/email/${encryptStorage.getItem('uid')}/${encryptStorage.getItem('company-id')}`);
            }
            await axios.get(url, {headers}).then((res) => {
                console.log("res",res);
                toast.remove(loadingToast);
                if(res.data.status === 200) {
                    refreshingEmail = false;
                    toast.success(res.data.message);
                    encryptStorage.setItem('user', res.data.user);
                    setEmail(res.data.user.email);
                }
                else {
                    refreshingEmail = false;
                    toast.error(res.data.message);
                }
            });
        }
    }

    return (<div style={{overflow:"hidden"}}>
        <div className={"col-md-12 row mt-4 p-2"} style={{height:"100vh",display:"flex",alignItems:"center"}}>
            <div className={"col-md-6 offset-md-3 col-lg-6 offset-lg-3 col-xl-4 offset-xl-4 mt-2"}>
                <div className={"col-md-12 bg-white p-2 rounded shadow-sm p-3"}>
                    <h5 className={"app_text_color text-center"}>Account Information</h5>
                    <hr width={"60%"}/>
                    <table className={"table no-border"}>
                        <tbody>
                        <tr>
                            <th>First Name</th>
                            <td>{user.first_name}</td>
                        </tr>
                        <tr>
                            <th>Last Name</th>
                            <td>{user.last_name}</td>
                        </tr>
                        <tr>
                            <th>Email</th>
                            <td>{email}
                            <span><img src={icons.refresh} style={{cursor:"pointer",float:"right"}} title={"Refresh Email Address"} onClick={handleSyncEmail} width={"20px"}/></span></td>
                        </tr>
                        <tr>
                            <th>Company Type</th>
                            <td>{encryptStorage.getItem('company-type').toUpperCase()}</td>
                        </tr>
                        <tr>
                            <th>Active Company</th>
                            <td>{encryptStorage.getItem('company-name')}</td>
                        </tr>
                        <tr>
                            <th>Status</th>
                            <td><span className={"badge badge-success"}>ACTIVE</span></td>
                        </tr>
                        <tr>
                            <th>Activation Date</th>
                            <td>{moment(user.created_at).format("DD-MMMM-YYYY")}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            {/*<div className={"col-md-8 mt-2"}>*/}
            {/*    <div className={"col-md-12 bg-white p-2 rounded shadow-sm"} style={{height:"1000px"}}>*/}
            {/*        <h1>Companies</h1>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    </div>)
}

export default profile;