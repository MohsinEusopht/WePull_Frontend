import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React, {useState, useEffect} from "react";
import {encryptStorage} from "./assets/js/encryptStorage";
import "./assets/css/app.css";
import "./assets/css/dashboard.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import loadingImg from './assets/image/loading2.gif';

import Login from './components/auth/login/index';
import SignUp from './components/auth/signup/index';
import ForgotPassword from './components/auth/forgot_password/index';
import ResetPassword from './components/auth/forgot_password/reset_password';

// Xero and QB Auth Imports
import AuthLogin from './components/auth/external_auth/index';

// User Components Imports
import UserDashboard from './components/users/dashboard/index';
import UserProfile from './components/users/profile/index';
import UserExpenses from './components/users/expenses/index'
import UserSuppliers from './components/users/suppliers/index';

// Admin Components Imports
import AdminDashboard from './components/admin/dashboard/index';
import AdminProfile from './components/admin/profile/index';
import AdminExpenses from './components/admin/expenses/index';
import Companies from './components/admin/companies/index';
import AdminCategories from './components/admin/categories/index';
import AdminSuppliers from './components/admin/suppliers/index';
//User view, add and edit
import Users from './components/admin/users/index';
import AddUser from './components/admin/users/create';
import EditUser from './components/admin/users/edit';
import ChangePassword from './components/users/profile/change_password';
import Payment from './components/admin/users/payment/index';
import SetupAccount from './components/users/setup_account/setup_account';

//Attachment view import
import Attachment from './components/attachment/index';

import Layout from './components/layout/index';
import {Toaster} from "react-hot-toast";

//Import error pages
import PageNotFound from './components/error_pages/404';

function App() {
    const [loading, setLoadingState] = useState(true);
    const [loadingImage, setLoadingImage] = useState(loadingImg);
    const handleLoading = async (data, loading_image = loadingImg) => {
        await setLoadingState(data);
        await setLoadingImage(loading_image);
    }

    return (
        <>
            <Toaster
                position="top-center"
                reverseOrder={false}
            />
            <div
                className={"loading"}
                title={"Please wait..."}
                style={{ display: loading ? "flex" : "none" }}
            >
                <img
                    className="loading-image"
                    src={loadingImage}
                    alt="Loading..."
                    height="200"
                    width="200"
                    unselectable="on"
                    style={{ borderRadius: "10px" }}
                />
            </div>
        <Routes>
            <Route exact path="/*" element={<PageNotFound />} />
            <Route exact path="/" element={<Login setLoading={handleLoading} />} />
            <Route exact path="/login" element={<Login setLoading={handleLoading} />} />
            <Route exact path="/login/error/:error_code" element={<Login setLoading={handleLoading} />} />
            <Route exact path="/auth/:type/:company_type/:email/:token" element={<AuthLogin setLoading={handleLoading} />} />
            <Route exact path="/sign-up" element={<SignUp setLoading={handleLoading} />} />
            <Route exact path="/forgot-password" element={<ForgotPassword setLoading={handleLoading} />} />
            <Route exact path="/reset-password/:email/:token" element={<ResetPassword setLoading={handleLoading} />} />
            <Route exact path="/dashboard" element={encryptStorage.getItem('user-type')==='admin'?<Layout setLoading={handleLoading} child={<AdminDashboard setLoading={handleLoading} />} />:<Layout setLoading={handleLoading} child={<UserDashboard setLoading={handleLoading} />} />} />
            <Route exact path="/profile" element={encryptStorage.getItem('user-type')==='admin'?<Layout setLoading={handleLoading} child={<AdminProfile setLoading={handleLoading} />} />:<Layout setLoading={handleLoading} child={<UserProfile setLoading={handleLoading} />} />} />
            <Route exact path="/profile/change-password" element={encryptStorage.getItem('user-type')==='admin'?"":<Layout setLoading={handleLoading} child={<ChangePassword setLoading={handleLoading} />} />} />
            <Route exact path="/companies" element={<Layout setLoading={handleLoading} child={<Companies setLoading={handleLoading} />} />} />
            <Route exact path="/categories" element={encryptStorage.getItem('user-type')==='admin'?<Layout setLoading={handleLoading} child={<AdminCategories setLoading={handleLoading} />} />:<Layout setLoading={handleLoading} child={<AdminCategories setLoading={handleLoading} />} />} />
            <Route exact path="/suppliers" element={encryptStorage.getItem('user-type')==='admin'?<Layout setLoading={handleLoading} child={<AdminSuppliers setLoading={handleLoading} />} />:<Layout setLoading={handleLoading} child={<UserSuppliers setLoading={handleLoading} />} />} />
            <Route exact path="/expenses" element={encryptStorage.getItem('user-type')==='admin'?<Layout setLoading={handleLoading} child={<AdminExpenses setLoading={handleLoading} />} />:<Layout setLoading={handleLoading} child={<UserExpenses setLoading={handleLoading} />} />} />
            <Route exact path="/view/attachment/:expense_id/:attachment_id" element={<Attachment setLoading={handleLoading} />} />
            {/*Users view, add and edit*/}
            <Route exact path="/users" element={<Layout setLoading={handleLoading} child={<Users setLoading={handleLoading} />} />} />
            <Route exact path="/user/add" element={<Layout setLoading={handleLoading} child={<AddUser setLoading={handleLoading} />} />} />
            <Route exact path="/user/edit" element={<Layout setLoading={handleLoading} child={<EditUser setLoading={handleLoading} />} />} />
            <Route exact path="/payment" element={<Layout setLoading={handleLoading} child={<Payment setLoading={handleLoading} />} /> } />
            <Route exact path="/setup/account/:email/:token" element={<SetupAccount setLoading={handleLoading} />} />
        </Routes>
        </>
    );
}

export default App;


