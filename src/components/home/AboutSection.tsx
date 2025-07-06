"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { AnimatedText } from "@/components/ui/animated-text";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ParallaxSection } from "@/components/ui/parallax-section";

const accordionItems = [
	{
		id: "trusted-source",
		title: "Trusted Source for Fresh Tamil Nadu Seafood",
		content:
			"Kadal Thunai is your trusted source for the freshest seafood directly from Tamil Nadu's coastline. We partner with local fishermen to ensure you receive the highest quality fish and seafood, sustainably sourced and carefully selected for optimal freshness and flavor.",
	},
	{
		id: "same-day-delivery",
		title: "Same-Day Delivery to Your Doorstep",
		content:
			"We understand the importance of freshness when it comes to seafood. That's why we offer same-day delivery for orders placed before noon. Our dedicated delivery network ensures your seafood arrives at your doorstep in perfect condition, ready for your culinary creations.",
	},
	{
		id: "quality-guaranteed",
		title: "Quality Guaranteed with Satisfaction Promise",
		content:
			"Every product from Kadal Thunai comes with our quality guarantee. If you're not completely satisfied with the freshness or quality of your seafood, we'll replace it or provide a refund. Your satisfaction is our top priority, and we stand behind the quality of our products.",
	},
	{
		id: "customized-cutting",
		title: "Customized Cutting and Cleaning Services",
		content:
			"We offer free customized cutting and cleaning services to save you time and effort. Simply specify your preferences during checkout, and our skilled team will prepare your seafood exactly as you like it, making your cooking experience even more convenient.",
	},
	{
		id: "digital-convenience",
		title: "Digital Convenience with Mobile App",
		content:
			"Experience the convenience of ordering seafood with our user-friendly mobile app. Browse our extensive selection, place orders with just a few taps, track your delivery in real-time, and enjoy exclusive app-only deals and discounts. Download the Kadal Thunai app today for a seamless seafood shopping experience.",
	},
];

const AboutSection = () => {
	const [openItem, setOpenItem] = useState("freshly-cut");

	const toggleItem = (id: string) => {
		setOpenItem(openItem === id ? "" : id);
	};

	const sectionRef = useRef<HTMLDivElement>(null);
	const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

	return (
		<div className="py-6 sm:py-8 lg:py-12" ref={sectionRef}>
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<AnimatedSection direction="up" delay={0.1}>
					<h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-6 sm:mb-8 lg:mb-10">
						<AnimatedText
							text="About Kadal Thunai & Services!"
							tag="span"
							delay={0.2}
						/>
					</h2>
				</AnimatedSection>

				<div className="space-y-4 sm:space-y-6">
					{accordionItems.map((item, index) => (
						<AnimatedSection
							key={item.id}
							className="w-full"
							direction="up"
							delay={0.2 + index * 0.1}
						>
							<div className="border border-gray-200 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
								<button
									className="w-full flex justify-between items-center p-4 sm:p-5 lg:p-6 text-left bg-white hover:bg-gray-50 transition-colors"
									onClick={() => toggleItem(item.id)}
								>
									<h3 className="text-base sm:text-lg lg:text-xl font-medium text-gray-800 pr-4">
										{item.title}
									</h3>
									<motion.div
										className="flex-shrink-0 ml-2"
										animate={{ rotate: openItem === item.id ? 180 : 0 }}
										transition={{ duration: 0.3 }}
									>
										<Image
											src="/images/expand-icon.png"
											alt={
												openItem === item.id ? "Collapse" : "Expand"
											}
											width={16}
											height={16}
										/>
									</motion.div>
								</button>
								<motion.div
									initial={{ height: 0, opacity: 0 }}
									animate={{
										height: openItem === item.id ? "auto" : 0,
										opacity: openItem === item.id ? 1 : 0,
									}}
									transition={{ duration: 0.3, ease: "easeInOut" }}
									className="overflow-hidden"
								>
									<div className="p-4 sm:p-5 lg:p-6 bg-gray-50 border-t border-gray-200">
										<p className="text-gray-600 text-sm sm:text-base leading-relaxed">
											{item.content}
										</p>
									</div>
								</motion.div>
							</div>
						</AnimatedSection>
					))}
				</div>
			</div>
		</div>
	);
};

export default AboutSection;
