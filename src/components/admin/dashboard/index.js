import React, {useState, useEffect, lazy, createRef} from "react";
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
import {qb_columns, xero_columns} from "../../../assets/js/expense_table_columns";
import {CustomDataTable} from "../../../assets/dataTable";

import MultiSelect from "multiselect-react-dropdown";
import {execute} from "bootstrap/js/src/util";
import {createDataForExpensesChart, createDataForSuppliersChart} from "./createData";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChartColumn, faLineChart, faPieChart, faTableList} from "@fortawesome/free-solid-svg-icons"
import spinner from '../../../assets/image/spinner.gif';
import chart_loading from '../../../assets/image/chart_loading.gif';
import no_record from '../../../assets/image/no_record.png'
const multiSelectAccounts = createRef();
const multiSelectSuppliers = createRef();

function dashboard(props) {
    const navigate = useNavigate();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${encryptStorage.getItem("token")}`,
    };

    function resetAccountsValues() {
        // By calling the below method will reset the selected values programatically
        multiSelectAccounts.current.resetSelectedValues();
    }

    function resetSuppliersValues() {
        // By calling the below method will reset the selected values programatically
        multiSelectSuppliers.current.resetSelectedValues();
    }

    //Expenses View
    //1 = line chart , 2 column chart , 3 table

    //Suppliers View
    //4 = horizontal column chart , 5 = pie chart 3 = table
    const [visualType, setVisualType] = useState(1);

    const [isChartDataAvailable, setIsChartDataAvailable] = useState(false);

    const [categories, setCategories] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [filteredExpenses, setFilteredExpenses] = useState([]);

    const [viewAs, setViewAs] = useState("expenses");

    const [isAccountChecked, setIsAccountChecked] = useState(true);
    const [accounts, setAccounts] = useState([]);
    const [selectedAccounts, setSelectedAccounts] = useState([]);

    const [isSupplierChecked, setIsSupplierChecked] = useState(true);
    const [suppliers, setSuppliers] = useState([]);
    const [filteredSuppliers, setFilteredSuppliers] = useState([]);
    const [selectedSuppliers, setSelectedSuppliers] = useState([]);

    const [paymentStatus, setPaymentStatus] = useState("all");

    const [filterAs, setFilterAs] = useState("ytd");

    const [from, setFrom] = useState("01-01-" + moment(new Date()).format("YYYY"));
    const [to, setTo] = useState(moment(new Date()).format("MM-DD-YYYY"));

    const [ytdFrom, setYtdFrom] = useState("01-01-" + moment(new Date()).format("YYYY"));
    const [ytdTo, setYtdTo] = useState(moment(new Date()).format("MM-DD-YYYY"));

    const [last12monthFrom, setLast12monthFrom] = useState(moment(new Date()).subtract(12, "months").format("MM/DD/YYYY"));
    const [last12monthTo, setLast12monthTo] = useState(moment(new Date()).format("MM/DD/YYYY"));

    const [monthFrom, setMonthFrom] = useState("");
    const [monthTo, setMonthTo] = useState("");

    const [weekFrom, setWeekFrom] = useState("");
    const [weekTo, setWeekTo] = useState("");

    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");


    const [expensesViewChartData, setExpensesViewChartData] = useState([]);
    const [chartOptions, setChartOptions] = useState({});
    const CanvasJSReact = require('canvasjs-react-charts');
    const CanvasJSChart = CanvasJSReact.CanvasJSChart;

    const setFilterDivsDisplayToNone = async () => {
        let month =  document.getElementById("month");
        let week =  document.getElementById("week");
        let custom =  document.getElementById("custom");

        month.style.display = "none";
        week.style.display = "none";
        custom.style.display = "none";
    }

    const getCategoriesForDashboard = async (company_id) => {
        let url = makeUrl('users', `getCategoriesForDashboard/${company_id}`);
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

    const getExpensesByCategoryID = async (category_id, company_id) => {
        let url = makeUrl('users', `getExpensesByCategoryID/${company_id}/${category_id}`);
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
        encryptStorage.setItem("current-page","dashboard");
        props.setLoading(true);
        console.log("encryptStorage.getItem(company-id)",encryptStorage.getItem("company-id"))
        getCategoriesForDashboard(encryptStorage.getItem("company-id")).then((response) => {
            console.log("getCategoriesForDashboard",response)
            setCategories(response);
             getExpensesByCategoryID(response[0].id, encryptStorage.getItem("company-id")).then(async (res) => {
                console.log("expenses by category ", response[0].category_name, " is ", res);
                //set category expenses in expenses state
                setExpenses(res);
                setFilteredExpenses(res);

                //reset all suppliers selected values
                resetAccountsValues()
                setIsAccountChecked(true)
                setSelectedAccounts([]);

                //reset all suppliers selected values
                resetSuppliersValues()
                setIsSupplierChecked(true)
                setSelectedSuppliers([]);

                //This function will filter all suppliers and account that exist in expenses array
                //response is expenses array return by db
                await filterAccountsAndSuppliersByExpenses(res);

                //filter expense on ytd
                const filterExpensesByDatesResponse = await filterExpensesByDates(res, [], []);
            });
        })

        setTimeout(() => {
            props.setLoading(false);
        }, 800)

    }, []);

    const filterAccountsAndSuppliersByExpenses = (expenses) => {

        let accountsArray = [];
        let accountIDs = [];
        //Filter expense accounts
        for (let i = 0; i < expenses.length; i++) {
            if(!accountIDs.includes(expenses[i].account_id)) {
                let accName = "";
                if(expenses[i].account_name.length > 16) {
                    accName = expenses[i].account_name.substring(0, 16) + "...";
                }
                else {
                    accName = expenses[i].account_name;
                }

                accountsArray.push({id: expenses[i].account_id, name: accName});
                accountIDs.push(expenses[i].account_id);
            }
        }

        setAccounts(accountsArray);


        let suppliersArray = [];
        let supplierIDs = [];
        //Filter expense supplier
        for (let i = 0; i < expenses.length; i++) {
            if(!supplierIDs.includes(expenses[i].supplier_id)) {
                let suppName = "";
                if(expenses[i].supplier_name.length > 16) {
                    suppName = expenses[i].supplier_name.substring(0, 16) + "...";
                }
                else {
                    suppName = expenses[i].supplier_name;
                }
                suppliersArray.push({id: expenses[i].supplier_id, name: suppName});
                supplierIDs.push(expenses[i].supplier_id);
            }
        }

        setSuppliers(suppliersArray);
        setFilteredSuppliers(suppliersArray);
    }

    //This function will take all expense , selected account and selected suppliers and check filter
    //as selected option and send from and to date to filterExpenseByAccountsAndSuppliersAndDate
    const filterExpensesByDates = async (expenses, selected_accounts, selected_suppliers, payment_status = paymentStatus, view_as = viewAs, visual_type = visualType) => {
        //Filter function to add in account supplier and view selection
        console.log("filterExpensesByDates filter as ",filterAs)
        console.log("filterExpensesByDates view as ",view_as)
        let accountAndSupplierFilteredExpenses;
        if(filterAs === "ytd") {
            accountAndSupplierFilteredExpenses = await filterExpenseByAccountsAndSuppliersAndDate(expenses, selected_accounts, selected_suppliers, payment_status, view_as, "ytd", from,to, visual_type);
        }
        else if(filterAs === "last12months") {
            accountAndSupplierFilteredExpenses = await filterExpenseByAccountsAndSuppliersAndDate(expenses, selected_accounts, selected_suppliers, payment_status, view_as, "last12month", from,to, visual_type);
        }
        else if(filterAs === "month") {
            accountAndSupplierFilteredExpenses = await filterExpenseByAccountsAndSuppliersAndDate(expenses, selected_accounts, selected_suppliers, payment_status, view_as, "month", from,to, visual_type);
        }
        else if(filterAs === "week") {
            accountAndSupplierFilteredExpenses = await filterExpenseByAccountsAndSuppliersAndDate(expenses, selected_accounts, selected_suppliers, payment_status, view_as, "week", from,to, visual_type);
        }
        else if(filterAs === "custom") {
            accountAndSupplierFilteredExpenses = await filterExpenseByAccountsAndSuppliersAndDate(expenses, selected_accounts, selected_suppliers, payment_status, view_as, "custom", from,to, visual_type);
        }

        return accountAndSupplierFilteredExpenses;
    }

    //This function will filter expenses by account ids and then filter suppliers by given supplier ids and then filter date by from and to date
    const filterExpenseByAccountsAndSuppliersAndDate = async (expenses, selected_accounts, selected_suppliers, payment_status = paymentStatus, view_as = viewAs, type, fromDate = from, toDate = to, visual_type = visualType) => {
        try {
            console.log("filterExpenseByAccountsAndSuppliers expenses", expenses)
            console.log("filterExpenseByAccountsAndSuppliers selected_accounts", selected_accounts)
            console.log("filterExpenseByAccountsAndSuppliers selected_suppliers", selected_suppliers)
            let filteredExpensesAfterAccountsFiltration = [];
            let filteredExpensesAfterSuppliersFiltration = [];
            let filteredExpensesAfterDateFiltration = [];

            let from = fromDate;
            let to = toDate;

            //Filter dates for expenses
            if (from !== null && to !== null) {
                let accountsArray = [];
                let accountIDs = [];

                let suppliersArray = [];
                let supplierIDs = [];
                for (let i = 0; i < expenses.length; i++) {
                    if (new Date(moment(expenses[i].expense_date).toDate()).getTime() >= new Date(from).getTime() && new Date(moment(expenses[i].expense_date).toDate()).getTime() <= new Date(moment(to).add(1, 'day').toDate()).getTime()) {
                        filteredExpensesAfterDateFiltration.push(expenses[i]);
                        //Filter expense accounts
                        if(!accountIDs.includes(expenses[i].account_id)) {
                            let accName = "";
                            if(expenses[i].account_name.length > 16) {
                                accName = expenses[i].account_name.substring(0, 16) + "...";
                            }
                            else {
                                accName = expenses[i].account_name;
                            }

                            accountsArray.push({
                                id: expenses[i].account_id,
                                name: accName
                            });
                            console.log("account ",expenses[i].account_name,"length",expenses[i].account_name.length)

                            accountIDs.push(expenses[i].account_id);
                        }


                        if (!supplierIDs.includes(expenses[i].supplier_id)) {
                            let suppName = "";
                            if(expenses[i].supplier_name.length > 16) {
                                suppName = expenses[i].supplier_name.substring(0, 16) + "...";
                            }
                            else {
                                suppName = expenses[i].supplier_name;
                            }
                            suppliersArray.push({
                                id: expenses[i].supplier_id,
                                name: suppName
                            });
                            supplierIDs.push(expenses[i].supplier_id);
                        }

                    }
                }

                setAccounts(accountsArray);
                setFilteredSuppliers(suppliersArray);
            } else {
                filteredExpensesAfterDateFiltration = expenses;
            }

            //Filter expenses by selected accounts array
            if (selected_accounts.length > 0) {
                let suppliersArray = [];
                let supplierIDs = [];
                for (let i = 0; i < filteredExpensesAfterDateFiltration.length; i++) {
                    if (selected_accounts.includes(filteredExpensesAfterDateFiltration[i].account_id)) {
                        filteredExpensesAfterAccountsFiltration.push(filteredExpensesAfterDateFiltration[i]);

                        //Filter suppliers by account selections
                        if (!supplierIDs.includes(filteredExpensesAfterDateFiltration[i].supplier_id)) {
                            let suppName = "";
                            if(filteredExpensesAfterDateFiltration[i].supplier_name.length > 16) {
                                suppName = filteredExpensesAfterDateFiltration[i].supplier_name.substring(0, 16) + "...";
                            }
                            else {
                                suppName = filteredExpensesAfterDateFiltration[i].supplier_name;
                            }
                            suppliersArray.push({
                                id: filteredExpensesAfterDateFiltration[i].supplier_id,
                                name: suppName
                            });
                            supplierIDs.push(filteredExpensesAfterDateFiltration[i].supplier_id);
                        }
                    }
                }
                setFilteredSuppliers(suppliersArray);
            } else {
                filteredExpensesAfterAccountsFiltration = filteredExpensesAfterDateFiltration;
            }

            //Filter expenses by selected suppliers array
            if (selected_suppliers.length > 0) {
                for (let i = 0; i < filteredExpensesAfterAccountsFiltration.length; i++) {
                    if (selected_suppliers.includes(filteredExpensesAfterAccountsFiltration[i].supplier_id)) {
                        filteredExpensesAfterSuppliersFiltration.push(filteredExpensesAfterAccountsFiltration[i]);
                    }
                }
            } else {
                filteredExpensesAfterSuppliersFiltration = filteredExpensesAfterAccountsFiltration;
            }


            console.log("from", from);
            console.log("to", to);
            console.log("filteredExpensesAfterAccountsFiltration", filteredExpensesAfterAccountsFiltration);
            console.log("filteredExpensesAfterSuppliersFiltration", filteredExpensesAfterSuppliersFiltration);
            console.log("filteredExpensesAfterDateFiltration", filteredExpensesAfterDateFiltration);

            const filterExpensePayStatusResponse = await filterExpensePayStatus(filteredExpensesAfterSuppliersFiltration, payment_status);

            setFilteredExpenses(filterExpensePayStatusResponse);


            console.log("view as view as ",view_as)
            if(view_as === "expenses") {
                const createDataForExpensesChartResponse = await createDataForExpensesChart(filterExpensePayStatusResponse, type)
                setExpensesViewChartData(createDataForExpensesChartResponse);
                console.log("setExpensesViewChartData is ",createDataForExpensesChartResponse);
                if (visual_type === 1) {
                    console.log("user want a line chart in expenses view");
                    setChartOptions({isLoading: true});
                    if(createDataForExpensesChartResponse.length > 0) {
                        setIsChartDataAvailable(true);
                        const createLineChartResponse = await createLineChart(createDataForExpensesChartResponse);
                        setTimeout(() => {
                            setChartOptions(createLineChartResponse);
                        }, 800)
                    }
                    else {
                        setTimeout(() => {
                            setChartOptions({isLoading: false});
                        }, 800);
                        setIsChartDataAvailable(false);
                    }
                    // console.log("line chart option set",createLineChartResponse)
                }
                else if(visual_type === 2) {
                    setChartOptions({isLoading: true});
                    if(createDataForExpensesChartResponse.length > 0) {
                        setIsChartDataAvailable(true);
                        const createColumnChartResponse = await createColumnChart(createDataForExpensesChartResponse);
                        setTimeout(() => {
                            setChartOptions(createColumnChartResponse);
                        }, 800)
                    }
                    else {
                        setTimeout(() => {
                            setChartOptions({isLoading: false});
                        }, 800);
                        setIsChartDataAvailable(false);
                    }
                    console.log("user want a column chart in expenses view");
                }
                else if(visual_type === 3) {
                    console.log("user want a table view in expenses view");
                }
            }
            else if(view_as === "suppliers") {
                const createDataForSuppliersChartResponse = await createDataForSuppliersChart(filterExpensePayStatusResponse);
                console.log("setSuppliersViewChartData is ",createDataForSuppliersChartResponse);
                if (visual_type === 4) {
                    setChartOptions({isLoading: true});
                    if(createDataForSuppliersChartResponse.length > 0) {
                        setIsChartDataAvailable(true);
                        const createHorizontalColumnChartResponse = await createHorizontalColumnChart(createDataForSuppliersChartResponse);
                        setTimeout(() => {
                            setChartOptions(createHorizontalColumnChartResponse);
                        }, 800);
                    }
                    else {
                        setTimeout(() => {
                            setChartOptions({isLoading: false});
                        }, 800);
                        setIsChartDataAvailable(false);
                    }
                    console.log("user want a horizontal column chart in suppliers view");
                }
                else if(visual_type === 5) {
                    console.log("user want a pie chart in suppliers view");
                    setChartOptions({isLoading: true});if(createDataForSuppliersChartResponse.length > 0) {
                        setIsChartDataAvailable(true);
                        const createHorizontalColumnChartResponse = await createPieChart(createDataForSuppliersChartResponse);
                        setTimeout(() => {
                            setChartOptions(createHorizontalColumnChartResponse);
                        }, 800);
                    }
                    else {
                        setTimeout(() => {
                            setChartOptions({isLoading: false});
                        }, 800);
                        setIsChartDataAvailable(false);
                    }

                }
                else if(visual_type === 3) {
                    console.log("user want a table view in suppliers view");
                }
            }

            return filterExpensePayStatusResponse;
        } catch (e) {
            console.log(e)
            console.log("error while filterExpenseByAccountsAndSuppliers")
        }
    }

    const createLineChart = async (data) => {
        console.log("here we create options and data for line chart");
        const options = {
            animationEnabled: true,
            // exportEnabled: true,
            backgroundColor: 'white',
            height:440,
            title:{
                // text: "Expense Report",
                fontFamily: "calibri",
                margin: 10,
                fontSize:20,
                display: false
            },
            axisX:{
                fontFamily: "calibri",
                margin: 10,
                labelFontFamily: "calibri",
                gridColor: "lightgray",
                gridDashType: "dot",
                gridThickness: 1,
                tickLength: 15,
            },
            axisY : {
                valueFormatString:  encryptStorage.getItem("currency-symbol") + " #,##0.##",
                labelFontSize: 11,
                labelFontFamily: "calibri",
                gridColor: "lightgray",
                crosshair: {
                    enabled: true,
                    labelFontColor: "white",
                    labelMaxWidth: 200,
                    valueFormatString:  encryptStorage.getItem("currency-symbol") + " #,##0"
                }
            },
            toolTip: {
                shared: true,
                fontFamily: "calibri",
                cornerRadius: 10,
                animationEnabled: true,
                borderColor: "black",
                contentFormatter: function (e) {
                    let content = " ";
                    return e.entries[0].dataPoint.label + ": " +  encryptStorage.getItem("currency-symbol") + e.entries[0].dataPoint.y.toFixed(2);
                }
            },
            data: [{
                type: "line",
                lineThickness: 2,
                dataPoints: data,
                color: '#41ccad',
                markerColor: '#41ccad',
                lineColor: '#41ccad',
                cursor: "pointer",
                yValueFormatString: encryptStorage.getItem("currency-symbol") + " #,##0.##",
            }]
        }

        console.log("line chart options", options);
        return options;
    }

    const createColumnChart = async (data) => {
        console.log("here we create options and data for column chart");
        const options = {
            animationEnabled: true,
            // exportEnabled: true,
            backgroundColor: 'white',
            height:440,
            title:{
                // text: "Expense Report",
                fontFamily: "calibri",
                margin: 10,
                fontSize:20,
                display: false
            },
            axisX:{
                fontFamily: "calibri",
                margin: 10,
                labelFontFamily: "calibri",
                gridColor: "lightgray",
                gridDashType: "dot",
                gridThickness: 1,
                tickLength: 15,
            },
            axisY : {
                valueFormatString:  encryptStorage.getItem("currency-symbol") + " #,##0.##",
                labelFontSize: 11,
                labelFontFamily: "calibri",
                gridColor: "lightgray",
                crosshair: {
                    enabled: true,
                    labelFontColor: "white",
                    labelMaxWidth: 200,
                    valueFormatString:  encryptStorage.getItem("currency-symbol") + " #,##0"
                }
            },
            toolTip: {
                shared: true,
                fontFamily: "calibri",
                cornerRadius: 10,
                animationEnabled: true,
                borderColor: "black",
                contentFormatter: function (e) {
                    let content = " ";
                    return e.entries[0].dataPoint.label + ": " +  encryptStorage.getItem("currency-symbol") + e.entries[0].dataPoint.y.toFixed(2);
                }
            },
            data: [{
                type: "column",
                lineThickness: 2,
                dataPoints: data,
                color: '#41ccad',
                markerColor: '#41ccad',
                lineColor: '#41ccad',
                cursor: "pointer",
                yValueFormatString: encryptStorage.getItem("currency-symbol") + " #,##0.##",
            }]
        }

        console.log("column chart options", options);
        return options;
    }

    const createHorizontalColumnChart = async (data) => {
        console.log("here we create options and data for horizontal column chart");
        const options = {
            animationEnabled: true,
            // exportEnabled: true,
            backgroundColor: 'white',
            height:440,
            title:{
                // text: "Expense Report",
                fontFamily: "calibri",
                margin: 10,
                fontSize:20,
                display: false
            },
            axisX:{
                fontFamily: "calibri",
                margin: 10,
                labelFontFamily: "calibri",
                gridColor: "lightgray",
                gridDashType: "dot",
                gridThickness: 1,
                tickLength: 15,
            },
            axisY : {
                valueFormatString:  encryptStorage.getItem("currency-symbol") + " #,##0.##",
                labelFontSize: 11,
                labelFontFamily: "calibri",
                gridColor: "lightgray",
                crosshair: {
                    enabled: true,
                    labelFontColor: "white",
                    labelMaxWidth: 200,
                    valueFormatString:  encryptStorage.getItem("currency-symbol") + " #,##0"
                }
            },
            toolTip: {
                shared: true,
                fontFamily: "calibri",
                cornerRadius: 10,
                animationEnabled: true,
                borderColor: "black",
                contentFormatter: function (e) {
                    let content = " ";
                    return e.entries[0].dataPoint.label + ": " +  encryptStorage.getItem("currency-symbol") + e.entries[0].dataPoint.y.toFixed(2);
                }
            },
            data: [{
                type: "bar",
                axisYType: "secondary",
                lineThickness: 2,
                dataPoints: data,
                color: '#41ccad',
                markerColor: '#41ccad',
                lineColor: '#41ccad',
                cursor: "pointer",
                yValueFormatString: encryptStorage.getItem("currency-symbol") + " #,##0.##",
            }]
        }

        console.log("column chart options", options);
        return options;
    }

    const createPieChart = async (data) => {
        console.log("here we create options and data for horizontal column chart");
        const options = {
            animationEnabled: true,
            // exportEnabled: true,
            backgroundColor: 'white',
            height:440,
            title:{
                // text: "Expense Report",
                fontFamily: "calibri",
                margin: 10,
                fontSize:20,
                display: false
            },
            axisX:{
                fontFamily: "calibri",
                margin: 10,
                labelFontFamily: "calibri",
                gridColor: "lightgray",
                gridDashType: "dot",
                gridThickness: 1,
                tickLength: 15,
            },
            axisY : {
                valueFormatString:  encryptStorage.getItem("currency-symbol") + " #,##0.##",
                labelFontSize: 11,
                labelFontFamily: "calibri",
                gridColor: "lightgray",
                crosshair: {
                    enabled: true,
                    labelFontColor: "white",
                    labelMaxWidth: 200,
                    valueFormatString:  encryptStorage.getItem("currency-symbol") + " #,##0"
                }
            },
            toolTip: {
                shared: true,
                fontFamily: "calibri",
                cornerRadius: 10,
                animationEnabled: true,
                borderColor: "black",
                contentFormatter: function (e) {
                    let content = " ";
                    return e.entries[0].dataPoint.label + ": " +  encryptStorage.getItem("currency-symbol") + e.entries[0].dataPoint.y.toFixed(2);
                }
            },
            data: [{
                type: "pie",
                lineThickness: 2,
                dataPoints: data,
                cursor: "pointer",
                yValueFormatString: encryptStorage.getItem("currency-symbol") + " #,##0.##",
            }]
        }

        console.log("column chart options", options);
        return options;
    }

    //Check filtered expenses if they are paid unpaid or all
    const filterExpensePayStatus = (expenses, payment_status) => {

        let filteredPayStatusExpenses = [];

        if(payment_status === "all") {
            filteredPayStatusExpenses = expenses;
        }
        else if(payment_status === "paid") {
            for (let i = 0; i < expenses.length; i++) {
                if (expenses[i].is_paid.toString() === "true") {
                    filteredPayStatusExpenses.push(expenses[i]);
                }
            }
        }
        else if(payment_status === "unpaid") {
            for (let i = 0; i < expenses.length; i++) {
                if (expenses[i].is_paid.toString() === "false") {
                    filteredPayStatusExpenses.push(expenses[i]);
                }
            }
        }

        return filteredPayStatusExpenses;
    }

    const handleCategories = async (e) => {
        console.log("category", e.target.value)
        const category_id = e.target.value;
        const company_id = encryptStorage.getItem("company-id");

        // if(viewAs === "expenses") {
        //     setVisualType(1);
        // }
        // else if(viewAs === "suppliers") {
        //     setVisualType(4);
        // }

        await getExpensesByCategoryID(category_id, company_id).then(async (response) => {
            console.log("expenses by category ", e.target.text, " is ", response);
            //set category expenses in expenses state
            setExpenses(response);
            setFilteredExpenses(response);

            //reset all suppliers selected values
            resetAccountsValues()
            setIsAccountChecked(true)
            setSelectedAccounts([]);

            //reset all suppliers selected values
            resetSuppliersValues()
            setIsSupplierChecked(true)
            setSelectedSuppliers([]);

            //This function will filter all suppliers and account that exist in expenses array
            //response is expenses array return by db
            await filterAccountsAndSuppliersByExpenses(response);

            //filter expense on ytd
            const filterExpensesByDatesResponse = await filterExpensesByDates(response, [], []);
        });
    }

    //Account Functions
    const handleAccountCheckbox = async (e) => {
        const checked = e.target.checked;

        await setSupplierToDefaultOnAccountSelection();

        const filterExpensesByDatesResponse = await filterExpensesByDates(expenses, [], []);
        if (checked) {
            setIsAccountChecked(true);
            resetAccountsValues();
            setFilteredSuppliers(suppliers);
            setSelectedAccounts([]);
        }
        else {
            setIsAccountChecked(false);
        }
    }

    const onAccountSelect = async (selectedList, selectedItem) => {
        if(!isAccountChecked) {

            await setSupplierToDefaultOnAccountSelection();

            let selectedAccountsArray = [];
            for(let i=0;i<selectedList.length;i++) {
                selectedAccountsArray.push(selectedList[i].id);
            }
            console.log("selectedAccountsArray",selectedAccountsArray);
            //Storing selected accounts array
            await setSelectedAccounts(selectedAccountsArray);
            const accountAndSupplierFilteredExpenses = await filterExpensesByDates(expenses, selectedAccountsArray, []);
        }
    }

    const onAccountRemove = async (selectedList, selectedItem) => {

        await setSupplierToDefaultOnAccountSelection();

        if(!isAccountChecked) {
            if(selectedList.length > 0) {
                let removedAccountsArray = [];
                for(let i=0;i<selectedList.length;i++) {
                    removedAccountsArray.push(selectedList[i].id);
                }
                console.log("removedAccountsArray",removedAccountsArray);
                //Storing selected accounts array
                await setSelectedAccounts(removedAccountsArray);
                const accountAndSupplierFilteredExpenses = await filterExpensesByDates(expenses, removedAccountsArray, []);
            }
            else {
                //There is no accounts left to remove
                setIsAccountChecked(true);
                console.log("All account removed");
                setFilteredSuppliers(suppliers);
                setSelectedAccounts([]);
                const accountAndSupplierFilteredExpenses = await filterExpensesByDates(expenses, [], []);
            }
        }
    }

    //Supplier Functions
    const handleSupplierCheckbox = async (e) => {
        const checked = e.target.checked;
        if (checked) {
            setIsSupplierChecked(true);
            resetSuppliersValues();
            const accountAndSupplierFilteredExpenses = await filterExpensesByDates(expenses, selectedAccounts, []);
        }
        else {
            setIsSupplierChecked(false);
            setSelectedSuppliers([]);
        }
    }

    const setSupplierToDefaultOnAccountSelection = async () => {
        await setSupplierCheckboxTrue();
        setSelectedSuppliers([]);
    }

    const setSupplierCheckboxTrue = async () => {
        setIsSupplierChecked(true);
        resetSuppliersValues();
        const accountAndSupplierFilteredExpenses = await filterExpenseByAccountsAndSuppliersAndDate(expenses, selectedAccounts, []);
    }

    const onSupplierSelect = async (selectedList, selectedItem) => {
        if(!isSupplierChecked) {
            let selectedSuppliersArray = [];
            for(let i=0;i<selectedList.length;i++) {
                selectedSuppliersArray.push(selectedList[i].id);
            }
            console.log("selectedSuppliersArray",selectedSuppliersArray);
            //Storing selected suppliers array
            await setSelectedSuppliers(selectedSuppliersArray);
            const accountAndSupplierFilteredExpenses = await filterExpensesByDates(expenses, selectedAccounts, selectedSuppliersArray);
        }
    }

    const onSupplierRemove = async (selectedList, selectedItem) => {
        if(!isSupplierChecked) {
            let removedSuppliersArray = [];
            if(selectedList.length > 0) {
                for(let i=0;i<selectedList.length;i++) {
                    removedSuppliersArray.push(selectedList[i].id);
                }
                console.log("removedSuppliersArray",removedSuppliersArray);
                //Storing selected suppliers array
                await setSelectedSuppliers(removedSuppliersArray);
                const accountAndSupplierFilteredExpenses = await filterExpensesByDates(expenses, selectedAccounts, removedSuppliersArray);
            }
            else {
                //There is no accounts left to remove
                setIsSupplierChecked(true);
                setSelectedSuppliers([]);
                const accountAndSupplierFilteredExpenses = await filterExpensesByDates(expenses, selectedAccounts, []);
            }
        }
    }

    const handleFilterAs = async (e) => {
        await setFilterAs(e.target.value);
        let accountAndSupplierFilteredExpenses;
        if(e.target.value === "ytd") {
            let from = "01-01-" + moment(new Date()).format("YYYY");
            let to = moment(new Date()).format("MM-DD-YYYY");
            setFrom(from);
            setTo(to);
            accountAndSupplierFilteredExpenses = await filterExpenseByAccountsAndSuppliersAndDate(expenses, selectedAccounts, selectedSuppliers, paymentStatus, viewAs, "ytd", from,to);
        }
        else if (e.target.value === "last12month") {
            let from = moment(new Date()).subtract(12, "months").format("MM/DD/YYYY");
            let to = moment(new Date()).format("MM-DD-YYYY");
            setFrom(from);
            setTo(to);
            accountAndSupplierFilteredExpenses = await filterExpenseByAccountsAndSuppliersAndDate(expenses, selectedAccounts, selectedSuppliers, paymentStatus, viewAs, "last12month", from,to);
        }

        //display none month week and custom
        await setFilterDivsDisplayToNone();
        console.log("filterAs",e.target.value);
        if(e.target.value !== "ytd" && e.target.value !== "last12months") {
            //display block selected filter
            let div =  document.getElementById(e.target.value);
            div.style.display = "block";
        }
    }

    const handleViewAs = async (e) => {
        await setViewAs(e.target.value)
        //set visual type to default on view change
        if(e.target.value === "expenses") {
            setVisualType(1);
            await filterExpensesByDates(expenses, selectedAccounts, selectedSuppliers, paymentStatus, e.target.value, 1);
        }
        else if(e.target.value === "suppliers") {
            setVisualType(4);
            await filterExpensesByDates(expenses, selectedAccounts, selectedSuppliers, paymentStatus, e.target.value, 4);
        }
    }

    const handlePaymentStatus = async (e) => {
        setPaymentStatus(e.target.value);
        await filterExpensesByDates(expenses, selectedAccounts, selectedSuppliers, e.target.value);
    }

    const handleMonth = async (e) => {
        setFilterAs("month");
        let d = e.target.value.split("-");
        let from = d[1] + "-01-" + d[0];
        let to = d[1] + "-31-" + d[0];
        console.log("From", from);
        console.log("To", to);
        // setMonthFrom(from);
        // setMonthTo(to);
        setFrom(from);
        setTo(to);

        const accountAndSupplierFilteredExpenses = await filterExpenseByAccountsAndSuppliersAndDate(expenses, selectedAccounts, selectedSuppliers, paymentStatus, viewAs,"month",from, to);
    }

    const handleFrom = async (e) => {
        setFilterAs("custom");
        setFrom(e.target.value);
        if(new Date(to) > new Date(e.target.value)) {
            const accountAndSupplierFilteredExpenses = await filterExpenseByAccountsAndSuppliersAndDate(expenses, selectedAccounts, selectedSuppliers, paymentStatus, viewAs,"custom",e.target.value, to);
        }
        else {
            toast.error("From date must be lesser than to date")
        }
    }

    const handleTo = async (e) => {
        setFilterAs("custom");
        if(new Date(e.target.value) > new Date(from)) {
            setTo(e.target.value);
            const accountAndSupplierFilteredExpenses = await filterExpenseByAccountsAndSuppliersAndDate(expenses, selectedAccounts, selectedSuppliers, paymentStatus, viewAs,"custom",from, e.target.value);
        }
        else {
            toast.error("From date must be lesser than to date")
        }
    }

    function getDateOfISOWeek(w, y) {
        let simple = new Date(y, 0, 1 + (w - 1) * 7);
        let dow = simple.getDay();
        let ISOweekStart = simple;
        if (dow <= 4)
            ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
        else
            ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
        return ISOweekStart;
    }

    const handleWeek = async (e) => {
        setFilterAs("week");
        let data = e.target.value.split("-");
        let year = data[0];
        let week_number = data[1].replace("W","");
        let weekStartDate = getDateOfISOWeek(week_number, year);
        let endDateOfWeek = moment(weekStartDate).add(6, "days").toDate();

        let from = moment(weekStartDate).format("YYYY-MM-DD");
        let to = moment(endDateOfWeek).format("YYYY-MM-DD")

        setFrom(from);
        setTo(to);

        const accountAndSupplierFilteredExpenses = await filterExpenseByAccountsAndSuppliersAndDate(expenses, selectedAccounts, selectedSuppliers, paymentStatus, viewAs,"week",from, to);

        // console.log("week", data);
        // console.log("year", year);
        // console.log("week_number", week_number);
        // console.log("weekStartDate", weekStartDate);
        // console.log("endDateOfWeek", endDateOfWeek);
        // console.log("from", from);
        // console.log("to", to);
    }

    const handleLineChart = async () => {
        setVisualType(1);
        const accountAndSupplierFilteredExpenses = await filterExpenseByAccountsAndSuppliersAndDate(expenses, selectedAccounts, selectedSuppliers, paymentStatus, viewAs, "ytd", from,to, 1);
    }

    const handleColumnChart = async () => {
        setVisualType(2);
        const accountAndSupplierFilteredExpenses = await filterExpenseByAccountsAndSuppliersAndDate(expenses, selectedAccounts, selectedSuppliers, paymentStatus, viewAs, "ytd", from,to, 2);
    }

    const handleTableView = async () => {
        setVisualType(3);
        const accountAndSupplierFilteredExpenses = await filterExpenseByAccountsAndSuppliersAndDate(expenses, selectedAccounts, selectedSuppliers, paymentStatus, viewAs, "ytd", from,to, 3);
    }

    const handleHorizontalColumnChart = async () => {
        setVisualType(4);
        const accountAndSupplierFilteredExpenses = await filterExpenseByAccountsAndSuppliersAndDate(expenses, selectedAccounts, selectedSuppliers, paymentStatus, viewAs, "ytd", from,to, 4);
    }

    const handlePieChart = async () => {
        setVisualType(5);
        const accountAndSupplierFilteredExpenses = await filterExpenseByAccountsAndSuppliersAndDate(expenses, selectedAccounts, selectedSuppliers, paymentStatus, viewAs, "ytd", from,to, 5);
    }

    return (<div className={"custom-padding"}>
        <div className={"col-md-12 bg-white rounded shadow-sm p-2 filtration-box"}>
            <div className={"db-categories"}>
                <div className={"col-lg-12 p-2"}>
                    <label className={"db-label"}>Categories</label>
                    <select className={"custom-input"} onChange={handleCategories}>
                        {categories?categories.map((part, id) => (
                            <option key={id} value={part.id}>{part.category_name}</option>
                        )):<option selected={true} disabled={true}>No Category Found</option>}
                    </select>
                </div>
            </div>
            <div className={"db-view-as"}>
                <div className={"col-lg-12 p-2"}>
                    <label className={"db-label"}>View As</label>
                    <select className={"custom-input"} onChange={handleViewAs}>
                        <option value={"expenses"}>Expenses</option>
                        <option value={"suppliers"}>Suppliers</option>
                    </select>
                </div>
            </div>
            <div className={"db-expense-type"}>
                <div className={"col-lg-12 p-2"}>
                    <label className={"db-label"} style={{width:"100%"}}>Expense Type
                        <span style={{float:"right",color:"gray"}}>ALL <input type={"checkbox"} className={"form-checkbox"} checked={isAccountChecked} onChange={handleAccountCheckbox} /></span>
                    </label>
                    <MultiSelect
                        disable={isAccountChecked}
                        options={accounts} // Options to display in the dropdown
                        // selectedValues={} // Preselected value to persist in dropdown
                        onSelect={onAccountSelect} // Function will trigger on select event
                        onRemove={onAccountRemove} // Function will trigger on remove event
                        displayValue="name" // Property name to display in the dropdown options
                        selectionLimit={5}
                        ref={multiSelectAccounts}
                        avoidHighlightFirstOption={true}
                        closeOnSelect={true}
                    />
                </div>
            </div>
            <div className={"db-suppliers"}>
                <div className={"col-lg-12 p-2"}>
                    <label className={"db-label"} style={{width:"100%"}}>Suppliers
                        <span style={{float:"right",color:"gray"}}>ALL <input type={"checkbox"} checked={isSupplierChecked} onChange={handleSupplierCheckbox} /></span>
                    </label>
                    <MultiSelect
                        disable={isSupplierChecked}
                        options={filteredSuppliers} // Options to display in the dropdown
                        // selectedValues={} // Preselected value to persist in dropdown
                        onSelect={onSupplierSelect} // Function will trigger on select event
                        onRemove={onSupplierRemove} // Function will trigger on remove event
                        displayValue="name" // Property name to display in the dropdown options
                        selectionLimit={5}
                        ref={multiSelectSuppliers}
                        avoidHighlightFirstOption={true}
                        closeOnSelect={true}
                    />
                </div>
            </div>
            <div className={"db-status"}>
                <div className={"col-lg-12 p-2"}>
                    <label className={"db-label"}>Status</label>
                    <select className={"custom-input"} defaultValue={paymentStatus} onChange={handlePaymentStatus}>
                        <option value={"all"}>All</option>
                        {encryptStorage.getItem("company-type")==="xero"?
                            <><option value={"paid"}>Paid</option>
                            <option value={"unpaid"}>Unpaid</option></>:""}
                    </select>
                </div>
            </div>
            <div className={"db-filter-as"}>
                <div className={"col-lg-12 p-2"}>
                    <label className={"db-label"}>Filter As</label>
                    <select className={"custom-input"}
                            onChange={handleFilterAs} defaultValue={filterAs}>
                        <option value={"ytd"}>YTD</option>
                        <option value={"last12months"}>Last 12 Months</option>
                        <option value={"month"}>Month</option>
                        <option value={"week"}>Week</option>
                        <option value={"custom"}>Custom</option>
                    </select>
                </div>
            </div>
            <div className={"db-month"} style={{display:'none'}} id={"month"}>
                <div className={"col-lg-12 p-2"}>
                    <div className={"col-lg-12 col-md-12 col-sm-12"}>
                        <label className={"db-label"}>Month</label>
                        <input className={"custom-input"} type={"month"} onChange={handleMonth} />
                    </div>
                </div>
            </div>
            <div className={"db-week"} style={{display:'none'}} id={"week"}>
                <div className={"col-lg-12 p-2"}>
                    <div className={"col-lg-12 col-md-12 col-sm-12"}>
                        <label className={"db-label"} style={{width:"100%"}}>Week
                        </label>
                        <input className={"custom-input"} type={"week"} onChange={handleWeek} />
                        <span style={{color:"#505050",fontSize:"11px",fontWeight:"600"}}>{filterAs === "week" ? moment(from).format("DD-MMM-YYYY") + " to " + moment(to).format("DD-MMM-YYYY"):""}</span>
                    </div>
                </div>
            </div>
            <div className={"db-custom"} style={{display:'none'}} id={"custom"}>
                <div className={"col-lg-12 p-2"}>
                    <div className={"row"}>
                        <div className={"col-lg-6 col-md-6 col-sm-6"}>
                            <label className={"db-label"}>From</label>
                            <input className={"custom-input"} type={"date"} onChange={handleFrom} />
                        </div>
                        <div className={"col-lg-6 col-md-6 col-sm-6"}>
                            <label className={"db-label"}>To</label>
                            <input className={"custom-input"} type={"date"} onChange={handleTo} />
                        </div>
                    </div>
                </div>
            </div>
            <div className={"db-btn"}>
                <div className={"col-lg-12 p-2"}>
                    <label className={"db-label"} style={{visibility:"hidden"}}>Filter {visualType}</label><br/>
                    <div style={{display:"flex",justifyContent:"center"}}>
                        <button onClick={handleLineChart} className={"mt-1 " + (visualType == 1?"filter-active-btn filter-left ":"filter-btn filter-left ") + (viewAs === "expenses"?"d-block":"d-none")}><FontAwesomeIcon icon={faLineChart}/></button>
                        <button onClick={handleColumnChart} className={"mt-1 " + (visualType == 2?"filter-active-btn filter-center ":"filter-btn filter-center ") + (viewAs === "expenses"?"d-block":"d-none")}><FontAwesomeIcon icon={faChartColumn}/></button>
                        <button onClick={handleHorizontalColumnChart} className={"mt-1 horizontal-column-chart " + (visualType == 4?"filter-active-btn filter-left ":"filter-btn filter-left ") + (viewAs === "suppliers"?"d-block":"d-none")}><FontAwesomeIcon icon={faChartColumn}/></button>
                        <button onClick={handlePieChart} className={"mt-1 " + (visualType == 5?"filter-active-btn filter-center ":"filter-btn filter-center ") + (viewAs === "suppliers"?"d-block":"d-none")}><FontAwesomeIcon icon={faPieChart}/></button>
                        <button onClick={handleTableView} className={"mt-1 " + (visualType == 3?"filter-active-btn filter-right ":"filter-btn filter-right ")}><FontAwesomeIcon icon={faTableList}/></button>
                    </div>
                </div>
            </div>
        </div>
        <div className={"col-md-12 bg-white p-4 rounded shadow-sm chart-box mt-3 mb-3"} style={{overflow: (visualType === 1 || visualType === 2 || visualType === 4 || visualType === 5 ? "hidden":"auto")}}>
            <div className={(visualType === 1 || visualType === 2 || visualType === 4 || visualType === 5 ? "d-block":"d-none")} style={{height:"100%",position:"relative"}}>
               {chartOptions.isLoading!==true?isChartDataAvailable?<CanvasJSChart options={chartOptions} />:<img className={"chart-loading"} width={"200px"} src={no_record}/>:<img className={"chart-loading"} width={"200px"} src={chart_loading}/>}
            </div>
            <div className={(visualType === 3 ? "d-block":"d-none")}>
                {CustomDataTable("Expenses", filteredExpenses, (encryptStorage.getItem("company-type") == "xero" ? xero_columns: qb_columns))}
            </div>
        </div>
    </div>)
}

export default dashboard;