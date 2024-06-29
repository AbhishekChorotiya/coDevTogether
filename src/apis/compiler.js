import axios from "axios";

export const compileCode = async (code, language) => {
  const getFileName = () => {
    if (language === "java") {
      return "Main.java";
    } else if (language === "python") {
      return "Main.py";
    } else if (language === "cpp") {
      return "Main.cpp";
    } else {
      return "HelloWorld.js";
    }
  };
  try {
    let bodyContent = {
      code: code,
      language: language,
      fileName: getFileName(),
    };

    let reqOptions = {
      url: `http://${process.env.REACT_APP_BACKEND_COMPILER}/api/compile`,
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
