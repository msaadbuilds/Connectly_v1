import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'chat-media',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'png', 'jpeg', 'mp4', 'mov', 'avi', 'mkv'],
  
      eager: [
        { quality: "auto" },
        { fetch_format: "auto" },
        { flags: "progressive" }
      ],
      eager_async: true, 
    }
  });
  
export {
  cloudinary,
  storage
}