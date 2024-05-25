import { useState } from "react";

export const Styles = ({ selectedStyle }) => {
 // Predefined art styles
 const initialStyles = [
  "/images/popart 1.png",
  "/images/romanticism_paint 1.png",
  "/images/soft_ghilbi 1.png",
  "/images/Van_Gogh_-_Starry_Night_-_Google_Art_Project 1.png",
  "/images/0bf00683-4597-40c8-8f11-0282ccda186d_570.png",
  "/images/abrir-Mona-Lisa.png",
  "/images/Abstract-Art.png",
  "/images/Bedroom-oil-canvas-Vincent-van-Gogh-Art-1889.png",
  "/images/change-inspire-pass-it-on-jennifer-main.png",
 ];

 const [pressedIndex, setPressedIndex] = useState(null);

 // Handles function for clicking
 const handleImageClick = (index, img) => {
  if (pressedIndex === index) {
   setPressedIndex(null);
   selectedStyle(null); // Reset selected style
  } else {
   setPressedIndex(index);
   selectedStyle(img); // Pass the selected image URL directly
  }
 };

 return (
  <div className="flex flex-wrap gap-2">
   {initialStyles.map((img, index) => (
    <img
     key={index}
     src={img}
     alt={`Style Image ${index + 1}`}
     className={`w-[100px] ${
      pressedIndex === index ? "border-blue-500 border-2" : ""
     }`}
     onClick={() => handleImageClick(index, img)}
    />
   ))}
  </div>
 );
};
