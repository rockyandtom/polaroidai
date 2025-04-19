'use client';

import { useState, useEffect } from 'react';
import { Review } from '@/types';

// 默认的评价数据
const DEFAULT_REVIEWS: Review[] = [
  {
    id: '1',
    name: 'Emma Watson',
    comment: 'I love how my photos turned into beautiful polaroids! The AI really captures that vintage feel I was looking for.',
    rating: 5,
    date: '2023-09-15T14:32:00Z'
  },
  {
    id: '2',
    name: 'David Chen',
    comment: 'Incredible tool! The transformation is amazing and the process was super fast.',
    rating: 5,
    date: '2023-10-02T09:45:00Z'
  },
  {
    id: '3',
    name: 'Sophie Miller',
    comment: 'Great results overall, though some images work better than others. Still, a very cool service!',
    rating: 4,
    date: '2023-10-10T16:21:00Z'
  },
];

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newReview, setNewReview] = useState({
    name: '',
    comment: '',
    rating: 5
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // 加载评论
  useEffect(() => {
    const loadReviews = async () => {
      setIsLoading(true);
      
      try {
        // 从 API 获取评论
        const response = await fetch('/api/reviews');
        
        if (response.ok) {
          const data = await response.json();
          
          // 如果没有评论，使用默认评论
          if (data.reviews && data.reviews.length > 0) {
            setReviews(data.reviews);
          } else {
            setReviews(DEFAULT_REVIEWS);
          }
        } else {
          // 如果获取失败，使用默认评论
          setReviews(DEFAULT_REVIEWS);
        }
      } catch (err) {
        console.error('Error loading reviews:', err);
        setReviews(DEFAULT_REVIEWS);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadReviews();
  }, []);
  
  // 处理表单输入
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewReview(prev => ({ ...prev, [name]: value }));
  };
  
  // 处理评分选择
  const handleRatingChange = (rating: number) => {
    setNewReview(prev => ({ ...prev, rating }));
  };
  
  // 提交评论
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 验证表单
    if (!newReview.name.trim() || !newReview.comment.trim()) {
      setSubmitError('Please fill in all fields');
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      // 发送请求到 API
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newReview)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // 添加新评论到列表
        setReviews(prev => [data.review, ...prev]);
        
        // 重置表单
        setNewReview({
          name: '',
          comment: '',
          rating: 5
        });
        
        setSubmitSuccess(true);
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  return (
    <section id="reviews" className="section bg-white">
      <div className="container-custom">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
          User Reviews
        </h2>
        
        <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          See what others are saying about our Polaroid AI generator
        </p>
        
        {/* 评论列表 */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-16 h-16 border-4 border-polaroid-blue border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {reviews.map(review => (
              <div key={review.id} className="card p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{review.name}</h3>
                    <p className="text-gray-500 text-sm">{formatDate(review.date)}</p>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg 
                        key={i}
                        className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
        
        {/* 评论表单 */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-semibold mb-6 text-center">Leave Your Review</h3>
          
          <form onSubmit={handleSubmit} className="card p-6">
            {submitSuccess && (
              <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-lg">
                Thank you for your review! It has been added successfully.
              </div>
            )}
            
            {submitError && (
              <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg">
                {submitError}
              </div>
            )}
            
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newReview.name}
                onChange={handleInputChange}
                className="input-field w-full"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="comment" className="block text-gray-700 mb-2">Your Review</label>
              <textarea
                id="comment"
                name="comment"
                value={newReview.comment}
                onChange={handleInputChange}
                className="input-field w-full min-h-[120px]"
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Your Rating</label>
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleRatingChange(i + 1)}
                    className="p-1"
                    disabled={isSubmitting}
                  >
                    <svg 
                      className={`w-8 h-8 ${i < newReview.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </span>
              ) : 'Submit Review'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
} 