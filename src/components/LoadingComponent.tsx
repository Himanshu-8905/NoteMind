"use client";
import Image from "next/image";
import React from "react";

const LoadingComponent = () => {
  return (
    <main className="bg-white dark:bg-[#020427] h-screen pt-10 error-pg-bg">
      <div className="w-fit h-fit p-5 flex flex-col justify-center items-center bg-[#31333C] centered-elem">
        <div className="screen mx-auto my-auto w-fit h-fit px-24 py-3 bg-blue-200">
          <Image
            width={300}
            height={300}
            src={
              "https://media3.giphy.com/media/lWY7KIoUckm8iCjY79/giphy.webp?cid=ecf05e47mqosv61anau5ccl3om5mik8vmbqmbx7158uhp1oe&ep=v1_gifs_search&rid=giphy.webp&ct=g"
            }
            alt={"404_error"}
          />
        </div>
      </div>
      <div className="under-tv centered-elem">
        <div className="left">
          <div className="connector"></div>
          <div className="legs-1">
            <div className="leg-1"></div>
            <div className="leg-2"></div>
          </div>
        </div>

        <div className="right">
          <div className="connector"></div>
          <div className="legs-2">
            <div className="leg-1"></div>
            <div className="leg-2"></div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoadingComponent;
