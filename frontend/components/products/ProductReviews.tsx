'use client';

import React, { useState } from 'react';
import { Star, CheckCircle, ThumbsUp, Camera, Plus } from 'lucide-react';
import { Button } from '../ui/Button';

interface Review {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  title: string;
  content: string;
  verified: boolean;
  fit: string;
  helpfulCount: number;
}

const MOCK_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    author: 'Sophie L.',
    location: 'London, UK 🇬🇧',
    rating: 5,
    date: 'October 2, 2026',
    title: 'Extremely soft organic cotton & heirloom quality!',
    content:
      'I ordered this for my 4-month-old daughter and the quality surpassed my expectations. The organic cashmere blend feels like a cloud against baby skin. Washes beautifully with zero shrinkage.',
    verified: true,
    fit: 'Runs True to Size',
    helpfulCount: 14,
  },
  {
    id: 'rev_2',
    author: 'Camilla M.',
    location: 'New York, USA 🇺🇸',
    rating: 5,
    date: 'September 28, 2026',
    title: 'The perfect gift for our baby shower!',
    content:
      'Packaged in the signature REXBEBE luxury ribbon box. Our guests were raving about how cute and soft it is. Will definitely be buying more from the Autumn Atelier collection.',
    verified: true,
    fit: 'Perfect Fit',
    helpfulCount: 9,
  },
  {
    id: 'rev_3',
    author: 'Hannah S.',
    location: 'Sydney, Australia 🇦🇺',
    rating: 5,
    date: 'September 15, 2026',
    title: 'Fast international delivery to Sydney!',
    content:
      'Dispatched via DHL Express and arrived in Australia in just 4 days! Impeccable stitching and hypoallergenic buttons.',
    verified: true,
    fit: 'Slightly Roomy',
    helpfulCount: 6,
  },
];

export function ProductReviews() {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('');

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const created: Review = {
      id: `rev_${Date.now()}`,
      author: newAuthor.trim() || 'Happy Parent',
      location: 'Verified Shopper 🌟',
      rating: newRating,
      date: 'Just now',
      title: newTitle,
      content: newContent,
      verified: true,
      fit: 'True to Size',
      helpfulCount: 0,
    };

    setReviews([created, ...reviews]);
    setIsWriteModalOpen(false);
    setNewTitle('');
    setNewContent('');
    setNewAuthor('');
  };

  const averageRating = (
    reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
  ).toFixed(1);

  return (
    <div className="pt-12 border-t border-stone-200 space-y-8">
      {/* Review Summary Top Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-white/80 shadow-rexbebe-3d flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center space-x-6 text-center md:text-left">
          <div className="space-y-1">
            <span className="text-4xl sm:text-5xl font-extrabold text-purple-950 font-heading">
              {averageRating}
            </span>
            <div className="flex items-center justify-center md:justify-start space-x-1 text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="text-xs text-stone-400 font-medium">Based on {reviews.length} parent reviews</span>
          </div>

          <div className="hidden sm:block h-16 w-px bg-stone-200/70" />

          <div className="hidden sm:space-y-1 text-xs text-stone-600">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-stone-800">Softness &amp; Comfort:</span>
              <span className="text-emerald-700 font-bold">5.0 / 5.0</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-stone-800">Sizing &amp; Fit:</span>
              <span className="text-pink-700 font-bold">True to Size (98%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-stone-800">Fabric Durability:</span>
              <span className="text-purple-700 font-bold">Passes 20+ Washes</span>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          className="btn-rexbebe-3d text-xs font-bold w-full md:w-auto"
          onClick={() => setIsWriteModalOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1.5 inline" />
          Write a Parent Review
        </Button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((rev) => (
          <div
            key={rev.id}
            className="bg-white/80 backdrop-blur-xs rounded-3xl p-6 border border-stone-200/70 shadow-2xs space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center font-bold text-sm">
                  {rev.author.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-stone-900 text-sm">{rev.author}</span>
                    {rev.verified && (
                      <span className="inline-flex items-center text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-400">{rev.location}</span>
                </div>
              </div>

              <span className="text-xs text-stone-400">{rev.date}</span>
            </div>

            <div className="flex items-center space-x-1 text-amber-400">
              {[...Array(rev.rating)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
              ))}
              <span className="text-xs font-bold text-stone-500 ml-2">{rev.fit}</span>
            </div>

            <h4 className="font-bold text-purple-950 text-sm sm:text-base">{rev.title}</h4>
            <p className="text-stone-600 text-xs sm:text-sm font-normal leading-relaxed">{rev.content}</p>
          </div>
        ))}
      </div>

      {/* Write Review Modal */}
      {isWriteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/60 backdrop-blur-xs">
          <form
            onSubmit={handleAddReview}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-150 border border-white/80"
          >
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="font-extrabold text-stone-900 text-lg">Write a Review</h3>
              <button
                type="button"
                onClick={() => setIsWriteModalOpen(false)}
                className="text-stone-400 hover:text-stone-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah M."
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-stone-800 focus:ring-2 focus:ring-pink-300"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Star Rating</label>
                <div className="flex items-center space-x-1 text-amber-400 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      onClick={() => setNewRating(star)}
                      className={`w-6 h-6 ${
                        star <= newRating ? 'fill-amber-400' : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Review Headline</label>
                <input
                  type="text"
                  placeholder="Summarize your experience..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-stone-800 focus:ring-2 focus:ring-pink-300"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Detailed Review</label>
                <textarea
                  rows={4}
                  placeholder="Tell us about the fabric softness, sizing, and comfort..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-stone-200 text-stone-800 focus:ring-2 focus:ring-pink-300"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 border-t border-stone-100 pt-3">
              <Button variant="outline" size="sm" onClick={() => setIsWriteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Submit Review
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
