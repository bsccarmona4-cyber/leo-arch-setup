import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function usePosts(mode = 'feed') {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (id, username, avatar_url, full_name),
          likes (id, user_id),
          comments (id, content, created_at, profiles:user_id (id, username, avatar_url))
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (mode === 'feed' && user) {
        // Get IDs of people the user follows
        const { data: following } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);

        const followingIds = following?.map(f => f.following_id) || [];

        if (followingIds.length > 0) {
          // Include own posts + following posts
          query = query.in('user_id', [...followingIds, user.id]);
        }
        // If not following anyone, show all posts (explore mode)
      }

      if (mode === 'user') {
        // Will be filtered by the component
      }

      const { data, error } = await query;
      if (error) throw error;

      // Enrich posts with like status
      const enriched = (data || []).map(post => ({
        ...post,
        isLiked: post.likes?.some(l => l.user_id === user?.id) || false,
        likesCount: post.likes?.length || 0,
        commentsCount: post.comments?.length || 0,
      }));

      setPosts(enriched);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, [mode, user]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  async function toggleLike(postId) {
    if (!user) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likesCount: p.isLiked ? p.likesCount - 1 : p.likesCount + 1,
        };
      }
      return p;
    }));

    try {
      if (post.isLiked) {
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('likes')
          .insert({ post_id: postId, user_id: user.id });
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      // Revert on error
      fetchPosts();
    }
  }

  async function addComment(postId, content) {
    if (!user || !content.trim()) return;

    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim(),
        });

      if (error) throw error;
      await fetchPosts();
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  }

  async function createPost(imageFile, caption) {
    if (!user || !imageFile) return;

    try {
      // Upload image to Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('posts')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(fileName);

      // Create post record
      const { error: postError } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          caption: caption || '',
        });

      if (postError) throw postError;
      await fetchPosts();
      return true;
    } catch (err) {
      console.error('Error creating post:', err);
      throw err;
    }
  }

  async function deletePost(postId) {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
    }
  }

  return {
    posts,
    loading,
    toggleLike,
    addComment,
    createPost,
    deletePost,
    refetch: fetchPosts,
  };
}
