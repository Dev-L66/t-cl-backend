import express from 'express';
import { protectedRoute } from '../middleware/protectedRoute.js';
import { getAllPosts,  createPost, getUserPosts, getLikedPosts,getFollowingPosts, likeUnlikePost, commentOnPost, deletePost, deleteComment } from '../controllers/post.controller.js';
const router = express.Router();


router.get('/all', protectedRoute, getAllPosts);
router.post('/create', protectedRoute, createPost);
router.get('/user/:username', protectedRoute, getUserPosts)
router.get('/likes/:id', protectedRoute, getLikedPosts);
router.get('/following', protectedRoute, getFollowingPosts);
router.post('/likes/:id', protectedRoute, likeUnlikePost);
router.post('/comment/:id', protectedRoute, commentOnPost);
router.delete('/:postId/comment/:commentId', protectedRoute, deleteComment);
router.delete('/:id', protectedRoute, deletePost);

export default router;