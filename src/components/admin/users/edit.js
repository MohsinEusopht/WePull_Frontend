import React, {lazy, useEffect, useState, createRef} from "react";
import {encryptStorage} from "../../../assets/js/encryptStorage";
import {toast} from "react-hot-toast";
import {makeUrl} from "../../../assets/js/makeUrl";
import axios from "axios";
import {headers} from "../../../assets/js/request_header";
import MultiSelect from "multiselect-react-dropdown";
import {useLocation, useNavigate} from "react-router";
const multiSelectCategories = createRef();
function editUser(props) {
    const navigate = useNavigate();
    const location = useLocation();

    const [categories, setCategories] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [assignedCategories, setAssignedCategories] = useState([]);
    const [email, setEmail] = useState("");
    const [userId, setUserId] = useState(location.state.id);
    const [plan, setPlan] = useState("");

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${encryptStorage.getItem("token")}`,
    };



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

    const getUserCategories = async (id) => {
        let url = makeUrl('users',`getUserAssignedCategoriesByUserID/${encryptStorage.getItem("company-id")}/${id}`);
        console.log("url",url)
        console.log("headers",headers);
        await axios
            .get(url, {headers})
            .then((res) => {
                let categoriesArray = [];
                let selCat = [];
                for (let category of res.data.data) {
                    // console.log("depart.depart_name",depart.depart_name);
                    categoriesArray.push({name: category.category_name, id: category.id});
                    selCat.push(category.id);
                }
                setSelectedCategories(selCat);
                setAssignedCategories(categoriesArray);
            });
    }

    async function getUserData(user_id) {
        let url = makeUrl('users', `getUserByUserID/${user_id}`);

        let response = null;
        if(url) {
            lazy(
                await axios.get(url, {headers})
                    .then((res) => {
                        if(res.data.status === 200) {
                            response = res.data;
                            console.log("userrrrr",)
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

        getCategoriesForUserCreation(encryptStorage.getItem("company-id")).then(async (response) => {
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

            await getUserCategories(userId).then((response) => {

            })
        });

        getUserData(userId).then((res) => {
            console.log("getted user",res)
            setEmail(res.user);
            let plan = "";
            if(res.subscription === "monthly") {
                plan = "$9.99 USD / Month";
            }
            else {
                plan = "$95.88 USD / Year";
            }

            setPlan(plan);
        });

        // toast.success('Successfully toasted!')
    }, []);

    const handleUserUpdate = async () => {
        const body = {
            user_id: userId,
            company_id: encryptStorage.getItem("company-id"),
            category_ids: selectedCategories.toString(),
            role_id: 2,
            created_by: encryptStorage.getItem("uid")
        };

        let url = makeUrl('users', '/updateUser');
        await axios.post(url, body, {headers}).then((res) => {
            if(res.data.status === 200) {
                toast.success(res.data.message);
                navigate('/users');
            }
            else {
                toast.success(res.data.message);
            }
        })
    }

    return (
        <div>
            <div className={"col-md-12 row"} style={{height:"100vh",display:"flex",alignItems:"center"}}>
                <div className={"col-md-6 offset-md-3 col-lg-6 offset-lg-3 col-xl-4 offset-xl-4 mt-2"}>
                    <div className={"col-md-12 bg-white p-2 rounded shadow-sm p-3"}>
                        <h5 className={"app_text_color text-center"}>User Information</h5>
                        <hr width={"60%"}/>
                        <label className={"db-label"}>Active Plan</label>
                        <input type={"text"} className={"form-control mt-1"} value={plan} disabled={true} placeholder={"Enter user email address"}/>

                        <label className={"db-label mt-3"}>Email Address</label>
                        <input type={"email"} className={"form-control mt-1"} value={email} disabled={true} placeholder={"Enter user email address"}/>

                        <label className={"db-label mt-3"}>Categories</label>
                        <MultiSelect
                            options={categories} // Options to display in the dropdown
                            selectedValues={assignedCategories} // Preselected value to persist in dropdown
                            onSelect={onSelect} // Function will trigger on select event
                            onRemove={onRemove} // Function will trigger on remove event
                            displayValue="name" // Property name to display in the dropdown options
                            ref={multiSelectCategories}
                            avoidHighlightFirstOption={true}
                            closeOnSelect={true}
                        />
                        <br/>
                        <button className={"btn custom_btn"} onClick={handleUserUpdate} style={{width:"100%"}}>Update</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default editUser;