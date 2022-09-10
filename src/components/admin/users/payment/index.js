import React from 'react';
// Components
import PaymentPage from './paymentPage';
// Stripe
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';
import config from '../../../../configs/config'
// Styles
// import '../index.scss';
import {useLocation} from "react-router";

const stripePromise = loadStripe(config.STRIPE_PUB_KEY);

function index(props) {
    const location = useLocation();
    return (
        <Elements stripe={stripePromise}>
            <PaymentPage setLoading={props.setLoading} email={location.state.email} categories={location.state.categories} selected_plan={location.state.subscription_type} />
        </Elements>
    );
}

export default index;
