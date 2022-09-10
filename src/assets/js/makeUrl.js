import config from '../../configs/config';
//____Function to make url by combining base url from config file, api type (node) and endpoint (node)___//
export const makeUrl = (prefix, endPoint) => {
    let url = `${config.base_url}/${prefix}/${endPoint}`;
    return url;
}