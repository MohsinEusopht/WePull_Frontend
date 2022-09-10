import moment from "moment";
import {encryptStorage} from "./encryptStorage";
import React from "react";

export const qb_columns = [
    {
        name: 'Expense Date',
        selector: 'expense_date',
        sortable: true,
        width:"130px",
        cell: row => (moment(row.expense_date).format("DD-MMMM-YYYY"))
    },
    {
        name: 'Description',
        selector: 'description',
        sortable: true,
        cell: row => row.description!==null?row.description:"-"
    },
    {
        name: 'Expense Type',
        selector: 'account_name',
        sortable: true,
        width:"auto",
        cell: row => row.account_name!==null?row.account_name:"-"
    },
    {
        name: 'Supplier Name',
        selector: 'supplier_name',
        sortable: true,
        width:"auto",
        cell: row => row.supplier_name!==null?row.supplier_name :"-"
    },
    {
        name: 'Category (1)',
        selector: 'category_1',
        sortable: true,
        cell: row => row.category_1?row.category_1:"-"
    },
    {
        name: 'Category (2)',
        selector: 'category_2',
        sortable: true,
        cell: row => row.category_2?row.category_2:"-"
    },
    {
        name: 'Amount',
        selector: ['total_amount','is_paid'],
        sortable: true,
        conditionalCellStyles: [
            {
                when: row => row.is_paid === "false",
                style: {
                    color: 'red',
                    fontWeight: '600'
                }
            }],
        cell: row =>  row.total_amount!==null?encryptStorage.getItem("currency-symbol") + parseFloat(row.total_amount).toFixed(2):"-"
    },
    // {
    //     name: 'Tax',
    //     selector: 'tax',
    //     sortable: true,
    //     conditionalCellStyles: [
    //         {
    //             when: row => row.is_paid === "false",
    //             style: {
    //                 color: 'red',
    //                 fontWeight: '600'
    //             }
    //         },
    //         {
    //             when: row => row.tax === null,
    //             style: {
    //                 color: 'black',
    //                 fontWeight: 'normal'
    //             }
    //         }],
    //     cell: row => row.tax!==null?encryptStorage.getItem("currency-symbol") + parseFloat(row.tax).toFixed(2):"-"
    // },
    // {
    //     name: 'Amount Paid',
    //     selector: 'paid_amount',
    //     sortable: true,
    //     cell: row => row.paid_amount!==null?encryptStorage.getItem("currency-symbol") + parseFloat(row.paid_amount).toFixed(2):"-"
    // },
    // {
    //     name: 'Payment Date',
    //     selector: 'payment_date',
    //     sortable: true,
    //     cell: row => row.payment_date!==null?moment(row.payment_date).format("DD-MMM-YYYY"):"-"
    // },
    {
        name: 'Attachments',
        selector: ['attachments','expense_id'],
        // sortable: true,
        width: "120px",
        style: {
            display:"block",
            height:"50px",
            overflowY:"auto",
            overflowX:"hidden",
            borderRadius:"0px",
        },
        cell: row => (
            row.attachments?
                JSON.parse(row.attachments).map((part, id) => (
                    <a href={`/#/view/attachment/${row.expense_id}/${part.attachable_id}`} target={"_blank"} className={"attachments cursor-pointer"} title={part.file_name} key={id}>
                        {part.file_name}
                    </a>
                )):"-"
        )
    },
    {
        name: '',
        width: "0px",
    }
];

export const xero_columns = [
    {
        name: 'Expense Date',
        selector: 'expense_date',
        sortable: true,
        width:"130px",
        cell: row => (moment(row.expense_date).format("DD-MMMM-YYYY"))
    },
    {
        name: 'Description',
        selector: 'description',
        sortable: true,
        cell: row => row.description!==null?row.description:"-"
    },
    {
        name: 'Expense Type',
        selector: 'account_name',
        sortable: true,
        width:"auto",
        cell: row => row.account_name!==null?row.account_name:"-"
    },
    {
        name: 'Supplier Name',
        selector: 'supplier_name',
        sortable: true,
        width:"auto",
        cell: row => row.supplier_name!==null?row.supplier_name :"-"
    },
    {
        name: 'Category (1)',
        selector: 'category_1',
        sortable: true,
        cell: row => row.category_1?row.category_1:"-"
    },
    {
        name: 'Category (2)',
        selector: 'category_2',
        sortable: true,
        cell: row => row.category_2?row.category_2:"-"
    },
    {
        name: 'Amount',
        selector: ['total_amount','is_paid'],
        sortable: true,
        conditionalCellStyles: [
            {
                when: row => row.is_paid === "false",
                style: {
                    color: 'red',
                    fontWeight: '600'
                }
            }],
        cell: row =>  row.total_amount!==null?encryptStorage.getItem("currency-symbol") + parseFloat(row.total_amount).toFixed(2):"-"
    },
    {
        name: 'Tax',
        selector: 'tax',
        sortable: true,
        conditionalCellStyles: [
            {
                when: row => row.is_paid === "false",
                style: {
                    color: 'red',
                    fontWeight: '600'
                }
            },
            {
                when: row => row.tax === null,
                style: {
                    color: 'black',
                    fontWeight: 'normal'
                }
            }],
        cell: row => row.tax!==null?encryptStorage.getItem("currency-symbol") + parseFloat(row.tax).toFixed(2):"-"
    },
    {
        name: 'Amount Paid',
        selector: 'paid_amount',
        sortable: true,
        cell: row => row.paid_amount!==null?encryptStorage.getItem("currency-symbol") + parseFloat(row.paid_amount).toFixed(2):"-"
    },
    {
        name: 'Payment Date',
        selector: 'payment_date',
        sortable: true,
        cell: row => row.payment_date!==null?moment(row.payment_date).format("DD-MMM-YYYY"):"-"
    },
    {
        name: 'Attachments',
        selector: ['attachments','expense_id'],
        // sortable: true,
        width: "120px",
        style: {
            display:"block",
            height:"50px",
            overflowY:"auto",
            overflowX:"hidden",
            borderRadius:"0px",
        },
        cell: row => ( row.attachments?JSON.parse(row.attachments).map((part, id) => (
            <a href={`/#/view/attachment/${row.expense_id}/${part.attachable_id}`} target={"_blank"} className={"attachments cursor-pointer"} title={part.file_name} key={id}>
                {part.file_name}
            </a>
        )):"-")
    },
    {
        name: '',
        width: "0px",
    }
];