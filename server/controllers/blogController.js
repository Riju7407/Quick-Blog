import fs from 'fs'
import { v2 as cloudinary } from 'cloudinary';
import Blog from '../models/Blog.js';
import Comment from '../models/Comment.js';
import main from '../configs/gemini.js';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

console.log('Cloudinary Config:', {
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY?.substring(0, 5) + '...',
    api_secret: process.env.CLOUD_API_SECRET?.substring(0, 5) + '...'
});

export const addBlog = async (req, res)=>{
    try {
        const {title, subTitle, description, category, isPublished} = JSON.parse(req.body.blog);
        const imageFile = req.file;

        //check if all fields are present
        if(!title || !description || !category || !imageFile){
            return res.json({success: false, message: "Missing required fields"})
        }

        console.log('Uploading file:', imageFile.filename, 'Size:', imageFile.size);

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(imageFile.path, {
            folder: 'blogs',
            resource_type: 'auto',
            overwrite: true,
            unique_filename: true
        });

        console.log('Upload success:', result.public_id);

        // Apply transformations to the URL
        const optimizedUrl = cloudinary.url(result.public_id, {
            transformation: [
                { quality: 'auto' }, // Auto compression
                { fetch_format: 'webp' }, // convert to modern format
                { width: 1280, crop: 'scale' } // width resizing
            ],
            secure: true
        });

        const image = optimizedUrl;

        await Blog.create({title, subTitle, description, category, image, isPublished})
        
        // Clean up temporary file
        try {
            fs.unlinkSync(imageFile.path);
        } catch (err) {
            console.log('Temp file cleanup error:', err.message);
        }
        
        res.json({success: true, message: "Blog added successfully"})
    } catch (error) {
        console.error('Blog upload error:', error);
        try {
            if(imageFile?.path) fs.unlinkSync(imageFile.path);
        } catch (err) {
            console.log('Error cleaning temp file:', err.message);
        }
        res.json({success: false, message: error.message || "Error uploading blog"})
    }
}

export const getAllBlogs = async (req, res)=>{
    try {
        const blogs = await Blog.find({isPublished: true})
        res.json({success: true, blogs, message: "Blogs fetched successfully"})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const getBlogById = async (req, res)=>{
    try {
        const {blogId} = req.params;
        const blog = await Blog.findById(blogId)
        if(!blog){
            return res.json({success: false, message: "Blog not found"})
        }
        res.json({success: true, blog})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const deleteBlogById = async (req, res)=>{
    try {
        const {id} = req.body;
        await Blog.findByIdAndDelete(id);

        // Delete all comments associated with the blog
        
        await Comment.deleteMany({ blog: id });
        


        res.json({success: true, message: "Blog deleted successfully"})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const togglePublish = async (req, res)=>{
    try {
        const {id} = req.body;
        const blog = await Blog.findById(id);
        blog.isPublished = !blog.isPublished;
        await blog.save();
        res.json({success: true, message: "Blog publish status toggled successfully"})
    } catch (error) {
        res.json({success: false, message: error.message})
    }
}

export const addComment = async (req, res)=>{
    try{
        const {blogId, name, content} = req.body;
        console.log('Add comment request:', {blogId, name, content});
        
        if (!blogId) {
            return res.json({success: false, message: "Blog ID is required"})
        }
        
        await Comment.create({blog: blogId, name, content});
        res.json({success: true, message: "Comment added review"})
    } catch (error) {
        console.error('Add comment error:', error);
        res.json({success: false, message: error.message})
    }
}

export const getBlogComments = async (req, res)=>{
    try {
        const {blogId} = req.body;
        const comments = await Comment.find({blog: blogId, isApproved: true}).sort
        ({createdAt: -1});
        res.json({success: true, comments})

    } catch (error) {
            res.json({success: false, message: error.message})
    }
}


export const generateContent = async (req, res)=>{
    try {
        const {prompt} = req.body;
        const content = await main (prompt + ' Generate a blog content for this topic in simple text format');
        res.json({success: true, content})
    }catch (error) {
        res.json({success: false, message: error.message})
    }
}
