import {encryptStorage} from "./encryptStorage";
import {useState} from "react";
import config from '../../configs/config';

export const addHours = (hours, date = new Date()) => {
    let ms = hours * 60 * 60 * 1000;
    date.setTime(date.getTime() + ms);
    return date;
}

export const currency_list = [
    {'name': 'AED','code': 'د.إ'},
    {'name': 'AFN','code': 'Af'},
    {'name': 'ALL','code': 'Lek'},
    {'name': 'AMD','code': 'դ'},
    {'name': 'ANG','code': 'ƒ'},
    {'name': 'AOA','code': 'Kz'},
    {'name': 'ARS','code': '$'},
    {'name': 'AUD','code': '$'},
    {'name': 'AWG','code': 'ƒ'},
    {'name': 'AZN','code': '₼'},
    {'name': 'BAM','code': 'KM'},
    {'name': 'BBD','code': '$'},
    {'name': 'BDT','code': '৳'},
    {'name': 'BGN','code': 'лв'},
    {'name': 'BHD','code': '.د.ب'},
    {'name': 'BIF','code': 'FBu'},
    {'name': 'BMD','code': '$'},
    {'name': 'BND','code': '$'},
    {'name': 'BOB','code': '$b'},
    {'name': 'BRL','code': 'R$'},
    {'name': 'BSD','code': '$'},
    {'name': 'BTN','code': 'Nu.'},
    {'name': 'BWP','code': 'P'},
    {'name': 'BYR','code': 'p.'},
    {'name': 'BZD','code': 'BZ$'},
    {'name': 'CAD','code': '$'},
    {'name': 'CDF','code': 'FC'},
    {'name': 'CHF','code': 'CHF'},
    {'name': 'CLF','code': 'UF'},
    {'name': 'CLP','code': '$'},
    {'name': 'CNY','code': '¥'},
    {'name': 'COP','code': '$'},
    {'name': 'CRC','code': '₡'},
    {'name': 'CUP','code': '⃌'},
    {'name': 'CVE','code': '$'},
    {'name': 'CZK','code': 'Kč'},
    {'name': 'DJF','code': 'Fdj'},
    {'name': 'DKK','code': 'kr'},
    {'name': 'DOP','code': 'RD$'},
    {'name': 'DZD','code': 'دج'},
    {'name': 'EGP','code': 'E£'},
    {'name': 'ETB','code': 'Br'},
    {'name': 'EUR','code': '€'},
    {'name': 'FJD','code': '$'},
    {'name': 'FKP','code': '£'},
    {'name': 'GBP','code': '£'},
    {'name': 'GEL','code': 'ლ'},
    {'name': 'GHS','code': '¢'},
    {'name': 'GIP','code': '£'},
    {'name': 'GMD','code': 'D'},
    {'name': 'GNF','code': 'FG'},
    {'name': 'GTQ','code': 'Q'},
    {'name': 'GYD','code': '$'},
    {'name': 'HKD','code': '$'},
    {'name': 'HNL','code': 'L'},
    {'name': 'HRK','code': 'kn'},
    {'name': 'HTG','code': 'G'},
    {'name': 'HUF','code': 'Ft'},
    {'name': 'IDR','code': 'Rp'},
    {'name': 'ILS','code': '₪'},
    {'name': 'INR','code': '₹'},
    {'name': 'IQD','code': 'ع.د'},
    {'name': 'IRR','code': '﷼'},
    {'name': 'ISK','code': 'kr'},
    {'name': 'JEP','code': '£'},
    {'name': 'JMD','code': 'J$'},
    {'name': 'JOD','code': 'JD'},
    {'name': 'JPY','code': '¥'},
    {'name': 'KES','code': 'KSh'},
    {'name': 'KGS','code': 'лв'},
    {'name': 'KHR','code': '៛'},
    {'name': 'KMF','code': 'CF'},
    {'name': 'KPW','code': '₩'},
    {'name': 'KRW','code': '₩'},
    {'name': 'KWD','code': 'د.ك'},
    {'name': 'KYD','code': '$'},
    {'name': 'KZT','code': '₸'},
    {'name': 'LAK','code': '₭'},
    {'name': 'LBP','code': '£'},
    {'name': 'LKR','code': '₨'},
    {'name': 'LRD','code': '$'},
    {'name': 'LSL','code': 'L'},
    {'name': 'LTL','code': 'Lt'},
    {'name': 'LVL','code': 'Ls'},
    {'name': 'LYD','code': 'ل.د'},
    {'name': 'MAD','code': 'د.م.'},
    {'name': 'MDL','code': 'L'},
    {'name': 'MGA','code': 'Ar'},
    {'name': 'MKD','code': 'ден'},
    {'name': 'MMK','code': 'K'},
    {'name': 'MNT','code': '₮'},
    {'name': 'MOP','code': 'MOP$'},
    {'name': 'MRO','code': 'UM'},
    {'name': 'MUR','code': '₨'},
    {'name': 'MVR','code': '.ރ'},
    {'name': 'MWK','code': 'MK'},
    {'name': 'MXN','code': '$'},
    {'name': 'MYR','code': 'RM'},
    {'name': 'MZN','code': 'MT'},
    {'name': 'NAD','code': '$'},
    {'name': 'NGN','code': '₦'},
    {'name': 'NIO','code': 'C$'},
    {'name': 'NOK','code': 'kr'},
    {'name': 'NPR','code': '₨'},
    {'name': 'NZD','code': '$'},
    {'name': 'OMR','code': '﷼'},
    {'name': 'PAB','code': 'B/.'},
    {'name': 'PEN','code': 'S/.'},
    {'name': 'PGK','code': 'K'},
    {'name': 'PHP','code': '₱'},
    {'name': 'PKR','code': '₨'},
    {'name': 'PLN','code': 'zł'},
    {'name': 'PYG','code': 'Gs'},
    {'name': 'QAR','code': '﷼'},
    {'name': 'RON','code': 'lei'},
    {'name': 'RSD','code': 'Дин.'},
    {'name': 'RUB','code': '₽'},
    {'name': 'RWF','code': 'ر.س'},
    {'name': 'SAR','code': '﷼'},
    {'name': 'SBD','code': '$'},
    {'name': 'SCR','code': '₨'},
    {'name': 'SDG','code': '£'},
    {'name': 'SEK','code': 'kr'},
    {'name': 'SGD','code': '$'},
    {'name': 'SHP','code': '£'},
    {'name': 'SLL','code': 'Le'},
    {'name': 'SOS','code': 'S'},
    {'name': 'SRD','code': '$'},
    {'name': 'STD','code': 'Db'},
    {'name': 'SVC','code': '$'},
    {'name': 'SYP','code': '£'},
    {'name': 'SZL','code': 'L'},
    {'name': 'THB','code': '฿'},
    {'name': 'TJS','code': 'TJS'},
    {'name': 'TMT','code': 'm'},
    {'name': 'TND','code': 'د.ت'},
    {'name': 'TOP','code': 'T$'},
    {'name': 'TRY','code': '₤'},
    {'name': 'TTD','code': '$'},
    {'name': 'TWD','code': 'NT$'},
    {'name': 'TZS','code': 'TSh'},
    {'name': 'UAH','code': '₴'},
    {'name': 'UGX','code': 'USh'},
    {'name': 'USD','code': '$'},
    {'name': 'UYU','code': '$U'},
    {'name': 'UZS','code': 'лв'},
    {'name': 'VEF','code': 'Bs'},
    {'name': 'VND','code': '₫'},
    {'name': 'VUV','code': 'VT'},
    {'name': 'WST','code': 'WS$'},
    {'name': 'XAF','code': 'FCFA'},
    {'name': 'XCD','code': '$'},
    {'name': 'XDR','code': 'SDR'},
    {'name': 'XOF','code': 'FCFA'},
    {'name': 'XPF','code': 'F'},
    {'name': 'YER','code': '﷼'},
    {'name': 'ZAR','code': 'R'},
    {'name': 'ZMK','code': 'ZK'},
    {'name': 'ZWL','code': 'Z$'},
];

export const checkLoginStatus = (token) => {
    let data = false;
    if(token !== null) {
        console.log("token is not null");
        if(token === encryptStorage.getItem("token")) {
            data = true;
        }
    }
    else {
        console.log("token is null");
        data = false;
    }

    console.log("data", data.toString())

    return data;
}

export const checkLogin = async () => {
    const isLogin = await checkLoginStatus(encryptStorage.getItem('token')?encryptStorage.getItem('token'):null);
    return isLogin;
}

export const navigate = (endPoint) => {
    let end_point = endPoint[0]==="/"?endPoint:"/"+endPoint;
    let url = `${config.app_url}/#${end_point}`;
    // console.log("url",url);
    window.location.href = url;
}