export const LANGUAGES = Object.freeze({
  javascript: {
    label: "JavaScript",
    fileName: "main.js",
    starter: `function helloWorld() {
  console.log("Hello, World!");
}

helloWorld();`,
  },
  python: {
    label: "Python",
    fileName: "main.py",
    starter: `def hello_world():
    print("Hello, World!")

hello_world()`,
  },
  java: {
    label: "Java",
    fileName: "Main.java",
    starter: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello, World!");
  }
}`,
  },
  cpp: {
    label: "C++",
    fileName: "main.cpp",
    starter: `#include <iostream>

int main() {
  std::cout << "Hello, World!" << std::endl;
  return 0;
}`,
  },
});

export const LANGUAGE_IDS = Object.freeze(Object.keys(LANGUAGES));

export function isLanguage(value) {
  return Object.hasOwn(LANGUAGES, value);
}
