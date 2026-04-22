"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

type BlogPost = {
	id: string;
	title: string;
	slug: string;
	excerpt: string;
	category: string;
	author: string;
	date: string;
	image?: string;
	isActive?: boolean;
};

const BlogSection = () => {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [loading, setLoading] = useState(true);
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

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				const res = await fetch("/api/blog-posts", { cache: "no-store" });
				if (!res.ok) throw new Error("Failed to load blog posts");
				const data = (await res.json()) as BlogPost[];
				setPosts(Array.isArray(data) ? data : []);
			} catch {
				setPosts([]);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	const visiblePosts = useMemo(() => posts.slice(0, isMobile ? 6 : 3), [posts, isMobile]);

	if (!loading && visiblePosts.length === 0) return null;

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
							{visiblePosts.map((post) => (
								<Card
									key={post.id}
									className="min-w-[280px] max-w-[280px] flex-shrink-0 overflow-hidden border-0 shadow-md blog-card mx-2 first:ml-0 last:mr-0"
									style={{ scrollSnapAlign: "start" }}
								>
									<div className="relative h-48 overflow-hidden">
										<Image
											src={
												post.image && post.image.startsWith("http")
													? post.image
													: "https://images.unsplash.com/photo-1556269923-e4ef51d69638?q=80&w=2036&auto=format&fit=crop"
											}
											alt={post.title}
											fill
											className="object-cover transition-transform hover:scale-105 duration-300"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
										<div className="absolute bottom-4 left-4 right-4">
											<span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full mb-2">
												{post.category}
											</span>
										</div>
									</div>
									<CardContent className="flex flex-col h-[160px]">
										<h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 h-12">
											{post.title}
										</h3>
										<p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
											{post.excerpt}
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
						{visiblePosts.slice(0, 3).map((post) => (
							<Card
								key={post.id}
								className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-all duration-300"
							>
								<div className="relative h-48 overflow-hidden">
									<Image
										src={
											post.image && post.image.startsWith("http")
												? post.image
												: "https://images.unsplash.com/photo-1556269923-e4ef51d69638?q=80&w=2036&auto=format&fit=crop"
										}
										alt={post.title}
										fill
										className="object-cover transition-transform hover:scale-105 duration-300"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
									<div className="absolute bottom-4 left-4 right-4">
										<span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full mb-2">
											{post.category}
										</span>
									</div>
								</div>
								<CardContent className="flex flex-col h-[180px]">
									<h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
										{post.title}
									</h3>
									<p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
										{post.excerpt}
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
