import { useState, useEffect, useCallback } from "react";
import { FaImage } from "react-icons/fa6";
import { Slider } from "@mui/material";
import { resizeImage } from "../../utils/resize";

export const LeftComponent = ({
 contentChange,
 stepsChange,
 styleWeightChange,
}) => {
 const [content, setContent] = useState(null);
 const [steps, setSteps] = useState(50);
 const [styleWeight, setStyleWeight] = useState(50);

 const handleContentChange = useCallback(
  (e) => {
   const file = e.target.files[0];
   resizeImage(file, 500, 500, function (resized) {
    const resizedContent = new File([resized], file.name, {
     type: file.type,
    });
    const contentURL = URL.createObjectURL(resizedContent);
    setContent(contentURL);
    contentChange(resizedContent);
   });
  },
  [contentChange]
 );

 useEffect(() => {
  stepsChange(steps);
  styleWeightChange(styleWeight);
 }, [steps, styleWeight, stepsChange, styleWeightChange]);

 return (
  <div>
   <h1 className="text-xs text-white">Upload Photo</h1>
   <div className="flex flex-col">
    <label
     htmlFor="contentInput"
     className="w-[170px] h-[170px] mt-4 outline-dashed outline-white rounded-lg flex items-center justify-center cursor-pointer"
    >
     <div className="flex flex-col items-center text-center">
      <FaImage size={50} className="text-white" />
      <h1 className="text-xs text-white">Click here to select upload photo</h1>
     </div>
     <input
      type="file"
      id="contentInput"
      name="content"
      onChange={handleContentChange}
      style={{ display: "none" }}
     />
    </label>
    {content && (
     <div className="mt-5">
      <h1 className="text-xs text-white">Selected photo: </h1>
      <img
       src={content}
       alt="Selected content"
       className="w-[170px] mt-2 rounded "
      />
     </div>
    )}
   </div>
   <div className="w-[170px] mt-5">
    <h1 className="text-xs text-white">Number of steps: </h1>
    <Slider
     defaultValue={50}
     max={500}
     aria-label="Number of steps"
     valueLabelDisplay="auto"
     value={steps}
     onChange={(e, value) => setSteps(value)}
    />
    <h1 className="text-white text-xs">Style Weight</h1>
    <Slider
     defaultValue={1000}
     max={100000}
     aria-label="Style Weight"
     valueLabelDisplay="auto"
     value={styleWeight}
     onChange={(e, value) => setStyleWeight(value)}
    />
   </div>
  </div>
 );
};
