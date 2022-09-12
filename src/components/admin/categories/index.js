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

function categories(props) {
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
                makeUrl('users',`/getLastSyncedActivity/${company_id}/Category`),
                {headers}
            )
            .then((res) => {
                console.log("Supplier last sync",res.data.data);
                setLastSyncDate(res.data.data?res.data.data.created_at:null);
            });
    }
    const getCategories = async (company_id) => {
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${encryptStorage.getItem("token")}`,
        };
        let url = makeUrl('users', `getCategories/${company_id}`);
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
        encryptStorage.setItem("current-page","categories");
        getLastSyncDate();
        getCategories(encryptStorage.getItem("company-id")).then((response) => {
            if (response !== null) {
                console.log("Category response", response);
                setData(response);
            }
            else {
                toast.error("Something went wrong.");
            }


            setTimeout(() => {
                props.setLoading(false);
                }, 800)

        });
        // toast.success('Successfully toasted!')
    }, []);


    const columns = [
        {
            name: 'Category Name',
            selector: ['category_name','category_type'],
            sortable: true,
            cell: row => (row.category_name?
                <span>
                    {row.category_name + " "}
                    <span style={{color:"lightgray",fontSize:"10px"}}>
                        {encryptStorage.getItem("quickbooks")?
                            (row.category_type==="Locations"?
                                "Class":
                                row.category_type)
                            :row.category_type}
                    </span>
                </span>:"-")
        },
        {
            name: 'Status',
            selector: 'category_status',
            sortable: true,
            width: "80px",
            cell: row => row.category_status===1?<span className={"badge badge-success"}>ACTIVE</span>:<span className={"badge badge-danger"}>INACTIVE</span>
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
                Categories
                <span className={"db-label text-center"} style={{float:"right",fontSize:"13px"}}>Last synced at<br/><span style={{color:"#656565"}}>{(lastSyncDate?moment(lastSyncDate).format('DD-MMM-YYYY hh:mm A'):"-")}</span></span>
                {/*<button className={"btn btn-sync-custom"}>Sync Categories <FontAwesomeIcon icon={faCloudArrowDown}/></button>*/}
            </h4>
            <hr width={"98%"}/>
            <p className={"db-label"} style={{marginLeft:"10px",marginBottom:"-10px",color:"#656565"}}>Company: {encryptStorage.getItem("company-name")}</p>
            {CustomDataTable("Categories", data, columns)}
        </div>
    </div>)
}

export default categories;