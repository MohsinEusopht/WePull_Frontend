import React, {lazy, useEffect, useState, createRef} from "react";
import {encryptStorage} from "../../../assets/js/encryptStorage";
import {toast} from "react-hot-toast";
import {makeUrl} from "../../../assets/js/makeUrl";
import axios from "axios";
import {headers} from "../../../assets/js/request_header";
import MultiSelect from "multiselect-react-dropdown";
import {useNavigate} from "react-router";
const multiSelectCategories = createRef();
function createUser(props) {
    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [email, setEmail] = useState("");

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${encryptStorage.getItem("token")}`,
    };

    const navigate = useNavigate();

    function resetCategoriesValues() {
        // By calling the below method will reset the selected values programatically
        multiSelectCategories.current.resetSelectedValues();
    }

    async function getCategoriesForUserCreation(company_id) {
        let url = makeUrl('users', `getCategoriesForUserCreation/${company_id}`);

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

    const onSelect = async (selectedList, selectedItem) => {
        // console.log("selectedItem", selectedList);
        const selectedCategoriesArray = [];
        for (let i = 0; i < selectedList.length; i++) {
            selectedCategoriesArray.push(selectedList[i].id);
        }

        console.log("selectedCategoriesArray",selectedCategoriesArray);
        setSelectedCategories(selectedCategoriesArray);
    }

    const onRemove = async (selectedList, removedItem) => {
        console.log("removedItem", selectedList);
    }

    useEffect(() => {
        encryptStorage.setItem("current-page","users");
        setTimeout(() => {
            props.setLoading(false);
        },1500)

        getCategoriesForUserCreation(encryptStorage.getItem("company-id")).then((response) => {
            if (response !== null) {
                console.log("getCategoriesForUserCreation response", response);
                let categoriesArray = [];
                for (let category of response) {
                    categoriesArray.push({name: category.category_name, id: category.id});
                }
                setCategories(categoriesArray);
            }
            else {
                toast.error("Something went wrong.");
            }
        });
        // toast.success('Successfully toasted!')
    }, []);

    const handleContinueToPay = () => {
        navigate('/payment',{state:{email:email, categories:selectedCategories.toString(),subscription_type: selectedPlan}})
    }

    return (
        <div>
            <div className={"col-md-12 row"} style={{height:"100vh",display:"flex",alignItems:"center"}}>
                <div className={"col-md-6 offset-md-3 col-lg-6 offset-lg-3 col-xl-4 offset-xl-4 mt-2"}>
                    <div className={"col-md-12 bg-white p-2 rounded shadow-sm p-3"}>
                        <h5 className={"app_text_color text-center"}>User Information</h5>
                        <hr width={"60%"}/>
                        <label className={"db-label"}>Choose Plan</label>
                        <div className={"plans"}>
                            <div className={"plan-box"} style={{borderColor:selectedPlan==="monthly"?"#1a2956":"#eaeaea",boxShadow:selectedPlan==="monthly"?"0px 0px 10px 2px rgba(0,0,0,0.1) inset":"none"}} onClick={() => {setSelectedPlan("monthly")}}>
                                <h6 className={"mt-2"}>Monthly Plan</h6>
                                <span className={"active-price"}>$9.99 USD / Month</span>
                            </div>
                            <div className={"plan-box"} style={{borderColor:selectedPlan==="yearly"?"#1a2956":"#eaeaea",boxShadow:selectedPlan==="yearly"?"0px 0px 10px 2px rgba(0,0,0,0.1) inset":"none"}} onClick={() => {setSelectedPlan("yearly")}}>
                                <h6 className={""}>Yearly Plan</h6>
                                <span className={"active-price"}>$7.99 USD / Month</span><br/>
                                <span className={"inactive-price"}>$95.88 USD / Year</span>
                            </div>
                        </div>

                        <label className={"db-label mt-3"}>Email Address</label>
                        <input type={"email"} className={"form-control mt-1"} onInput={(e) => {setEmail(e.target.value)}} placeholder={"Enter user email address"}/>

                        <label className={"db-label mt-3"}>Categories</label>
                        <MultiSelect
                            options={categories} // Options to display in the dropdown
                            // selectedValues={} // Preselected value to persist in dropdown
                            onSelect={onSelect} // Function will trigger on select event
                            onRemove={onRemove} // Function will trigger on remove event
                            displayValue="name" // Property name to display in the dropdown options
                            ref={multiSelectCategories}
                            avoidHighlightFirstOption={true}
                            closeOnSelect={true}
                        />
                        <br/>
                        <button className={"btn custom_btn"} onClick={handleContinueToPay} style={{width:"100%"}}>Continue To Payment</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default createUser;