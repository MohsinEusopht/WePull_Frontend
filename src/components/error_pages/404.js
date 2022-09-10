import React, {useState, useEffect} from "react";
import logo from '../../assets/image/logo.png';
import axios from 'axios';
import moment from "moment";
import { toast } from "react-hot-toast";
import {useNavigate, useParams} from "react-router";

function login(props) {
    const navigate = useNavigate();
    return (<div style={{position:"relative",width:"100%",height:"100vh"}} className={"multiBackground"}>
        <div className={"col-md-4 offset-md-4 centerDiv"}>
            <img src={logo} width={"40%"} className={"mx-auto d-block"}/>
            <hr/>
            <h1 className={"text-center"} style={{fontSize:"20vh",color:"#1a2956"}}>4<span style={{fontSize:"28vh",color:"#41ccad"}}>0</span>4</h1>
            <h4 className={"text-center"} style={{textTransform:"uppercase"}}>Page Not Found</h4>
            <br/>
            <hr/>
            <h5 className={"text-center"}><button onClick={() => {navigate('/')}} className={"btn custom_btn"}>Go Back To Home Page</button></h5>
        </div>
    </div>)
}

export default login;