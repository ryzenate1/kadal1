"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const blogPosts = [
	{
		id: 1,
		title: "Why Vanjaram fish is considered one of the healthiest seafood choices?",
		image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?q=80&w=2070&auto=format&fit=crop&w=800",
		slug: "vanjaram-fish-health-benefits",
		readTime: "4 min read",
		category: "Health Benefits",
		description: "Discover why Vanjaram fish is packed with essential nutrients and how it can benefit your health.",
	},
	{
		id: 2,
		title: "Sustainable Fishing: How Kadal Thunai Sources the Freshest Catch",
		image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop&w=800",
		slug: "sustainable-fishing",
		readTime: "5 min read",
		category: "Sustainability",
		description: "Learn about our commitment to sustainable fishing practices and how we ensure the freshest catch.",
	},
	{
		id: 3,
		title: "The Health Benefits of Omega-3 Rich Seafood",
		image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop&w=800",
		slug: "omega3-benefits",
		readTime: "6 min read",
		category: "Nutrition",
		description: "Explore the numerous health benefits of including omega-3 rich seafood in your diet.",
	},
	{
		id: 4,
		title: "5 Delicious Fish Curry Recipes You Must Try",
		image: "https://images.unsplash.com/photo-1568600891621-50f697b9a1c7?q=80&w=2070&auto=format&fit=crop&w=800",
		slug: "fish-curry-recipes",
		readTime: "8 min read",
		category: "Recipes",
		description: "Try these mouthwatering fish curry recipes that are easy to make and packed with flavor.",
	},
];

const BlogSection = () => {
	const [isMobile, setIsMobile] = useState(false);
	const blogContainerRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(true);

	// Check if mobile on mount and on resize
	useEffect(() => {
		const checkIfMobile = () => setIsMobile(window.innerWidth < 768);
		checkIfMobile();
		window.addEventListener("resize", checkIfMobile);
		return () => window.removeEventListener("resize", checkIfMobile);
	}, []);

	// Check scroll position to determine if scroll buttons should be enabled
	const checkScrollPosition = () => {
		if (!blogContainerRef.current) return;

		const { scrollLeft, scrollWidth, clientWidth } = blogContainerRef.current;
		setCanScrollLeft(scrollLeft > 0);
		setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px buffer
	};

	useEffect(() => {
		if (isMobile && blogContainerRef.current) {
			const container = blogContainerRef.current;
			container.addEventListener("scroll", checkScrollPosition);

			// Initial check
			checkScrollPosition();

			return () => container.removeEventListener("scroll", checkScrollPosition);
		}
	}, [isMobile]);

	// Scroll functions for blog cards
	const scrollLeft = () => {
		if (!blogContainerRef.current) return;

		const container = blogContainerRef.current;
		const scrollAmount = container.clientWidth * 0.8;
		container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
	};

	const scrollRight = () => {
		if (!blogContainerRef.current) return;

		const container = blogContainerRef.current;
		const scrollAmount = container.clientWidth * 0.8;
		container.scrollBy({ left: scrollAmount, behavior: "smooth" });
	};

	return (
		<section className="py-6 sm:py-8 lg:py-12 bg-[var(--primary-bg)] blog-section">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-8 sm:mb-10 lg:mb-12">
					<span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full mb-3">
						LATEST STORIES
					</span>
					<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3">
						From Our Seafood Blog
					</h2>
					<p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
						Discover recipes, cooking tips, and the latest in sustainable seafood
					</p>
				</div>

				{isMobile ? (
					<div className="relative">
						{/* Mobile scroll controls */}
						<div className="flex justify-between mb-4">
							<button
								onClick={scrollLeft}
								className={`p-2 rounded-full ${
									canScrollLeft
										? "bg-white shadow-md text-blue-600"
										: "bg-gray-100 text-gray-400 cursor-not-allowed"
								}`}
								disabled={!canScrollLeft}
								aria-label="Scroll left"
							>
								<ChevronLeft className="w-5 h-5" />
							</button>
							<span className="text-sm text-gray-500">Swipe to explore</span>
							<button
								onClick={scrollRight}
								className={`p-2 rounded-full ${
									canScrollRight
										? "bg-white shadow-md text-blue-600"
										: "bg-gray-100 text-gray-400 cursor-not-allowed"
								}`}
								disabled={!canScrollRight}
								aria-label="Scroll right"
							>
								<ChevronRight className="w-5 h-5" />
							</button>
						</div>

						{/* Horizontal scrollable container */}
						<div
							ref={blogContainerRef}
							className="flex overflow-x-auto pb-6 blog-container hide-scrollbar"
							style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
						>
							{blogPosts.map((post) => (
								<Card
									key={post.id}
									className="min-w-[280px] max-w-[280px] flex-shrink-0 overflow-hidden border-0 shadow-md blog-card mx-2 first:ml-0 last:mr-0"
									style={{ scrollSnapAlign: "start" }}
								>
									<div className="relative h-48 overflow-hidden">
										<Image
											src={post.image}
											alt={post.title}
											fill
											className="object-cover transition-transform hover:scale-105 duration-300"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
										<div className="absolute bottom-4 left-4 right-4">
											<span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full mb-2">
												{post.category}
											</span>
											<span className="inline-block text-white text-xs ml-2">
												{post.readTime}
											</span>
										</div>
									</div>
									<CardContent className="flex flex-col h-[160px]">
										<h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">
											{post.title}
										</h3>
										<p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
											{post.description}
										</p>
										<Link
											href={`/blog/${post.slug}`}
											className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
										>
											View Article{" "}
											<ArrowRight className="ml-1 h-4 w-4" />
										</Link>
									</CardContent>
								</Card>
							))}
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{blogPosts.slice(0, 3).map((post) => (
							<Card
								key={post.id}
								className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300"
							>
								<div className="relative h-48 overflow-hidden">
									<Image
										src={post.image}
										alt={post.title}
										fill
										className="object-cover transition-transform hover:scale-105 duration-300"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
									<div className="absolute bottom-4 left-4 right-4">
										<span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full mb-2">
											{post.category}
										</span>
										<span className="inline-block text-white text-xs ml-2">
											{post.readTime}
										</span>
									</div>
								</div>
								<CardContent className="flex flex-col h-[180px]">
									<h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
										{post.title}
									</h3>
									<p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
										{post.description}
									</p>
									<Link
										href={`/blog/${post.slug}`}
										className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
									>
										View Article{" "}
										<ArrowRight className="ml-1 h-4 w-4" />
									</Link>
								</CardContent>
							</Card>
						))}
					</div>
				)}

				{/* View All button for both mobile and desktop */}
				<div className="mt-8 sm:mt-10 lg:mt-12 text-center">
					<Link href="/blog">
						<Button
							variant="outline"
							className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:text-blue-700 px-6 py-2"
						>
							View All Articles
							<ArrowRight className="ml-2 h-4 w-4" />
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
};

export default BlogSection;
