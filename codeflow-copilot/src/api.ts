import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000"
});

export async function explainError(logText: string) {

    const response = await api.post(
        "/explain",
        {
            log_text: logText
        }
    );

    return response.data;
}