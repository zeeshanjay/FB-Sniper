"""
Meta Graph API Service - ISOLATED MODULE

All Facebook/Meta API interactions live here.
When Facebook changes their API, only this file needs updating.

This file handles:
- OAuth token exchange (short-lived → 60-day long-lived)
- User profile fetching
- Group/page management
- Content posting
- Rate limit handling
"""

import httpx
from typing import Optional, Dict, List, Any
from datetime import datetime, timedelta
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class MetaGraphAPI:
    """
    Singleton class for Meta Graph API interactions.
    All Facebook API calls should go through this class.
    """

    def __init__(self, app_id: str, app_secret: str):
        self.app_id = app_id
        self.app_secret = app_secret
        self.base_url = "https://graph.facebook.com/v19.0"
        self.client = httpx.AsyncClient(timeout=30.0)

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()

    # ==================== TOKEN MANAGEMENT ====================

    async def exchange_short_lived_token(
        self, short_lived_token: str
    ) -> Dict[str, Any]:
        """
        Exchange short-lived token for 60-day long-lived token.
        
        Endpoint: GET /oauth/access_token
        Docs: https://developers.facebook.com/docs/facebook-login/guides/advanced/token-handling/
        """
        url = f"{self.base_url}/oauth/access_token"
        params = {
            "grant_type": "fb_exchange_token",
            "client_id": self.app_id,
            "client_secret": self.app_secret,
            "fb_exchange_token": short_lived_token,
        }

        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            # Calculate expiration (60 days from now)
            expires_in = data.get("expires_in", 5184000)  # Default 60 days
            expires_at = datetime.utcnow() + timedelta(seconds=expires_in)
            
            return {
                "access_token": data.get("access_token"),
                "token_type": "long-lived",
                "expires_in": expires_in,
                "expires_at": expires_at.isoformat(),
            }
        except httpx.HTTPStatusError as e:
            logger.error(f"Token exchange failed: {e}")
            raise Exception(f"Failed to exchange token: {e.response.text}")

    async def refresh_long_lived_token(
        self, long_lived_token: str
    ) -> Dict[str, Any]:
        """
        Refresh an expired long-lived token.
        Note: Facebook may not support refresh, may need re-authentication.
        """
        # Attempt to use the token to check if it's still valid
        user_info = await self.get_user_profile(long_lived_token)
        if user_info:
            # Token is still valid, return current info
            return {
                "access_token": long_lived_token,
                "token_type": "long-lived",
                "status": "valid",
            }
        else:
            raise Exception("Token expired and refresh not available. Re-authenticate.")

    async def debug_token(self, access_token: str) -> Dict[str, Any]:
        """
        Debug a token to get its validity and metadata.
        
        Endpoint: GET /debug_token
        """
        url = f"{self.base_url}/debug_token"
        params = {
            "input_token": access_token,
            "access_token": f"{self.app_id}|{self.app_secret}",
        }

        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"Token debug failed: {e}")
            raise Exception(f"Failed to debug token: {e.response.text}")

    # ==================== USER PROFILE ====================

    async def get_user_profile(self, access_token: str) -> Optional[Dict[str, Any]]:
        """
        Get user profile information.
        
        Endpoint: GET /me
        Fields: id, name, email
        """
        url = f"{self.base_url}/me"
        params = {
            "fields": "id,name,email",
            "access_token": access_token,
        }

        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"Failed to get user profile: {e}")
            return None

    # ==================== GROUPS ====================

    async def get_user_groups(
        self, access_token: str, limit: int = 25
    ) -> List[Dict[str, Any]]:
        """
        Get groups the user is a member of.
        
        Endpoint: GET /me/groups
        Requires: 'user_groups' permission
        """
        url = f"{self.base_url}/me/groups"
        params = {
            "fields": "id,name,member_count,admin",
            "limit": limit,
            "access_token": access_token,
        }

        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("data", [])
        except httpx.HTTPStatusError as e:
            logger.error(f"Failed to get user groups: {e}")
            if e.response.status_code == 403:
                raise Exception("Missing 'user_groups' permission")
            raise Exception(f"Failed to get groups: {e.response.text}")

    async def get_group_feed(
        self, group_id: str, access_token: str, limit: int = 25
    ) -> List[Dict[str, Any]]:
        """
        Get feed/posts from a specific group.
        
        Endpoint: GET /{group_id}/feed
        """
        url = f"{self.base_url}/{group_id}/feed"
        params = {
            "fields": "id,message,from,created_time,permalink_url",
            "limit": limit,
            "access_token": access_token,
        }

        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("data", [])
        except httpx.HTTPStatusError as e:
            logger.error(f"Failed to get group feed: {e}")
            raise Exception(f"Failed to get group feed: {e.response.text}")

    # ==================== PAGES ====================

    async def get_user_pages(
        self, access_token: str, limit: int = 25
    ) -> List[Dict[str, Any]]:
        """
        Get pages the user manages.
        
        Endpoint: GET /me/accounts
        Requires: 'pages_read_engagement' permission
        """
        url = f"{self.base_url}/me/accounts"
        params = {
            "fields": "id,name,category,access_token",
            "limit": limit,
            "access_token": access_token,
        }

        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            return data.get("data", [])
        except httpx.HTTPStatusError as e:
            logger.error(f"Failed to get user pages: {e}")
            if e.response.status_code == 403:
                raise Exception("Missing 'pages_read_engagement' permission")
            raise Exception(f"Failed to get pages: {e.response.text}")

    # ==================== POSTING ====================

    async def post_to_group(
        self, group_id: str, message: str, access_token: str,
        media_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Post a message (with optional image) to a group.

        With image : POST /{group_id}/photos  (url + caption)
        Text only  : POST /{group_id}/feed    (message)
        Requires: 'publish_to_groups' permission
        """
        if media_url:
            url  = f"{self.base_url}/{group_id}/photos"
            data = {
                "url":          media_url,
                "caption":      message,
                "access_token": access_token,
            }
        else:
            url  = f"{self.base_url}/{group_id}/feed"
            data = {
                "message":      message,
                "access_token": access_token,
            }

        try:
            response = await self.client.post(url, data=data)
            response.raise_for_status()
            result = response.json()
            logger.info(f"Posted to group {group_id}: {result.get('id')}")
            return result
        except httpx.HTTPStatusError as e:
            logger.error(f"Failed to post to group: {e}")
            if e.response.status_code == 403:
                raise Exception("Missing 'publish_to_groups' permission or not a group admin")
            raise Exception(f"Failed to post: {e.response.text}")

    async def post_to_page(
        self, page_id: str, message: str, page_access_token: str,
        media_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Post a message (with optional image) to a page.

        With image : POST /{page_id}/photos  (url + caption)
        Text only  : POST /{page_id}/feed    (message)
        Requires: 'pages_manage_posts' permission
        """
        if media_url:
            url  = f"{self.base_url}/{page_id}/photos"
            data = {
                "url":          media_url,
                "caption":      message,
                "access_token": page_access_token,
            }
        else:
            url  = f"{self.base_url}/{page_id}/feed"
            data = {
                "message":      message,
                "access_token": page_access_token,
            }

        try:
            response = await self.client.post(url, data=data)
            response.raise_for_status()
            result = response.json()
            logger.info(f"Posted to page {page_id}: {result.get('id')}")
            return result
        except httpx.HTTPStatusError as e:
            logger.error(f"Failed to post to page: {e}")
            if e.response.status_code == 403:
                raise Exception("Missing 'pages_manage_posts' permission")
            raise Exception(f"Failed to post: {e.response.text}")

    async def comment_on_post(
        self, post_id: str, message: str, access_token: str
    ) -> Dict[str, Any]:
        """
        Comment on a post.
        
        Endpoint: POST /{post_id}/comments
        """
        url = f"{self.base_url}/{post_id}/comments"
        data = {
            "message": message,
            "access_token": access_token,
        }

        try:
            response = await self.client.post(url, data=data)
            response.raise_for_status()
            result = response.json()
            logger.info(f"Commented on post {post_id}: {result.get('id')}")
            return result
        except httpx.HTTPStatusError as e:
            logger.error(f"Failed to comment: {e}")
            raise Exception(f"Failed to comment: {e.response.text}")

    async def like_post(self, post_id: str, access_token: str) -> Dict[str, Any]:
        """
        Like a post.
        
        Endpoint: POST /{post_id}/likes
        """
        url = f"{self.base_url}/{post_id}/likes"
        data = {"access_token": access_token}

        try:
            response = await self.client.post(url, data=data)
            response.raise_for_status()
            result = response.json()
            logger.info(f"Liked post {post_id}")
            return result
        except httpx.HTTPStatusError as e:
            logger.error(f"Failed to like post: {e}")
            raise Exception(f"Failed to like post: {e.response.text}")

    # ==================== RATE LIMIT HANDLING ====================

    async def check_rate_limits(self, access_token: str) -> Dict[str, Any]:
        """
        Check current rate limit usage.
        
        Endpoint: GET /me/insights
        Note: This is a simplified check. Real rate limit info comes from response headers.
        """
        # Facebook rate limits are primarily communicated via response headers
        # This is a placeholder for rate limit monitoring
        return {
            "status": "monitoring",
            "message": "Rate limits are checked via response headers on each request",
        }

    def handle_rate_limit_error(self, response_headers: Dict[str, str]) -> Optional[int]:
        """
        Extract retry-after time from rate limit error headers.
        Returns seconds to wait, or None if not a rate limit error.
        """
        # Facebook uses standard rate limit headers
        retry_after = response_headers.get("Retry-After")
        if retry_after:
            return int(retry_after)
        
        # Check for Facebook-specific headers
        x_app_usage = response_headers.get("x-app-usage")
        if x_app_usage:
            # Parse usage and determine if we should back off
            pass
        
        return None


# Singleton instance
_meta_api: Optional[MetaGraphAPI] = None


def get_meta_api(app_id: str, app_secret: str) -> MetaGraphAPI:
    """Get or create the Meta API singleton instance."""
    global _meta_api
    if _meta_api is None:
        _meta_api = MetaGraphAPI(app_id, app_secret)
    return _meta_api
