import {useState} from "react";
import moment from "moment";

export const createDataForExpensesChart = async (expenses, type) => {
    console.log("createDataForExpensesChart",expenses)
    console.log("createDataForExpensesChart type",type)
    let sumOfExpense = [];
    if(type === "month" || type === "week") {
        console.log("here")
        for (let i = 0; i < expenses.length; i++) {
            let date = moment(expenses[i].expense_date).format("DD-MMM-YYYY");
            let amount = +parseFloat(expenses[i].total_amount) + +parseFloat(expenses[i].tax?expenses[i].tax:0);
            const found = sumOfExpense.some(el => el.label === date);
            if (!found) {
                sumOfExpense.push({label: date, y: amount});
            }
            else {
                let objIndex = sumOfExpense.findIndex(el => el.label === date);
                sumOfExpense[objIndex].y = +parseFloat(sumOfExpense[objIndex].y).toFixed(2) + +parseFloat(amount).toFixed(2);
            }
        }
    }
    else {
        for (let i = 0; i < expenses.length; i++) {
            let date = moment(expenses[i].expense_date).format("MMM-YYYY");
            let amount = +parseFloat(expenses[i].total_amount) + +parseFloat(expenses[i].tax?expenses[i].tax:0);
            const found = sumOfExpense.some(el => el.label === date);
            if (!found) {
                sumOfExpense.push({label: date, y: amount});
            }
            else {
                let objIndex = sumOfExpense.findIndex(el => el.label === date);
                sumOfExpense[objIndex].y = +parseFloat(sumOfExpense[objIndex].y).toFixed(2) + +parseFloat(amount).toFixed(2);
            }
        }
    }

    return sumOfExpense;
}




export const createDataForSuppliersChart = async (expenses) => {
    //here we create chart data for u
    console.log("createDataForSuppliersChart",expenses)
    let sumOfExpense = [];
    for (let i = 0; i < expenses.length; i++) {
        let supplier_name = expenses[i].supplier_name!==null?expenses[i].supplier_name:"No Supplier";
        const found = sumOfExpense.some(el => el.label === supplier_name);
        let amount = +parseFloat(expenses[i].total_amount) + +parseFloat(expenses[i].tax?expenses[i].tax:0);
        if (!found) {
            sumOfExpense.push({y: amount, label: supplier_name});
        } else {
            let objIndex = sumOfExpense.findIndex(el => el.label === supplier_name);
            sumOfExpense[objIndex].y = +parseFloat(sumOfExpense[objIndex].y).toFixed(2) + +parseFloat(amount).toFixed(2);
        }
    }

    sumOfExpense.sort(function(a, b) {
        return parseFloat(a.y) - parseFloat(b.y);
    });

    return sumOfExpense;
}