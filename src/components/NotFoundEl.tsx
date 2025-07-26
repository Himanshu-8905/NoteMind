"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const NotFoundEl = () => {
  return (
    <main className="bg-white dark:bg-[#020427] h-screen pt-10 error-pg-bg">
      <div className="w-fit h-fit p-5 flex flex-col justify-center items-center bg-[#31333C] centered-elem">
        <div className="screen mx-auto my-auto w-fit h-fit px-24 py-3 bg-white">
          <Image
            width={300}
            height={300}
            src={
              "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbWM4dm8zY3pkNXB0NDNyanc4dzl5M2xlY3YyeGJtbzYyMmpucDJvOCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/C21GGDOpKT6Z4VuXyn/giphy.gif"
            }
            alt={"404_error"}
          />
        </div>
        <div className="brand mt-1">
          <Link
            href={"/"}
            className="centered-text text-xl cursor-pointer hover:underline pt-2  brand-text flex justify-center items-center gap-2"
          >
            Go Home <ArrowRight suppressHydrationWarning />
          </Link>
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

export default NotFoundEl;
