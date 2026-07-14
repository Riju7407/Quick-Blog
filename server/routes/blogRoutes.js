import express from 'express';
import { addBlog, deleteBlogById, getAllBlogs, getBlogById, togglePublish, addComment ,getBlogComments, generateContent } from '../controllers/blogController.js'; 
import upload from '../middleware/multer.js';
import auth from '../middleware/auth.js';


const blogRouter = express.Router();

blogRouter.post('/add', upload.single('image'), auth, addBlog)
blogRouter.get('/all', getAllBlogs);
blogRouter.get('/:blogId', getBlogById); // Example of another route
blogRouter.post('/delete', auth, deleteBlogById); // Example of another route
blogRouter.post('/toggle-publish', auth, togglePublish);
blogRouter.post('/add-comment', addComment);
blogRouter.post('/comments', getBlogComments);
blogRouter.post('/generate-content', auth , generateContent);

export default blogRouter;