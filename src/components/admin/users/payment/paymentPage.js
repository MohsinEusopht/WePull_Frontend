import React, {useEffect, useState} from 'react';
import axios from 'axios';
// MUI Components
// import Button from '@material-ui/core/Button';
// import Card from '@material-ui/core/Card';
// import CardContent from '@material-ui/core/CardContent';
// import TextField from '@material-ui/core/TextField';
// stripe
import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';
// Util imports
// import {makeStyles} from '@material-ui/core/styles';
// Custom Components
import CardInput from './CardInput';
import {makeUrl} from "../../../../assets/js/makeUrl";
import {toast} from "react-hot-toast";
import moment from "moment";
import {encryptStorage} from "../../../../assets/js/encryptStorage";
import {useNavigate} from "react-router";

function paymentPage(props) {
    // State
    const [email, setEmail] = useState(props.email);
    const [categories, setCategories] = useState(props.categories);
    const [plan, setPlan] = useState(props.selected_plan);

    const navigate = useNavigate();

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${encryptStorage.getItem("token")}`,
    };

    const stripe = useStripe();
    const elements = useElements();

    useEffect(() => {
        setTimeout(()=>{
            props.setLoading(false);
        },1200);
    },[]);


    const handleSubmitSub = async (event) => {
        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }

        const createUserResponse = await createUser(email, categories, plan);
        console.log("createUserResponse",createUserResponse);
        if(createUserResponse.status === 200) {
            let user_id = createUserResponse.user_id;
            let user_email = createUserResponse.email;
            const result = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement),
                billing_details: {
                    email: email,
                },
            }).then(async (result) => {
                console.log("createPaymentMethod",result);
                if (result.error) {
                    console.log(result.error.message);
                    toast.error(result.error.message);
                    const deleteCreatedUser = await axios.get(makeUrl('users',`/user/creation/failed/${user_id}`), {headers});
                    console.log("deleteCreatedUser",deleteCreatedUser);
                } else {
                    const res = await axios.post(makeUrl('users','/subscribe'), {'payment_method': result.paymentMethod.id, 'email': email,'plan':plan}, {headers});
                    // eslint-disable-next-line camelcase
                    const {client_secret, status} = res.data;

                    let PaymentStatus = false;

                    if (status === 'requires_action') {
                        stripe.confirmCardPayment(client_secret).then(async function(result) {
                            if (result.error) {
                                PaymentStatus = false
                                console.log('There was an issue!');
                                console.log(result.error);
                                toast.error(result.error.message);
                                console.log("redirected to user creation failed route");
                                const deleteCreatedUser = await axios.get(makeUrl('users',`/user/creation/failed/${user_id}`), {headers});
                                console.log("deleteCreatedUser",deleteCreatedUser);
                                // Display error message in your UI.
                                // The card was declined (i.e. insufficient funds, card has expired, etc)
                            }
                            else {
                                PaymentStatus = true;
                            }
                        });
                    } else {
                        PaymentStatus = true;
                        // Show a success message to your customer
                    }

                    console.log("PaymentStatus",PaymentStatus);
                    if (PaymentStatus === true) {
                        console.log('You got the money!');
                        console.log('User subscription activated successfully');
                        toast.success('User subscription activated successfully')
                        console.log("redirected to user creation success route");
                        const sendEmailOnUserCreate = await axios.get(makeUrl('users',`/user/creation/success/${encryptStorage.getItem("company-id")}/${user_id}/${user_email}/${plan}`), {headers});
                        console.log("sendEmailOnUserCreate",sendEmailOnUserCreate);

                        navigate('/users');
                    }
                    // else {
                    //     console.log('User subscription activated successfully');
                    //     toast.success('User subscription activated successfully')
                    //     // No additional information was needed
                    //     // Show a success message to your customer
                    // }
                }
            });
        }
    };

    const createUser = async (email, categories, selected_plan) => {
        const body = {
            email: email,
            company_id: encryptStorage.getItem("company-id"),
            category_ids: categories,
            role_id: 2,
            created_by: encryptStorage.getItem("uid"),
            user_type: encryptStorage.getItem("company-type"),
            selected_plan: selected_plan
        };

        let url = makeUrl('users','createUser');
        let response = await axios.post(url, body, {
            headers,
        });

        return response.data;
    }

    return (
        <div className={"col-md-12 custom-padding"}>
            <div className={"col-md-4 offset-md-4 centerDiv"}>
                <h5 className={"app_text_color text-center"}>Payment Information</h5>
                <hr width={"60%"}/>
                <label className={"db-label"}>Email</label>
                <input
                    className={"form-control mb-3"}
                    placeholder={`Email you'll receive updates and receipts on`}
                    type='email'
                    required
                    value={email}
                    disabled={true}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <label className={"db-label mb-2"}>Card details</label>
                <CardInput />
                <div className={"col-md-12 mt-4"}>
                    <button className={"btn custom_btn"} style={{float:"right"}} onClick={handleSubmitSub}>
                        Activate Subscription
                    </button>
                </div>
            </div>
        </div>
    );
}

export default paymentPage;
