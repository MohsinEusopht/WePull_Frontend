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
function profile(props) {
    const navigate = useNavigate();
    const [user, setUser] = useState([]);
    const [categories, setCategories] = useState([]);
    const [firstName, setFirstName] = useState(encryptStorage.getItem('user').first_name)
    const [lastName, setLastName] = useState(encryptStorage.getItem('user').last_name)
    const [isChangePassword, setIsChangePassword] = useState(false);
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${encryptStorage.getItem("token")}`,
    };

    const getUserCategories = async (id) => {
        let url = makeUrl('users',`getUserAssignedCategoriesByUserID/${encryptStorage.getItem("company-id")}/${id}`);
        console.log("url",url)
        console.log("headers",headers);
        await axios
            .get(url, {headers})
            .then((res) => {
                let categoriesArray = [];
                for (let category of res.data.data) {
                    // console.log("depart.depart_name",depart.depart_name);
                    categoriesArray.push({"name": category.category_name});
                }

                setCategories(categoriesArray);
            });
    }

    //run when render
    useEffect(() => {
        // toast.success('Successfully toasted!')
        encryptStorage.setItem("current-page","profile");
        props.setLoading(true);
        getUserCategories(encryptStorage.getItem('uid')).then(() => {
            // console.log("categories",categories);
            setTimeout(() => {
                props.setLoading(false);
            }, 1500)
        });
        setUser(encryptStorage.getItem('user'));
    }, []);

    const handleUpdateUserProfile = async () => {
        const body = {
            user_id: encryptStorage.getItem("user").id,
            first_name: firstName,
            last_name: lastName
        }

        let url = makeUrl('users','/updateUserProfile');
        await axios.post(url, body, {headers}).then((res) => {
            if(res.data.status === 200) {
                console.log("updated", res.data);
                toast.success(res.data.message)
                encryptStorage.setItem("user",res.data.user);
                setFirstName(res.data.user.first_name);
                setLastName(res.data.user.last_name);
            }
            else {
                toast.error(res.data.message)
            }
        })
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
                                <td>
                                    <input type={"text"} className={"form-control"} value={firstName} onInput={(e) => {setFirstName(e.target.value)}}/>
                                </td>
                            </tr>
                            <tr>
                                <th>Last Name</th>
                                <td>
                                    <input type={"text"} className={"form-control"} value={lastName} onInput={(e) => {setLastName(e.target.value)}}/>
                                </td>
                            </tr>
                            <tr>
                                <th>Email</th>
                                <td>{user.email}</td>
                            </tr>
                            <tr>
                                <th>Company</th>
                                <td>{encryptStorage.getItem('company-name')}</td>
                            </tr>
                            <tr>
                                <th>Activation Date</th>
                                <td>{moment(user.created_at).format('DD-MMMM-YYYY')}</td>
                            </tr>
                            <tr>
                                <th className={"no-border"} colSpan={2}>Assigned Categories</th>
                            </tr>
                            <tr>
                                <td className={"no-border"} colSpan={2}>
                                    <div className={"categories-badge-div"}>
                                    {
                                        categories.map((part, id) => (
                                            <span key={id} className={"badge badge-custom"}>
                                                {part.name}
                                            </span>
                                        ))
                                    }
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td></td>
                                <td className={"no-border"}>
                                    <button className={"btn custom_btn"} style={{float:"right"}} onClick={handleUpdateUserProfile}>Update</button>
                                    <button className={"btn btn-light"} style={{float:"right",marginRight:"10px"}} onClick={()=>{
                                        // isChangePassword?setIsChangePassword(false):setIsChangePassword(true)
                                        navigate('/profile/change-password')
                                    }}>Change Password</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>)
}

export default profile;