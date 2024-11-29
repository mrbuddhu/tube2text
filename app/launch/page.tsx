'use client';

import { Button } from "@/components/ui/button";
import { CountdownTimer } from "@/components/CountdownTimer";
import Link from "next/link";
import Image from "next/image";

// Set end date to 48 hours from deployment
const SALE_END_DATE = new Date(Date.now() + 48 * 60 * 60 * 1000);

export default function LaunchPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* ProductHunt Banner */}
      <div className="bg-[#DA552F] p-3 text-center">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-white">🎉 We're live on Product Hunt!</span>
          <a
            href="https://www.producthunt.com/posts/tube2text"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-[#DA552F] px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Support us 🙌
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-8">
            Transform YouTube Videos into<br />AI-Powered Content
          </h1>
          
          <div className="mb-8">
            <CountdownTimer endDate={SALE_END_DATE} />
          </div>

          {/* Launch Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-12">
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="text-3xl font-bold text-white mb-2">48hrs</div>
              <div className="text-gray-400">Flash Sale</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="text-3xl font-bold text-white mb-2">80%</div>
              <div className="text-gray-400">Discount</div>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="text-3xl font-bold text-white mb-2">70</div>
              <div className="text-gray-400">Limited Spots</div>
            </div>
          </div>

          {/* Product Demo GIF */}
          <div className="mb-12 relative h-[400px] rounded-xl overflow-hidden">
            <Image
              src="/demo.gif"
              alt="Tube2Text Demo"
              fill
              className="object-cover"
            />
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="text-3xl mb-4">⚡️</div>
              <h3 className="text-xl font-semibold text-white mb-2">Save Hours</h3>
              <p className="text-gray-400">
                Automatically convert videos to articles, summaries, and social posts
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="text-3xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-white mb-2">AI-Powered</h3>
              <p className="text-gray-400">
                Advanced AI models for high-quality content generation
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="text-3xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-white mb-2">One-Time Fee</h3>
              <p className="text-gray-400">
                No monthly subscriptions, pay once use forever
              </p>
            </div>
          </div>

          {/* Launch Special */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">
              🚀 Launch Special: 80% OFF
            </h2>
            <p className="text-xl text-white mb-6">
              Lock in our lowest price ever - Only for the next 48 hours
            </p>
            <Link href="/pricing">
              <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100">
                Get Lifetime Access Now
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <Image
                  src="/testimonial1.jpg"
                  alt="Sarah"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="ml-4">
                  <div className="text-white font-semibold">Sarah Johnson</div>
                  <div className="text-gray-400">Content Creator</div>
                </div>
              </div>
              <p className="text-gray-300">
                "Tube2Text has completely transformed my content creation process. 
                I save hours of work with each video!"
              </p>
            </div>
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                <Image
                  src="/testimonial2.jpg"
                  alt="Mike"
                  width={48}
                  height={48}
                  className="rounded-full"
                />
                <div className="ml-4">
                  <div className="text-white font-semibold">Mike Chen</div>
                  <div className="text-gray-400">YouTuber</div>
                </div>
              </div>
              <p className="text-gray-300">
                "The AI-generated articles and social media posts are incredibly well-written. 
                This tool is a game-changer!"
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
