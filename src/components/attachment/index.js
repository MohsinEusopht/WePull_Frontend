import React, {lazy, useEffect, useState} from "react";
import {useParams} from "react-router";
import InnerImageZoom from 'react-inner-image-zoom';
import 'react-inner-image-zoom/lib/InnerImageZoom/styles.min.css';
import logo from '../../assets/image/logo.png';
import {encryptStorage} from "../../assets/js/encryptStorage";
import {makeUrl} from "../../assets/js/makeUrl";
import axios from "axios";
import {headers} from "../../assets/js/request_header";
import {toast} from "react-hot-toast";
import {navigate} from "../../assets/js/helper";

function attachment(props) {
    const expense_id = useParams().expense_id;
    const attachment_id = useParams().attachment_id;
    const [image, setImage] = useState("");


    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${encryptStorage.getItem("token")}`,
    };


    const getXeroAttachment = async () => {
        const user_id = encryptStorage.getItem("user-type")==="admin"?encryptStorage.getItem("uid"):encryptStorage.getItem("user").created_by;
        const company_id = encryptStorage.getItem("company-id");

        let url = makeUrl('xero', `view/attachment/${user_id}/${expense_id}/${company_id}/${attachment_id}`);
        // console.log("url",url);
        let response = null;
        if(url) {
            lazy(
                await axios.get(url, {headers})
                    .then((res) => {
                        if(res.data.status === 200) {
                            response = res.data.data;
                        }
                        else{
                            toast.error(res.data.message);
                            navigate("/")
                        }
                    })
            );

        }

        return response;
    }

    const getQuickbooksAttachment = async () => {
        const user_id = encryptStorage.getItem("user-type")==="admin"?encryptStorage.getItem("uid"):encryptStorage.getItem("user").created_by;
        const company_id = encryptStorage.getItem("company-id");

        let url = makeUrl('quickbooks', `view/attachment/${user_id}/${company_id}/${attachment_id}`);
        // console.log("url",url);
        let response = null;
        if(url) {
            lazy(
                await axios.get(url, {headers})
                    .then((res) => {
                        if(res.data.status === 200) {
                            response = res.data.data;
                        }
                        else{
                            // console.log(res.data.message);
                            toast.error(res.data.message);
                            navigate("/")
                        }
                    })
            );
        }
        return response;
    }

    useEffect(() => {
        try {
            if(encryptStorage.getItem("company-type") === "xero") {
                getXeroAttachment().then((response) => {
                    console.log("response",response);

                    const base64String = btoa(String.fromCharCode(...new Uint8Array(response.data)));
                    console.log("base64",base64String);
                    setImage("data:image/jpg;base64," +base64String);
                    setTimeout(() => {
                        props.setLoading(false);
                        },2000)
                });
            }
            else if(encryptStorage.getItem("company-type") === "quickbooks") {
                getQuickbooksAttachment().then(async (response) => {
                    console.log("response",response)
                    if(response.toString().includes(".pdf")) {
                        window.location.href = response;
                    }
                    else {
                        setImage(response);
                    }

                    setTimeout(() => {
                        props.setLoading(false);
                    },2000)
                    // const base64String = btoa(String.fromCharCode(...new Uint8Array(response.data)));
                    // console.log("base64",base64String);
                    // setImage("data:image/jpg;base64," +base64String);
                });
            }
        }
        catch (e) {
            toast.error("Something went wrong")
            navigate("/")
        }
    },[]);

    return (
        <div className={"bg-light"} style={{height:"100vh",width:"100%"}}>
            <div className={"col-md-4 offset-md-4 bg-white rounded shadow-sm p-2 centerDiv"} style={{maxHeight:"99vh", overflow:"auto"}}>
                {image!==""?<InnerImageZoom src={image} zoomSrc={image} width={"100%"} className={"mx-auto d-block"} zoomType={"hover"} />:<h4 className={"text-center"}>Loading...</h4>}
            </div>
        </div>
    )
}

export default attachment;