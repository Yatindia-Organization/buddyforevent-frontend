export const uploadToCloudinary = async (files) => {

    console.log("uploadToCloudinary")
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    const CLOUDINARY_URL = import.meta.env.VITE_CLOUDINARY_API_URL;

    const uploadedUrls = [];
    console.log(uploadedUrls, "urls")
    for (let file of files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', UPLOAD_PRESET);
        console.log(formData, "formdata")
        try {
            const response = await fetch(CLOUDINARY_URL, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok || !data.secure_url) {
                console.error('Cloudinary error response:', data);
                throw new Error(data.error?.message || 'Image upload failed');
            }

            console.log(data, "these are the url")
            uploadedUrls.push(data.secure_url);

        } catch (error) {
            console.error('Cloudinary Upload Error:', error);
            throw error;
        }
    }

    return uploadedUrls;
};
