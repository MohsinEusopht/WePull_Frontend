import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter} from "react-router-dom";
import {BrowserRouter as Router, HashRouter, useNavigate} from "react-router-dom";
import App from "./App";
import {Toaster} from "react-hot-toast";
if (typeof window !== 'undefined') {
    ReactDOM.render(
        <React.StrictMode>
            <HashRouter>
                <App/>
            </HashRouter>
        </React.StrictMode>,
        document.getElementById("root")
    );
}