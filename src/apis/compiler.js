import axios from "axios";

export const compileCode = async (code) => {
  try {
    let bodyContent = {
      code: code,
      language: "javascript",
    };

    let reqOptions = {
      url: "http://localhost:4000/api/compile",
      method: "POST",
      data: bodyContent,
    };

    let response = await axios.request(reqOptions);
    console.log(response.data);
    return response.data;
  } catch {
    return {
      stderr: "Error",
    };
  }
};
