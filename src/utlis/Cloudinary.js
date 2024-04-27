import {v2 as cloudinary} from 'cloudinary'
import {fs} from 'fs'
          
cloudinary.config({ 
  cloud_name: Process.env.CLOUD_NAME, 
  api_key: Process.env.API_KEY, 
  api_secret: Process.env.API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if(!localFilePath) return null
    const response = await cloudinary.uploader.upload(localFilePath,{resource_type: "auto"})
    console.log('File uploaded successfully');
    return response     
  } catch (error) {
    fs.unlinksync(localFilePath)
    return null;
  }
}

export {uploadOnCloudinary}