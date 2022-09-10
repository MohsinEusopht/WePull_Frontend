import React from "react";
import DataTable from "react-data-table-component";
import DataTableExtensions from "react-data-table-component-extensions";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileExport} from "@fortawesome/free-solid-svg-icons";
import moment from "moment";
export const CustomDataTable = (type ,data, columns) => {
    const tableData = {columns, data};


    console.log("data table", tableData);
    function convertArrayOfObjectsToCSV(array) {
        let result;

        const columnDelimiter = ',';
        const lineDelimiter = '\n';
        const keys = Object.keys(data[0]);

        result = '';
        result += keys.join(columnDelimiter);
        result += lineDelimiter;

        array.forEach(item => {
            let ctr = 0;
            keys.forEach(key => {
                if (ctr > 0) result += columnDelimiter;
                result += item[key];
                ctr++;
            });
            result += lineDelimiter;
        });

        return result;
    }

    function downloadCSV(array) {
        console.log("array",array);

        const link = document.createElement('a');

        let csv = convertArrayOfObjectsToCSV(array);
        if (csv == null) return;

        const filename = type + moment(new Date()).format("DD-MM-YYYY") + '.csv';

        if (!csv.match(/^data:text\/csv/i)) {
            csv = `data:text/csv;charset=utf-8,${csv}`;
        }

        link.setAttribute('href', encodeURI(csv));
        link.setAttribute('download', filename);
        link.click();
    }

    const Export = ({ onExport }) => <button className={"export-csv-btn"} onClick={e => onExport(e.target.value)}>Export CSV <FontAwesomeIcon icon={faFileExport} /></button>;

    const actionsMemo = (array) => {
        console.log("data",array);
        return (<Export onExport={() => downloadCSV(array)} />);
    };

    return (<>
        <DataTableExtensions
            {...tableData}
            exportHeaders={true}
            filterPlaceholder={`Filter ${type.toString()}...`}
        >
            <DataTable columns={columns} data={data} actions={actionsMemo(data)} pagination={10} />
        </DataTableExtensions>
        </>);
};