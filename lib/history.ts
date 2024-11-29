export interface VideoHistory {
  id: string;
  url: string;
  title: string;
  timestamp: string;
  article?: string;
  socialPosts?: string[];
}

export const historyManager = {
  saveVideo: (video: Omit<VideoHistory, 'id' | 'timestamp'>) => {
    try {
      const history = JSON.parse(localStorage.getItem('tube2text_history') || '[]') as VideoHistory[];
      const newVideo: VideoHistory = {
        ...video,
        id: Math.random().toString(36).substring(7),
        timestamp: new Date().toISOString()
      };
      history.unshift(newVideo);
      // Keep only last 50 videos
      if (history.length > 50) history.pop();
      localStorage.setItem('tube2text_history', JSON.stringify(history));
      return newVideo;
    } catch (error) {
      console.error('Failed to save video to history', error);
      return null;
    }
  },

  getHistory: (): VideoHistory[] => {
    try {
      return JSON.parse(localStorage.getItem('tube2text_history') || '[]');
    } catch (error) {
      console.error('Failed to get history', error);
      return [];
    }
  },

  clearHistory: () => {
    localStorage.removeItem('tube2text_history');
  },

  deleteVideo: (id: string) => {
    try {
      const history = JSON.parse(localStorage.getItem('tube2text_history') || '[]') as VideoHistory[];
      const newHistory = history.filter(video => video.id !== id);
      localStorage.setItem('tube2text_history', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Failed to delete video from history', error);
    }
  }
};
