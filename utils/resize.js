export function resizeImage(file, targetWidth, targetHeight, callback) {
 var reader = new FileReader();
 reader.onload = function (event) {
  var img = new Image();
  img.onload = function () {
   var canvas = document.createElement("canvas");
   var ctx = canvas.getContext("2d");

   // Set the canvas dimensions
   canvas.width = targetWidth;
   canvas.height = targetHeight;

   // Draw the image onto the canvas
   ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

   // Convert canvas content to a Blob
   canvas.toBlob(function (blob) {
    // Call the callback function with the resized image blob
    callback(blob);
   }, "image/png"); 
  };
  img.src = event.target.result;
 };
 reader.readAsDataURL(file); // Ensure file is read as data URL
}
