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
import {faCloudArrowDown,faPlusCircle,faNetworkWired} from "@fortawesome/free-solid-svg-icons";
import {CustomDataTable} from "../../../assets/dataTable";
import { confirm } from "react-confirm-box";
import {logout} from "../../../assets/js/logout";
import icons from "../../../assets/image/icons";

function companies(props) {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [attachables, setAttachables] = useState([]);
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
                    console.log("now curr",encryptStorage.getItem("currency-code"));
                }
            })
    }

    //run when render
    useEffect(() => {
        encryptStorage.setItem("current-page","companies");
        getCompanies(encryptStorage.getItem("uid")).then((response) => {
            if (response !== null) {
                console.log("Expenses response", response);
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
            name: '',
            selector: 'active_status',
            sortable: true,
            width: "80px",
            cell: row => (row.active_status===1?<span className={"badge badge-success"}>ACTIVE</span>:"")
        },
        {
            name: 'Company Name',
            selector: 'company_name',
            sortable: true,
            width:"200px",
            cell: row => row.company_name!==null?row.company_name:"-"
        },
        {
            name: 'Company Type',
            selector: 'company_type',
            sortable: true,
            cell: row => row.company_type!==null?row.company_type:"-"
        },
        {
            name: 'Industry Type',
            selector: 'industry_type',
            sortable: true,
            cell: row => row.industry_type!==null?row.industry_type:"-"
        },
        {
            name: 'Currency',
            selector: 'currency',
            sortable: true,
            cell: row => row.currency!==null?row.currency :"-"
        },
        {
            name: 'Created At',
            selector: 'created_at',
            sortable: true,
            cell: row => (moment(row.created_at).format("DD-MMMM-YYYY"))
        },
        {
            name: 'Disconnect',
            selector: 'id',
            sortable: true,
            cell: row => (
                <>
                    <button className={"btn btn-danger text-uppercase"} data-id={row.id} onClick={handleDisconnect} style={{fontSize:"10px",letterSpacing:"1px",fontWeight:"600"}}>Disconnect</button>
                </>
            )
        }

    ];

    const handleAddCompany = () => {
        if(encryptStorage.getItem("company-type")==="xero") {
            let connectUrl = makeUrl('xero','auth/connect');
            window.location.href= connectUrl;
        }
        else if(encryptStorage.getItem("company-type")==="quickbooks") {
            let connectUrl = makeUrl('quickbooks','auth/connect');
            window.location.href= connectUrl
        }
    }

    const handleDisconnect = async (e) => {
        const company_id = e.target.getAttribute("data-id");

        if (data.length === 1) {
            const options = {
                labels: {
                    confirmable: "I Understand",
                    cancellable: "Cancel"
                }
            }
            const result = await confirm("If you disconnect this company from WePull, you will need to sign up for your account again.", options);
            if(result) {
                console.log("disconnect called", company_id);
                if (encryptStorage.getItem("company-type") === "quickbooks") {
                    axios.get(makeUrl('quickbooks',`disconnect/${encryptStorage.getItem("uid")}/${company_id}`), {headers})
                        .then(async (res) => {
                            console.log(res)
                            if(res.data.status === 200) {
                                toast.success(res.data.message);
                                const response = await logout();
                                // console.log(response);
                                const toastId = toast.loading('Logging out...');
                                setTimeout(async () => {
                                    toast.remove(toastId);
                                    if(response.status) {
                                        // toast.success(response.message);
                                        navigate("/login");
                                    }
                                },1500);
                                // toast.success(res.data.active_company + " activated.");
                            }
                            else {
                                toast.error(res.data.message);
                            }
                        })
                }
                else if (encryptStorage.getItem("company-type") === "xero") {
                    axios.get(makeUrl('xero',`disconnect/${encryptStorage.getItem("uid")}/${company_id}`), {headers})
                        .then(async (res) => {
                            console.log(res)
                            if(res.data.status === 200) {
                                toast.success(res.data.message);
                                const response = await logout();
                                // console.log(response);
                                const toastId = toast.loading('Logging out...');
                                setTimeout(async () => {
                                    toast.remove(toastId);
                                    if(response.status) {
                                        // toast.success(response.message);
                                        navigate("/login");
                                    }
                                },1500);
                                // toast.success(res.data.active_company + " activated.");
                            }
                            else {
                                toast.error(res.data.message);
                            }
                        })
                }
            }
        }
        else {
            const result = await confirm("Are you sure, you want to disconnect that company from WePull?");
            if (result) {
                console.log("disconnect called", company_id);
                if (encryptStorage.getItem("company-type") === "quickbooks") {
                    axios.get(makeUrl('quickbooks',`disconnect/${encryptStorage.getItem("uid")}/${company_id}`), {headers})
                        .then(async (res) => {
                            console.log(res)
                            if(res.data.status === 200) {
                                toast.success(res.data.message);
                                await activateCompany(res.data.active_company).then(async () => {
                                    await getCompanies(encryptStorage.getItem("uid")).then((response) => {
                                        if (response !== null) {
                                            console.log("Companies response", response);
                                            setData(response);
                                            window.location.reload();
                                        } else {
                                            toast.error("Something went wrong.");
                                        }
                                    });
                                });
                            }
                            else {
                                toast.error(res.data.message);
                            }
                        })
                }
                else if (encryptStorage.getItem("company-type") === "xero") {
                    axios.get(makeUrl('xero',`disconnect/${encryptStorage.getItem("uid")}/${company_id}`), {headers})
                        .then(async (res) => {
                            console.log(res)
                            if(res.data.status === 200) {
                                toast.success(res.data.message);
                                await activateCompany(res.data.active_company).then(async () => {
                                    await getCompanies(encryptStorage.getItem("uid")).then((response) => {
                                        if (response !== null) {
                                            console.log("Companies response", response);
                                            setData(response);
                                            window.location.reload();
                                        } else {
                                            toast.error("Something went wrong.");
                                        }
                                    });
                                });
                            }
                            else {
                                toast.error(res.data.message);
                            }
                        })
                }

            }
        }
    }

    return (<div className={"custom-padding"}>
        <div className={"col-md-12 bg-white rounded shadow-sm p-2"}>
            <h4 className={"app_text_color"} style={{width:"100%",paddingLeft:"10px",paddingRight:"10px"}}>
                Companies
                <button className={"btn btn-sync-custom"} onClick={handleAddCompany}>Connect New Company <FontAwesomeIcon icon={faPlusCircle}/></button>
            </h4>
            <hr width={"98%"}/>
            {CustomDataTable("Companies", data, columns)}
        </div>
    </div>)
}

export default companies;