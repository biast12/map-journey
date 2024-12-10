// utils/deleteBucketIMGs.js

const supabase = require("../supabaseClient");

/**
 * @param {string[] | string} imageUrls
 * @returns {Promise<void>}
 */
const deleteImagesFromBucket = async (imageUrls) => {
  const imagesToDelete = [];
  
  function validateImageUrl(imageUrl) {
    if (imageUrl.startsWith("https://ezjagphpkkbghjkxczwk.supabase.co/storage/v1/object/public/user-images/")) {
      const imageName = imageUrl.split("/").pop().split("?")[0];
      imagesToDelete.push(imageName);
    }
  }
  
  if(typeof(imageUrls) === "string") {
    validateImageUrl(imageUrls)
  } else {
    for (let imageUrl of imageUrls) {
      validateImageUrl(imageUrl)
    }
  }

  if (imagesToDelete.length > 0) {
    try {
      const { error } = await supabase.storage.from("user-images").remove(imagesToDelete);
      
      if (error) {
        console.error("Error deleting images from user-images:", error);
        throw new Error("Error deleting images from user-images bucket");
      }
    } catch (err) {
      console.error("Error during image deletion:", err);
      throw err;
    }
  }
};

module.exports = deleteImagesFromBucket;
