import axios from "axios";

export const compileCode = async (code) => {
  console.log("compiling code");
  const res = await axios.post("https://onecompiler.com/api/code/exec", {
    _id: "3wnng9xz5",
    type: "code",
    created: "2021-02-12T17:35:24.180Z",
    updated: "2021-02-12T17:44:04.054Z",
    title: "JavaScript Compiler",
    description: null,
    tags: [],
    visibility: "public",
    properties: {
      language: "javascript",
      files: [
        {
          name: "HelloWorld.js",
          content:
            "function f1(list1)\n{\n  \n  for(var i = 0; i < list1.length; i++)\n  {\n    console.log(list1[i]);\n  }\n}\nlist1 = [1,2,3,'abcd','def'];\nf1(list1);",
        },
      ],
      stdin: null,
      hash: "7f175fbaae1c3b3d2e30d95e4121b8710e42bd56",
      result: {
        stdout: "1\n2\n3\nabcd\ndef\n",
        stderr: null,
        exception: null,
        executionTime: 55,
        success: true,
        output: "1\n2\n3\nabcd\ndef\n",
      },
    },
    user: {
      _id: "3wm3y7u5b",
      name: "Harsh Pandey",
      picture:
        "https://static.onecompiler.com/images/users/3wm3y7u5b/p2836072533.jpg",
      thumbnail:
        "https://static.onecompiler.com/images/users/3wm3y7u5b/t2836072533.jpg",
      userId: "harshpandey",
      hidePicture: false,
      lastSeen: "2024-04-08T12:03:31.591Z",
    },
    metrics: {
      views: 42805,
    },
  });

  console.log("res", res);
};
