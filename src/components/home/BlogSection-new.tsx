/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Calendar, Clock, User } from "lucide-react";
import SliderWrapper from "../ui/SliderWrapper";
import { fadeIn, staggerContainer, staggerItem } from "@/utils/motionUtils";

// Enhanced blog post data
const blogPosts = [
  {
    id: 1,
    title: "Why Vanjaram Fish is Considered One of the Healthiest Seafood Choices",
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=2070&auto=format&fit=crop&w=800",
    slug: "vanjaram-fish-health-benefits",
    readTime: "4 min read",
    category: "Health Benefits",
    author: "Dr. Priya Sharma",
    publishDate: "2024-12-15",
    excerpt: "Discover why Vanjaram fish is packed with essential nutrients including omega-3 fatty acids, high-quality protein, and vital minerals that boost heart health and brain function.",
    featured: true,
    tags: ["nutrition", "health", "omega-3"]
  },
  {
    id: 2,
    title: "Sustainable Fishing: How Kadal Thunai Sources the Freshest Catch",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop&w=800",
    slug: "sustainable-fishing",
    readTime: "5 min read",
    category: "Sustainability",
    author: "Rajesh Kumar",
    publishDate: "2024-12-10",
    excerpt: "Learn about our commitment to sustainable fishing practices, supporting local fishermen, and how we ensure the freshest catch reaches your doorstep while protecting marine ecosystems.",
    featured: false,
    tags: ["sustainability", "environment", "fishing"]
  },
  {
    id: 3,
    title: "The Complete Guide to Omega-3 Rich Seafood and Its Benefits",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop&w=800",
    slug: "omega3-benefits-guide",
    readTime: "6 min read",
    category: "Nutrition",
    author: "Dr. Meera Devi",
    publishDate: "2024-12-05",
    excerpt: "Explore the numerous health benefits of including omega-3 rich seafood in your diet, from improved heart health to enhanced cognitive function and reduced inflammation.",
    featured: true,
    tags: ["omega-3", "nutrition", "health", "benefits"]
  },
  {
    id: 4,
    title: "5 Authentic South Indian Fish Curry Recipes You Must Try",
    image: "https://images.unsplash.com/photo-1568600891621-50f697b9a1c7?q=80&w=2070&auto=format&fit=crop&w=800",
    slug: "south-indian-fish-curry-recipes",
    readTime: "8 min read",
    category: "Recipes",
    author: "Chef Lakshmi",
    publishDate: "2024-11-28",
    excerpt: "Try these mouthwatering traditional South Indian fish curry recipes that are easy to make, packed with flavor, and perfect for family dinners.",
    featured: false,
    tags: ["recipes", "curry", "south-indian", "cooking"]
  },
  {
    id: 5,
    title: "How to Select and Store Fresh Fish: A Complete Guide",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?q=80&w=2070&auto=format&fit=crop&w=800",
    slug: "select-store-fresh-fish-guide",
    readTime: "7 min read",
    category: "Tips & Guides",
    author: "Arjun Patel",
    publishDate: "2024-11-20",
    excerpt: "Master the art of selecting the freshest fish and learn proper storage techniques to maintain quality, flavor, and nutritional value at home.",
    featured: false,
    tags: ["tips", "storage", "freshness", "guide"]
  },
  {
    id: 6,
    title: "The Rise of Online Seafood Shopping in India",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?q=80&w=2070&auto=format&fit=crop&w=800",
    slug: "online-seafood-shopping-india",
    readTime: "5 min read",
    category: "Industry Insights",
    author: "Karthik Raman",
    publishDate: "2024-11-15",
    excerpt: "Discover how digital transformation is revolutionizing the seafood industry in India, making fresh fish more accessible to urban consumers.",
    featured: false,
    tags: ["e-commerce", "digital", "trends", "india"]
  }
];

// Blog card component
const BlogCard = ({ post }: { post: typeof blogPosts[0] }) => {
  const [imageError, setImageError] = useState(false);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <motion.div 
      className="blog-card group"
      variants={staggerItem}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
    >
      {/* Featured badge */}
      {post.featured && (
        <div className="absolute top-4 left-4 z-10 bg-primary-accent text-white text-xs px-2 py-1 rounded-full font-semibold">
          Featured
        </div>
      )}
      
      {/* Blog image */}
      <div className="relative overflow-hidden">
        {!imageError ? (
          <Image
            src={post.image}
            alt={post.title}
            width={400}
            height={200}
            className="blog-image"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="blog-image bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Image not available</span>
          </div>
        )}
        
        {/* Category overlay */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-primary-accent text-xs px-3 py-1 rounded-full font-semibold">
          {post.category}
        </div>
      </div>
      
      {/* Blog content */}
      <div className="blog-content">
        <h3 className="blog-title group-hover:text-primary-accent transition-colors">
          {post.title}
        </h3>
        
        <p className="blog-excerpt">
          {post.excerpt}
        </p>
        
        {/* Blog meta */}
        <div className="blog-meta">
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {post.author}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(post.publishDate)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </span>
          </div>
          
          <Link 
            href={`/blog/${post.slug}`}
            className="blog-read-more group-hover:translate-x-1 transition-transform inline-flex items-center gap-1"
          >
            Read More
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-3">
          {post.tags.slice(0, 3).map((tag) => (
            <span 
              key={tag}
              className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Main blog section
const BlogSection = () => {
  const [blogData, setBlogData] = useState(blogPosts);

  // Fetch blog posts from API (if available)
  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await fetch('/api/blog-posts');
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data)) {
            setBlogData(data.slice(0, 6)); // Limit to 6 posts
          }
        }
      } catch (error) {
        console.log('Using static blog data');
        // Continue with static data if API fails
      }
    };

    fetchBlogPosts();
  }, []);

  return (
    <section className="py-16 bg-white">
      <motion.div 
        className="container-xl"
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
      >
        {/* Section header */}
        <motion.div className="text-center mb-12" variants={staggerItem}>
          <h2 className="text-heading mb-4">
            Latest from Our Blog
          </h2>
          <p className="text-body max-w-2xl mx-auto">
            Stay updated with the latest seafood insights, cooking tips, health benefits, and industry news
          </p>
        </motion.div>
        
        {/* Blog posts slider */}
        <motion.div variants={staggerItem}>
          <SliderWrapper
            slidesPerView={1}
            spaceBetween={24}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            navigation={true}
            pagination={true}
            loop={true}
            className="blog-slider"
            breakpoints={{
              640: {
                slidesPerView: 1,
                spaceBetween: 20
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 24
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 32
              }
            }}
          >
            {blogData.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </SliderWrapper>
        </motion.div>
        
        {/* Call to action */}
        <motion.div className="text-center mt-12" variants={staggerItem}>
          <p className="text-body mb-6">
            Want to read more? Explore our complete blog collection
          </p>
          <Link 
            href="/blog"
            className="btn-base btn-primary inline-flex items-center gap-2"
          >
            View All Articles
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default BlogSection;
