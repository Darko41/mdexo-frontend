import React from "react";

export default function ChooseComponent({
  image,
  title,
  description,
  textButton,
}) {
  return (
    <div className="flex w-full max-w-xs flex-col items-center rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg">
      {image && (
        <img 
          className="mb-4 h-16 w-16 object-contain" 
          src={image} 
          alt={title} 
        />
      )}
      <h2 className="mb-3 text-xl font-bold text-gray-800">{title}</h2>
      <p className="mb-6 text-center text-gray-600">{description}</p>
      <button className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        {textButton}
      </button>
    </div>
  );
}