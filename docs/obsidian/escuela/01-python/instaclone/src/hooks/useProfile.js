import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export function useProfile(username) {
  const [profileData, setProfileData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchProfile = useCallback(async () => {
    if (!username) return;

    setLoading(true);
    try {
      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (profileError) throw profileError;
      setProfileData(profile);

      // Fetch user's posts with likes count
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          likes (id, user_id),
          comments (id)
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const enrichedPosts = (posts || []).map(post => ({
        ...post,
        likesCount: post.likes?.length || 0,
        commentsCount: post.comments?.length || 0,
      }));
      setUserPosts(enrichedPosts);

      // Fetch followers count
      const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profile.id);

      setFollowersCount(followers || 0);

      // Fetch following count
      const { count: following } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', profile.id);

      setFollowingCount(following || 0);

      // Check if current user follows this profile
      if (user && user.id !== profile.id) {
        const { data: followData } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('follower_id', user.id)
          .eq('following_id', profile.id)
          .single();

        setIsFollowing(!!followData);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  }, [username, user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  async function toggleFollow() {
    if (!user || !profileData || user.id === profileData.id) return;

    // Optimistic update
    setIsFollowing(prev => !prev);
    setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);

    try {
      if (isFollowing) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profileData.id);
      } else {
        await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: profileData.id,
          });
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
      // Revert on error
      setIsFollowing(prev => !prev);
      setFollowersCount(prev => isFollowing ? prev + 1 : prev - 1);
    }
  }

  return {
    profileData,
    userPosts,
    isFollowing,
    followersCount,
    followingCount,
    loading,
    toggleFollow,
    refetch: fetchProfile,
  };
}
