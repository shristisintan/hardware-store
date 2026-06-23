import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
        username,
        password
    });

    return response.data.data;
};
