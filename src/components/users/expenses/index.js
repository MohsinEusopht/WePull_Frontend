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
import {faCloudArrowDown} from "@fortawesome/free-solid-svg-icons";
import {CustomDataTable} from "../../../assets/dataTable";
import {qb_columns, xero_columns} from "../../../assets/js/expense_table_columns";

function expenses(props) {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [attachables, setAttachables] = useState([]);
    const [sumOfExpense, setSumOfExpenses] = useState(0);
    const [lastSyncDate, setLastSyncDate] = useState("");
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${encryptStorage.getItem("token")}`,
    };

    const getLastSyncDate = async () => {
        let company_id = encryptStorage.getItem("company-id");
        await axios
            .get(
                makeUrl('users',`/getLastSyncedActivity/${company_id}/Expense`),
                {headers}
            )
            .then((res) => {
                console.log("res.data.data[0].created_at",res.data.data);
                setLastSyncDate(res.data.data?res.data.data.created_at:null);
            });
    }

    const getExpenses = async (company_id) => {
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${encryptStorage.getItem("token")}`,
        };
        let url = makeUrl('users', `getUserExpenses/${company_id}`);
        // console.log("url", url);
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

    const getAssignedCategories = async (company_id) => {
        let url = makeUrl('users', `getCategoriesForUserDashboard/${company_id}/${encryptStorage.getItem("uid")}`);
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

    // const getAttachables = async (company_id) => {
    //     let url = makeUrl('users', `getAttachables/${company_id}`);
    //     let response = null;
    //     if(url) {
    //         lazy(
    //             await axios.get(url, {headers})
    //                 .then((res) => {
    //                     if(res.data.status === 200) {
    //                         response = res.data.data;
    //                     }
    //                     else{
    //                         console.log(res.data.message);
    //                     }
    //                 })
    //         );
    //     }
    //     return response;
    // }

    //run when render
    useEffect(() => {
        encryptStorage.setItem("current-page","expenses");
        getLastSyncDate();
        getAssignedCategories(encryptStorage.getItem("company-id")).then((res) => {
            console.log("user categories",res);
            const categoryIds = [];
            for (let i = 0;i<res.length;i++) {
                categoryIds.push(res[i].id);
            }
            console.log("categoryIds",categoryIds);
            getExpenses(encryptStorage.getItem("company-id")).then((response) => {
                if (response !== null) {
                    console.log("Expenses response", response);
                    let expenses = [];
                    let expense = 0;

                    for (let i=0;i<response.length;i++) {
                        console.log("if category ids",categoryIds.toString(),"includes",response[i].category1_id);
                        console.log("if category ids",categoryIds.toString(),"includes",response[i].category2_id);
                        if(categoryIds.includes(response[i].category1_id) || categoryIds.includes(response[i].category2_id)) {
                            expenses.push(response[i]);
                            if(encryptStorage.getItem("company-type") == "xero") {
                                if(response[i].is_paid.toString() === "false") {
                                    let tax = response[i].tax?response[i].tax:0;
                                    expense += +response[i].total_amount + +tax;
                                }
                            }
                            else {
                                if(response[i].is_paid.toString() === "true") {
                                    let tax = response[i].tax?response[i].tax:0;
                                    expense += +response[i].total_amount + +tax;
                                }
                            }
                        }
                    }

                    setSumOfExpenses(expense);
                    setData(expenses);
                }
                else {
                    toast.error("Something went wrong.");
                }


                // getAttachables(encryptStorage.getItem("company-id")).then((response_attachable) => {
                //     if (response !== null) {
                //         console.log("Attachable response", response_attachable);
                //         setAttachables(response_attachable);
                //     }

                setTimeout(() => {
                    props.setLoading(false);
                },1500)
                // });
            });
        });

        // toast.success('Successfully toasted!')
    }, []);

    const handleAttachment = (attachable_id) => {
        console.log("attachable)_id",attachable_id)
    }


    return (<div className={"custom-padding"}>
        <div className={"col-md-12 bg-white rounded shadow-sm p-2"}>
            <h4 className={"app_text_color"} style={{width:"100%",paddingLeft:"10px",paddingRight:"10px"}}>
                Expenses
                <span className={"db-label text-center"} style={{float:"right",fontSize:"13px"}}>Last synced at<br/><span style={{color:"#656565"}}>{(lastSyncDate?moment(lastSyncDate).format('DD-MMM-YYYY hh:mm A'):"-")}</span></span>
                {/*<button className={"btn btn-sync-custom"}>Sync Expenses <FontAwesomeIcon icon={faCloudArrowDown}/></button>*/}
            </h4>
            <hr width={"98%"}/>
            <p className={"db-label"} style={{marginLeft:"10px",marginBottom:"0px",color:"#656565"}}>Company: {encryptStorage.getItem("company-name")}</p>
            <p className={"db-label"} style={{marginLeft:"10px",marginBottom:"-10px",color:"#656565"}}>Unpaid Amount: {sumOfExpense!=0?encryptStorage.getItem("currency-symbol") + parseFloat(sumOfExpense).toFixed(2):"calculating..."}</p>
            {CustomDataTable("Expenses", data, (encryptStorage.getItem("company-type") == "xero" ? xero_columns: qb_columns))}
        </div>
    </div>)
}

export default expenses;