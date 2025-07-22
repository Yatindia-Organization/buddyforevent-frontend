// import { API_URL } from '../../../../config';

// export const API_ROUTE = (url) => `${API_URL}/${url}`;

// export const THUMBNAIL_ROUTE = (url, size = 500) =>
//     `${API_URL}/media/thumbnail/${url}/${size}`;


export const API_ROUTE = import.meta.env.VITE_DOMAIN_NAME;
export const API_FRONTEND = import.meta.env.VITE_FRONTEND_URL;


