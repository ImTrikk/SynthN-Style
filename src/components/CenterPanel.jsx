import { GenerateArt } from "./GeneratedArt";

export const CenterPanel = ({ handleArtStyleChange, newArt }) => {
 const handleChange = (e) => {
  handleArtStyleChange(e);
 };
 return (
  <>
   <div>
    <h1 className="text-xs text-white">Output:</h1>
    <div className="bg-[#16161d] w-[500px] h-[500px] mt-4 rounded-lg flex items-center justify-center">
     {newArt && <GenerateArt newArt={newArt} />}
    </div>
    <div className="mt-5">
     <h1 className="text-xs text-white">
      Upload your own style to match with content
     </h1>
     <label
      htmlFor="styleInput"
      className="h-10 mt-2 w-full rounded-2xl bg-white flex items-center justify-center text-xs cursor-pointer"
     >
      Upload style
      <input
       type="file"
       id="styleInput"
       name="style"
       multiple
       onChange={handleChange}
       style={{
        display: "none",
       }}
      />
     </label>
    </div>
   </div>
  </>
 );
};
