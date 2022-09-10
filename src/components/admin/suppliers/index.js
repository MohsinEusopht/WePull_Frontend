import React, {useState, useEffect, lazy} from "react";
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
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCloudArrowDown,faPlusCircle} from "@fortawesome/free-solid-svg-icons";
import {CustomDataTable} from "../../../assets/dataTable";

function suppliers(props) {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [lastSyncDate, setLastSyncDate] = useState("");
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${encryptStorage.getItem("token")}`,
    };
    const getLastSyncDate = async () => {
        let company_id = encryptStorage.getItem("company-id");
        await axios
            .get(
                makeUrl('users',`/getLastSyncedActivity/${company_id}/Supplier`),
                {headers}
            )
            .then((res) => {
                console.log("Supplier last sync",res.data.data);
                setLastSyncDate(res.data.data?res.data.data.created_at:null);
            });
    }
    const getSuppliers = async (company_id) => {
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${encryptStorage.getItem("token")}`,
        };
        let url = makeUrl('users', `getSuppliers/${company_id}`);
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
        encryptStorage.setItem("current-page","suppliers");
        getLastSyncDate();
        getSuppliers(encryptStorage.getItem("company-id")).then((response) => {
            if (response !== null) {
                console.log("Suppliers response", response);
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
            name: 'Supplier Name',
            selector: 'name',
            sortable: true,
            cell: row => row.name?row.name:"-"
        },
        {
            name: 'Phone Number',
            selector: 'phone',
            sortable: true,
            cell: row => row.phone!==null?"+"+row.phone:"-"
        },
        {
            name: 'Mobile Number',
            selector: 'mobile',
            sortable: true,
            cell: row => row.mobile!==null?"+"+row.mobile:"-"
        },
        {
            name: 'Email Address',
            selector: 'email',
            sortable: true,
            cell: row => row.email!==null?row.email:"-"
        },
        {
            name: 'Website',
            selector: 'web',
            // sortable: true,
            cell: row => row.web!==null?<a style={{color:"#41ccad",fontWeight:"600"}} target={"_blank"} href={row.web}>{row.web}</a>:"-"
        },
        {
            name: 'Postal Code',
            selector: 'postal_code',
            sortable: true,
            width: "120px",
            cell: row => row.postal_code!==null?row.postal_code:"-"
        },
        {
            name: 'Address',
            selector: ['address', 'city', 'region'],
            // sortable: true,
            width: "200px",
            cell: row =>
                (
                    row.address && row.city && row.region?
                    <>
                        <span>{row.address?row.address+", ":""}
                        {row.city?row.city+", ":""}
                        {row.region?row.region:""}</span>
                    </>:"-"
                )
        },
        {
            name: 'Country',
            selector: 'country',
            // sortable: true,
            cell: row => row.country!==null?row.country:"-"
        },
        {
            name: 'Status',
            selector: 'status',
            // sortable: true,
            width: "80px",
            cell: row => row.status===1?<span className={"badge badge-success"}>ACTIVE</span>:<span className={"badge badge-danger"}>INACTIVE</span>
        },
        {
            name: 'Synced At',
            selector: 'created_at',
            sortable: true,
            width:"180px",
            cell: row => (moment(row.created_at).format("DD-MMMM-YYYY"))
        }
        ];


    return (<div className={"custom-padding"}>
        <div className={"col-md-12 bg-white rounded shadow-sm p-2"}>
            <h4 className={"app_text_color"} style={{width:"100%",paddingLeft:"10px",paddingRight:"10px"}}>
                Suppliers
                <span className={"db-label text-center"} style={{float:"right",fontSize:"13px"}}>Last synced at<br/><span style={{color:"#656565"}}>{(lastSyncDate?moment(lastSyncDate).format('DD-MMM-YYYY hh:mm A'):"-")}</span></span>
                {/*<button className={"btn btn-sync-custom"}>Sync Suppliers <FontAwesomeIcon icon={faCloudArrowDown}/></button>*/}
            </h4>
            <hr width={"98%"}/>
            <p className={"db-label"} style={{marginLeft:"10px",marginBottom:"-10px",color:"#656565"}}>Company: {encryptStorage.getItem("company-name")}</p>
            {CustomDataTable("Suppliers", data, columns)}
        </div>
    </div>)
}

export default suppliers;