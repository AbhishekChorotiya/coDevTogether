import React from "react";

const Wrapper = ({ children }) => {
  if (window.innerWidth < 500)
    return (
      <div className="p-8 w-sceen h-dvh bg-red-50 gap-10 flex-col flex items-center justify-around">
        <div className="text-3xl text-center text-balance text-red-500 font-bold">
          {"<CoDevTogether/>"}
        </div>
        <div className="text-3xl text-center text-balance text-red-500 font-bold">
          Please use a larger screen to use this app
        </div>
        <div className="text-xl text-center gap-2 flex flex-col text-balance text-red-500 font-bold">
          Check my portfolio website
          <a
            className="text-red-500 font-bold underline"
            href="https://abhishek.chorotiya.com/"
          >
            {"https://abhishek.chorotiya.com/"}
          </a>
        </div>
      </div>
    );
  return <>{children}</>;
};

export default Wrapper;
