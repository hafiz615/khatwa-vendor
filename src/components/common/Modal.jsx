import React from "react";
import { X } from "lucide-react";
import Button from "./Button";

function Modal({ data }) {
  return (
    <div className="h-screen fixed left-0 top-0 z-50 w-full bg-black/20 backdrop-blur-sm flex justify-center items-center">
      <div className="relative flex flex-col px-12 py-8 gap-4 border border-gray-300 bg-white rounded-xl shadow-lg w-full max-w-md">
        {/* Close Icon */}
        <button
          onClick={() => data.btn2Handler()} // Close modal
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-2xl sm:text-3xl font-bold text-gray-900">
          {data.text1}
        </div>

        {/* Description */}
        <p className="text-gray-700 text-sm">{data.text2}</p>

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          <Button
            children={data.btn1Text}
            onClick={data.btn1Handler}
            className="text-sm rounded-lg text-white bg-blue-500 hover:bg-blue-600 px-4 py-2"
          />
          <Button
            children={data.btn2Text}
            onClick={data.btn2Handler}
            className="text-sm rounded-lg text-gray-800 bg-gray-500 hover:bg-gray-600 px-4 py-2"
          />
        </div>
      </div>
    </div>
  );
}

export default Modal;
