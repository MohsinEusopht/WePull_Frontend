import React, {useState, useEffect, lazy} from "react";
import config from '../../../configs/config';
import logo from '../../../assets/image/logo.png';
import axios from 'axios';
import {headers, defaultHeader} from '../../../assets/js/request_header';
import {makeUrl} from "../../../assets/js/makeUrl";
import {encryptStorage} from '../../../assets/js/encryptStorage';
import {addHours, currency_list, navigate} from '../../../assets/js/helper';
import moment from "moment";
import { toast } from "react-hot-toast";
import NavBar from "../../navigation/nav_bar";
import SideNavigation from "../../navigation/side_navigation";
import {useNavigate} from "react-router";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import icons from '../../../assets/image/icons';
import {
    faCloudArrowDown,
    faPlusCircle,
    faNetworkWired,
    faUserEdit,
    faTrash,
    faUserCheck, faUserXmark
} from "@fortawesome/free-solid-svg-icons";
import {CustomDataTable} from "../../../assets/dataTable";

function users(props) {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${encryptStorage.getItem("token")}`,
    };

    async function getUserAssignedCategories(company_id) {
        let url = makeUrl('users', `getUserAssignedCategories/${company_id}`);

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

    const getUsers = async (company_id) => {
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${encryptStorage.getItem("token")}`,
        };
        let url = makeUrl('users', `getUsers/${company_id}`);
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

    //run when render
    useEffect(() => {
        encryptStorage.setItem("current-page","users");
        getUserAssignedCategories(encryptStorage.getItem("company-id")).then((response) => {
            if (response !== null) {
                console.log("getCategoriesForUserCreation response", response);
                setCategories(response);
                console.log("categoriesArray",response)
            }
            else {
                toast.error("Something went wrong.");
            }
        });
        getUsers(encryptStorage.getItem("company-id")).then((response) => {
            if (response !== null) {
                console.log("Users response", response);
                setData(response);
            }
            else {
                toast.error("Something went wrong.");
            }


            setTimeout(() => {
                props.setLoading(false);
                },1500)

        });
        // toast.success('Successfully toasted!')
    }, []);


    const columns = [
        {
            name: 'First Name',
            selector: 'first_name',
            sortable: true,
            cell: row => row.first_name!==null?row.first_name:"-"
        },
        {
            name: 'Last Name',
            selector: 'last_name',
            sortable: true,
            width:"200px",
            cell: row => row.last_name!==null?row.last_name:"-"
        },
        {
            name: 'Email Address',
            selector: 'email',
            sortable: true,
            cell: row => row.email!==null?row.email:"-"
        },
        {
            name: 'Assigned Categories',
            selector: 'id',
            style: {
                display: "flex",
                flexWrap: "wrap",
                justifyContent:"center"
            },
            // sortable: true,
            cell: row => (
                categories.length > 0 ? (
                    categories.map((u, id) => (
                        row.id === u.user_id ? <span className={"badge badge-custom"} style={{textTransform:"uppercase"}}>{u.category_name}</span>: ""

                        ))
                    ) : (
                        "No Category"
                    )

            )
        },
        {
            name: 'Status',
            selector: 'status',
            sortable: true,
            cell: row => (row.status===1?<span className={"badge badge-success"}>ACTIVE</span>:<span className={"badge badge-danger"}>DEACTIVE</span>)
        },
        {
            name: 'Verified',
            selector: 'is_verified',
            sortable: true,
            cell: row => (row.is_verified===1?<span className={"badge badge-success"}>TRUE</span>:<span className={"badge badge-danger"}>FALSE</span>)
        },
        {
            name: 'Created At',
            selector: 'created_at',
            sortable: true,
            cell: row => (moment(row.created_at).format("DD-MMMM-YYYY"))
        },
        {
            name: 'Operations',
            selector: ['id','status'],
            cell: row => (
                <>
                    <img data-id={row.id} onClick={handleEditUser} className={"user-table-btn"} title={"Edit User"} src={icons.user_edit}/>
                    {row.status===1?<img data-type={"deactivate"} data-id={row.id} onClick={handleUserStatus} className={"user-table-btn"} title={"Deactivate User"} src={icons.user_deactivate}/>:<img data-type={"activate"} data-id={row.id} onClick={handleUserStatus} className={"user-table-btn"} title={"Activate User"} src={icons.user_activate}/>}
                    <img data-id={row.id} onClick={handleHardDeleteUser} className={"user-table-btn"} title={"Delete User"}src={icons.user_delete}/>
                </>
            )
        }
        ];

    const handleEditUser = async (e) => {
        const user_id = e.target.getAttribute("data-id");
        console.log("edit", user_id)
        navigate('/user/edit',{state:{id: user_id}});
    }


    const handleUserStatus = async (e) => {
        const user_id = e.target.getAttribute("data-id");
        const type = e.target.getAttribute("data-type");

        let url = makeUrl('users',`${type}/${user_id}`);
        const response = await axios.get(url, {headers}).then((res) => {
            if(res.data.status === 200) {
                toast.success(res.data.message);
                getUsers(encryptStorage.getItem("company-id")).then((response) => {
                    if (response !== null) {
                        console.log("Users response", response);
                        setData(response);
                    } else {
                        toast.error("Something went wrong.");
                    }
                });
            }
            else {
                toast.error(res.data.message);
            }
        });

        console.log(type, user_id)
    }

    const handleHardDeleteUser = async (e) => {
        const user_id = e.target.getAttribute("data-id");
        console.log("delete", user_id)
        let url = makeUrl('users',`hardDeleteUser/${user_id}`);
        const response = await axios.get(url, {headers}).then((res) => {
            if(res.data.status === 200) {
                toast.success(res.data.message);
                getUsers(encryptStorage.getItem("company-id")).then((response) => {
                    if (response !== null) {
                        console.log("Users response", response);
                        setData(response);
                    } else {
                        toast.error("Something went wrong.");
                    }
                });
            }
            else {
                toast.error(res.data.message);
            }
        });
    }


    const handleAddUser = () => {
        props.setLoading(true);
        navigate('/user/add');
    }

    return (<div className={"custom-padding"}>
        <div className={"col-md-12 bg-white rounded shadow-sm p-2"}>
            <h4 className={"app_text_color"} style={{width:"100%",paddingLeft:"10px",paddingRight:"10px"}}>
                Users
                <button className={"btn btn-sync-custom"} onClick={handleAddUser}>Add New User <FontAwesomeIcon icon={faPlusCircle}/></button>
            </h4>
            <hr width={"98%"}/>
            <p className={"db-label"} style={{marginLeft:"10px",marginBottom:"-10px",color:"#656565"}}>Company: {encryptStorage.getItem("company-name")}</p>
            {CustomDataTable("Users", data, columns)}
        </div>
    </div>)
}

export default users;